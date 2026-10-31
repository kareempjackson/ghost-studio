/**
 * Pages as Markdown, for agents: an insight or a case study without the
 * header, the footer and the motion around it, at a fraction of the tokens.
 *
 * Each is served at its page's address plus .md, and at the address itself
 * to a client that asks for text/markdown (next.config.ts rewrites both to
 * app/md). /llms.txt links to them.
 */

import "server-only";

import { stegaClean } from "next-sanity";
import { absoluteUrl } from "./site";

type Span = { readonly _type: string; readonly text?: string; readonly marks?: readonly string[] };

/** A Portable Text block, or an image block as the article query projects it. */
type Block = {
  readonly _type: string;
  readonly style?: string;
  readonly listItem?: string;
  readonly level?: number;
  readonly children?: readonly Span[];
  readonly markDefs?: readonly { readonly _key: string; readonly _type: string; readonly href?: string }[];
  readonly src?: string | null;
  readonly video?: string | null;
  readonly alt?: string | null;
  readonly caption?: string | null;
};

/** The marks Markdown can say, by what opens and closes them. Underline it cannot: its words stand plain. */
const DECORATORS: Record<string, readonly [string, string]> = {
  strong: ["**", "**"],
  em: ["_", "_"],
  code: ["`", "`"],
  "strike-through": ["~~", "~~"],
};

const HEADINGS: Record<string, number> = { h2: 2, h3: 3, h4: 4 };

/**
 * A block's words, with their marks and links. A mark running over several
 * spans opens once around all of them, and the longest-running opens first,
 * so the marks nest as Markdown needs them to.
 */
export function inline(block: Pick<Block, "children" | "markDefs">): string {
  const spans = block.children ?? [];
  const links = new Map(
    (block.markDefs ?? []).filter((def) => def._type === "link").map((def) => [def._key, def.href ?? ""]),
  );
  /* A link on the site, made whole: the copy is read away from the page. */
  const wrap = (mark: string): readonly [string, string] => {
    if (DECORATORS[mark]) return DECORATORS[mark];
    const href = stegaClean(links.get(mark) ?? "");
    return href ? ["[", `](${href.startsWith("/") ? absoluteUrl(href) : href})`] : ["", ""];
  };
  /** How many spans in a row, from this one, carry the mark. */
  const run = (mark: string, from: number) => {
    let n = 0;
    while (spans[from + n]?.marks?.includes(mark)) n++;
    return n;
  };

  let out = "";
  let open: string[] = [];
  spans.forEach((span, at) => {
    const marks = span.marks ?? [];
    /* Close, innermost first, back to the first open mark this span drops. */
    const drop = open.findIndex((mark) => !marks.includes(mark));
    if (drop >= 0) {
      for (const mark of open.slice(drop).reverse()) out += wrap(mark)[1];
      open = open.slice(0, drop);
    }
    const fresh = marks.filter((mark) => !open.includes(mark)).sort((a, b) => run(b, at) - run(a, at));
    for (const mark of fresh) out += wrap(mark)[0];
    open.push(...fresh);
    out += span.text ?? "";
  });
  for (const mark of open.reverse()) out += wrap(mark)[1];
  return out;
}

/**
 * Portable Text as Markdown: paragraphs, headings, quotes, lists nested by
 * level, and pictures by their alt text and caption. `depth` sets every
 * heading lower, for a body that sits under a heading of its own: at 2, a
 * Heading 2 is written ####.
 */
export function toMarkdown(value: readonly Block[] | null | undefined, depth = 0): string {
  const parts: { text: string; item: boolean }[] = [];
  /* Where each level of the list in progress has counted to. */
  let counts: { kind: string; n: number }[] = [];

  for (const block of value ?? []) {
    if (block._type === "block" && block.listItem) {
      const level = Math.max(1, block.level ?? 1);
      counts = counts.slice(0, level);
      const above = counts[level - 1];
      const n = above?.kind === block.listItem ? above.n + 1 : 1;
      counts[level - 1] = { kind: block.listItem, n };
      const marker = block.listItem === "number" ? `${n}.` : "-";
      const text = inline(block).replace(/\s*\n\s*/g, " ").trim();
      parts.push({ text: `${"    ".repeat(level - 1)}${marker} ${text}`, item: true });
      continue;
    }
    counts = [];

    if (block._type === "block") {
      const text = inline(block).trim();
      if (!text) continue;
      const heading = HEADINGS[block.style ?? ""];
      parts.push({
        text: heading
          ? `${"#".repeat(Math.min(6, heading + depth))} ${text.replace(/\s*\n\s*/g, " ")}`
          : block.style === "blockquote"
            ? text.split("\n").map((line) => `> ${line}`).join("\n")
            : text,
        item: false,
      });
    } else if (block._type === "image" && (block.src || block.video)) {
      const alt = block.alt ?? "";
      const picture = block.src
        ? `![${alt}](${block.src})`
        : `[Film${alt ? `: ${alt}` : ""}](${block.video})`;
      parts.push({ text: block.caption ? `${picture}\n_${block.caption}_` : picture, item: false });
    }
  }

  /* A blank line between blocks; a list's items one under the other. */
  return parts
    .map((part, i) => (i === 0 ? "" : part.item && parts[i - 1].item ? "\n" : "\n\n") + part.text)
    .join("");
}

/**
 * Markdown as a response. The page stays the original: the canonical link
 * sends search engines to it, so this copy is never indexed in its place.
 * Clean of edit marks, which in draft mode ride on every string.
 */
export function markdownResponse(markdown: string, path: string) {
  return new Response(`${stegaClean(markdown).trim()}\n`, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Link: `<${absoluteUrl(path)}>; rel="canonical"`,
    },
  });
}
