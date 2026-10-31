import { createHmac, timingSafeEqual } from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import type {
  BetaContentBlock,
  BetaContentBlockParam,
  BetaMessageParam,
  BetaTool,
  BetaToolUseBlock,
} from "@anthropic-ai/sdk/resources/beta/messages";
import { getGrounding, type Grounding } from "@/lib/guide/corpus";
import { GUIDE_PROMPT, MAX_PICKS } from "@/lib/guide/prompt";
import {
  MAX_QUESTION,
  MAX_TURNS,
  type GuideBrief,
  type GuideContext,
  type GuideError,
  type GuideEvent,
  type GuidePick,
  type GuideRequest,
  type SealedTurn,
} from "@/lib/guide/protocol";
import { OTHER, UNSURE } from "@/lib/guide/shortlist";
import { SITE_URL } from "@/lib/site";

/** An answer is short; this is the ceiling on one, its thinking included. */
export const maxDuration = 60;

const MODEL = "claude-opus-5-5";
/** Thinking plus the answer and its tool calls: an answer is a few sentences. */
const MAX_TOKENS = 4096;
/** The largest request: the sealed turns carry the model's own blocks, which are not small. */
const MAX_BODY = 512 * 1024;
/** Questions one address may ask in a minute, on this instance: Vercel's firewall is the real limit. */
const PER_MINUTE = 10;

const key = process.env.ANTHROPIC_API_KEY;
const client = key ? new Anthropic({ apiKey: key }) : null;
/** What the turns are sealed with. GUIDE_SECRET if set; otherwise the API key, which is as private. */
const secret = process.env.GUIDE_SECRET || key || "";

const seal = (raw: string) => createHmac("sha256", secret).update(raw).digest("base64url");

function sealed(turn: SealedTurn) {
  if (typeof turn?.raw !== "string" || typeof turn?.seal !== "string") return false;
  const want = Buffer.from(seal(turn.raw));
  const got = Buffer.from(turn.seal);
  return want.length === got.length && timingSafeEqual(want, got);
}

/* ---- Abuse ----------------------------------------------------------------- */

const recent = new Map<string, number[]>();

/** Whether this address has asked too often in the last minute. Per instance, so best effort. */
function tooMany(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const now = Date.now();
  const times = (recent.get(ip) ?? []).filter((time) => now - time < 60_000);
  times.push(now);
  recent.set(ip, times);
  if (recent.size > 5000) recent.clear();
  return times.length > PER_MINUTE;
}

/** A browser on this site: its Origin is the site's, or the address the request came in at. */
function fromTheSite(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  return origin === new URL(SITE_URL).origin || origin === new URL(request.url).origin;
}

/* ---- The request ----------------------------------------------------------- */

const PATH = /^\/[a-z0-9\-/]{0,120}$/;

/**
 * Where the visitor is, as the model is told it: every path checked against
 * the pages the guide knows, so nothing a visitor typed into the request
 * reaches the model as the studio's own word.
 */
