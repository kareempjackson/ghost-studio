import { draftMode } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

/** Leaves draft mode and goes back to the page the editor was on. */
export async function POST(request: NextRequest) {
  (await draftMode()).disable();
  const back = request.nextUrl.searchParams.get("redirect") || "/";
  return NextResponse.redirect(new URL(back.startsWith("/") ? back : "/", request.url), 303);
}
