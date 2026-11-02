import { NextResponse, type NextRequest } from "next/server";
import { listFilms } from "@/lib/r2";
import { refuseUnlessEditor } from "@/lib/studio-auth";

/**
 * The films already in the bucket, for the Studio's library: an editor picks
 * one there instead of uploading the same file again.
 */
export async function GET(request: NextRequest) {
  const refusal = await refuseUnlessEditor(request, "change films");
  if (refusal) return refusal;
  return NextResponse.json({ films: await listFilms() });
}