function contextNote(context: GuideContext, grounding: Grounding) {
  const { cards, audiences, needs } = grounding.catalogue;
  const known = (path: unknown): path is string => typeof path === "string" && (path === "/" || path in cards);
  const name = (path: string) => (path === "/" ? "the home page" : `${cards[path].title} (${path})`);
  const paths = (list: unknown, last: number) =>
    (Array.isArray(list) ? list : []).filter(known).slice(-last).map(name).join(", ");

  const here =
    known(context?.path)
      ? `The visitor has ${name(context.path)} open.`
      : typeof context?.path === "string" && PATH.test(context.path)
        ? `The visitor has ${context.path} open.`
        : "";
  const profile = context?.profile;
  const audience =
    profile?.audience === OTHER
      ? "someone the site's audiences don't describe"
      : audiences.find((one) => one.slug === profile?.audience)?.name;
  const need =
    profile?.need === UNSURE ? "not sure yet" : needs.find((one) => one.key === profile?.need)?.label;
  const shown = paths(context?.shown, 24);
  const read = paths(context?.visited, 12);

  return [
    here,
    audience && `Who the work is for: ${audience}.`,
    need && `What they need: ${need}.`,
    shown && `Already shown to them: ${shown}.`,
    read && `Read in this tab: ${read}.`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** The two tools, their choices drawn from the site: the pages it may point to, the form's options. */
function tools(grounding: Grounding): BetaTool[] {
  const paths = Object.keys(grounding.catalogue.cards).sort();
  return [
    {
      name: "show_picks",
      description: `Show the visitor up to ${MAX_PICKS} pages from the site as cards under your answer, each with a short reason it fits them.`,
      strict: true,
      eager_input_streaming: true,
      input_schema: {
        type: "object",
        properties: {
          picks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: { type: "string", enum: paths, description: "A page marked (page: ...) in <site>." },
                why: { type: "string", description: "Why this page, for them, in under 12 words." },
              },
              required: ["path", "why"],
              additionalProperties: false,
            },
          },
        },
        required: ["picks"],
        additionalProperties: false,
      },
    },
    {
      name: "offer_brief",
      description:
        "Draft the brief the visitor can check, add their name and email to, and send to the team.",
      strict: true,
      eager_input_streaming: true,
      input_schema: {
        type: "object",
        properties: {
          summary: {
            type: "string",
            description: "Two to four sentences, in the first person, as the visitor would put it.",
          },
          help: {
            type: "array",
            items: grounding.help.length ? { type: "string", enum: [...grounding.help] } : { type: "string" },
            description: "What they want help with, from the contact form's options.",
          },
        },
        required: ["summary", "help"],
        additionalProperties: false,
      },
    },
  ];
}

/** The answer to a tool call the panel has already acted on: it drew the cards, or put up the brief. */
const toolResult = (block: BetaToolUseBlock): BetaContentBlockParam => ({
  type: "tool_result",
  tool_use_id: block.id,
  content: block.name === "offer_brief" ? "The draft brief is in front of the visitor." : "Shown to the visitor.",
});

/**
 * The answer as it is kept for the next question. After a fallback that
 * took over mid-answer, the declined model's thinking and tool calls before
 * the last switch are left out, as the API asks; everything else is kept as
 * it came.
 */
function forReplay(content: readonly BetaContentBlock[]): BetaContentBlock[] {
  let last = -1;
  content.forEach((block, i) => {
    if (block.type === "fallback") last = i;
  });
  if (last < 0) return [...content];
  const internal = new Set(["thinking", "redacted_thinking", "tool_use", "server_tool_use"]);
  return content.filter((block, i) => i > last || !internal.has(block.type));
}

/* ---- The tools' calls, checked --------------------------------------------- */

function picksFrom(blocks: readonly BetaToolUseBlock[], grounding: Grounding): GuidePick[] {
  const picks: GuidePick[] = [];
  for (const block of blocks) {
    if (block.name !== "show_picks") continue;
    const list = (block.input as { picks?: unknown })?.picks;
    for (const pick of Array.isArray(list) ? list : []) {
      const card = typeof pick?.path === "string" ? grounding.catalogue.cards[pick.path] : undefined;
      const why = typeof pick?.why === "string" ? pick.why.replace(/\s+/g, " ").trim().slice(0, 120) : "";
      if (card && !picks.some((one) => one.card.path === card.path)) picks.push({ card, why });
    }
  }
  return picks.slice(0, MAX_PICKS);
}

function briefFrom(blocks: readonly BetaToolUseBlock[], grounding: Grounding): GuideBrief | null {
  const block = blocks.findLast((one) => one.name === "offer_brief");
  const input = block?.input as { summary?: unknown; help?: unknown } | undefined;
  const summary = typeof input?.summary === "string" ? input.summary.trim().slice(0, 1500) : "";
  if (!summary) return null;
  const options = new Set(grounding.help);
  const help = (Array.isArray(input?.help) ? input.help : []).filter(
    (one): one is string => typeof one === "string" && options.has(one),
  );
  return { summary, help: [...new Set(help)] };
}

/* ---- The route ------------------------------------------------------------- */

const encoder = new TextEncoder();
const line = (event: GuideEvent) => encoder.encode(`${JSON.stringify(event)}\n`);
const refuse = (error: GuideError, status: number) =>
  new Response(JSON.stringify({ t: "error", v: error } satisfies GuideEvent), {
    status,
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });

/** Why the API could not answer, as the panel says it. */
function reason(error: unknown): GuideError {
  if (error instanceof Anthropic.RateLimitError) return "busy";
  if (error instanceof Anthropic.APIError && (error.status === 529 || error.status === 503)) return "busy";
  return "failed";
}

