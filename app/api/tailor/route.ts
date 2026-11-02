import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "next-sanity";
import { NextResponse, type NextRequest } from "next/server";
import { refuseUnlessEditor } from "@/lib/studio-auth";
import {
  AUDIENCES_QUERY,
  INSIGHT_SOURCE,
  PROJECT_SOURCE,
  insightText,
  projectText,
  sourceHash,
  tailorInsight,
  tailorProject,
  tailoredValue,
  type Audience,
  type InsightSource,
  type ProjectSource,
  type Stored,
} from "@/lib/tailor";
import { apiVersion, dataset, projectId } from "@/sanity/env";

/** Claude takes a while over a whole case study. */
export const maxDuration = 120;

/**
 * Tailor with AI, for the document open in the Studio (lib/tailor.ts):
 * reads it as the editor has it, draft and all, and hands back what its For
 * each audience tab should hold, for the Studio to put in the draft. Only
 * an editor may ask, as themselves: their token reads the draft.
 */
export async function POST(request: NextRequest) {
  const refusal = await refuseUnlessEditor(request, "tailor documents");
  if (refusal) return refusal;
  if (!process.env.ANTHROPIC_API_KEY) return new NextResponse("Tailor with AI needs ANTHROPIC_API_KEY", { status: 503 });

  const { id, type } = (await request.json().catch(() => ({}))) as { id?: string; type?: string };
  if (!id || (type !== "project" && type !== "article")) return new NextResponse("Send a project or an insight", { status: 400 });

  const token = request.headers.get("authorization")!.replace(/^Bearer\s+/i, "");
  const sanity = createClient({ projectId, dataset, apiVersion, token, useCdn: false, perspective: "drafts" });
  const [doc, audiences] = await Promise.all([
    sanity.fetch<((ProjectSource & InsightSource) & { tailored?: Stored | null }) | null>(
      `*[_id == $id][0]${type === "project" ? PROJECT_SOURCE : INSIGHT_SOURCE}`,
      { id: id.replace(/^drafts\./, "") },
    ),
    sanity.fetch<Audience[] | null>(AUDIENCES_QUERY),
  ]);
  if (!doc) return new NextResponse("Save the document first", { status: 404 });
  if (!audiences?.length) return new NextResponse("Who we serve lists no audiences", { status: 409 });
  if (doc.tailored?.keep) return new NextResponse("Keep my edits is on: turn it off to write again", { status: 409 });

  const claude = new Anthropic();
  try {
    const text = type === "project" ? projectText(doc) : insightText(doc);
    const written =
      type === "project" ? await tailorProject(claude, doc, audiences) : await tailorInsight(claude, doc, audiences);
    return NextResponse.json({ tailored: tailoredValue(written, audiences, sourceHash(text, audiences)) });
  } catch (error) {
    const busy = error instanceof Anthropic.RateLimitError || (error instanceof Anthropic.APIError && error.status >= 500);
    return new NextResponse(busy ? "Claude is busy. Try again in a minute." : (error as Error).message, {
      status: busy ? 503 : 500,
    });
  }
}