/**
 * The site guide's answers (app/(site)/_components/ChatPanel.tsx).
 *
 * One question at a time, answered by Claude from the site's own content
 * (lib/guide/corpus.ts) under the studio's voice (lib/guide/prompt.ts),
 * streamed back as it is written (lib/guide/protocol.ts). Nothing is stored:
 * the conversation lives in the visitor's tab, sealed turn by turn, and
 * reaches the studio only if they send it as a brief.
 *
 * Off without ANTHROPIC_API_KEY, when the panel offers the shortlist and the
 * brief alone. Open only to the site's own pages, and limited per address; a
 * Vercel firewall rule on this path and a spend limit on the Anthropic
 * workspace are what actually cap the cost.
 */
export async function POST(request: Request) {
  if (!client) return refuse("off", 503);
  if (!fromTheSite(request)) return refuse("failed", 403);
  if (tooMany(request)) return refuse("busy", 429);

  const text = await request.text();
  if (text.length > MAX_BODY) return refuse("limit", 413);
  let body: GuideRequest;
  try {
    body = JSON.parse(text);
  } catch {
    return refuse("failed", 400);
  }

  const question = typeof body?.question === "string" ? body.question.trim() : "";
  const turns = Array.isArray(body?.turns) ? body.turns : [];
  if (!question || question.length > MAX_QUESTION) return refuse("failed", 400);
  if (turns.length >= MAX_TURNS) return refuse("limit", 400);
  if (!turns.every(sealed)) return refuse("failed", 400);

  const history: BetaMessageParam[] = turns.flatMap((turn) => JSON.parse(turn.raw) as BetaMessageParam[]);
  const grounding = await getGrounding();

  /* A tool call is answered before the next question: the panel acted on it. */
  const last = history.at(-1);
  const pending =
    last?.role === "assistant" && Array.isArray(last.content)
      ? (last.content.filter((block) => block.type === "tool_use") as BetaToolUseBlock[])
      : [];
  const asked: BetaMessageParam[] = [
    { role: "user", content: [...pending.map(toolResult), { type: "text", text: question }] },
  ];
  const note = contextNote(body.context, grounding);
  if (note) asked.push({ role: "system", content: note });

  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    betas: ["server-side-fallback-2026-07-01", "thinking-binding-controls-2026-08-01"],
    fallbacks: "default",
    /* An edit published in the Studio mid-conversation changes the site the
       earlier answers were given under: drop their thinking, don't fail. */
    thinking: { type: "adaptive", block_binding: { prefix_mismatch_behavior: "drop_block" } },
    output_config: { effort: "low" },
    cache_control: { type: "ephemeral" },
    system: [
      { type: "text", text: GUIDE_PROMPT },
      {
        type: "text",
        text: `<site>\n${grounding.text}\n</site>`,
        cache_control: { type: "ephemeral", ttl: "1h" },
      },
    ],
    tools: tools(grounding),
    messages: [...history, ...asked],
  });

  const answer = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: GuideEvent) => controller.enqueue(line(event));
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            send({ t: "text", v: event.delta.text });
          }
        }
        const message = await stream.finalMessage();
        if (process.env.NODE_ENV !== "production") {
          console.info("[guide]", message.stop_reason, message.usage, message.input_transformations ?? []);
        }
        if (message.stop_reason === "refusal") {
          send({ t: "error", v: "declined" });
          return;
        }

        const content = forReplay(message.content);
        /* A tool call cut off by the token ceiling is not acted on. */
        const calls = (content.filter((block) => block.type === "tool_use") as BetaToolUseBlock[]).filter(
          () => message.stop_reason !== "max_tokens",
        );
        const picks = picksFrom(calls, grounding);
        if (picks.length) send({ t: "picks", v: picks });
        const brief = briefFrom(calls, grounding);
        if (brief) send({ t: "brief", v: brief });

        const raw = JSON.stringify([...asked, { role: "assistant", content }]);
        send({ t: "turn", v: { raw, seal: seal(raw) } });
        send({ t: "done" });
      } catch (error) {
        console.error("[guide] the answer failed", error);
        send({ t: "error", v: reason(error) });
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(answer, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
