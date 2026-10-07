import { NextResponse, type NextRequest } from "next/server";
import { CACHE_CONTROL, publicUrl, signedPut, videoKey } from "@/lib/r2";
import { apiVersion, projectId } from "@/sanity/env";

/** Larger than any reel the site should ship; R2 takes up to 5 GB a PUT. */
const MAX_BYTES = 1024 * 1024 * 1024;

/**
 * Hands the Studio a signed URL to PUT one film straight to R2, so the file
 * never passes through this server. Only someone signed in to the Studio
 * with more than read access gets one: the request carries their Sanity
 * token, and Sanity says who it belongs to and what they may do.
 */
export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return new NextResponse("Sign in to the Studio", { status: 401 });

  const me = await fetch(`https://${projectId}.api.sanity.io/v${apiVersion}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const user = me.ok ? ((await me.json()) as { id?: string; roles?: { name: string }[] }) : null;
  if (!user?.id) return new NextResponse("Sign in to the Studio", { status: 401 });
  if (!user.roles?.some((role) => role.name !== "viewer")) {
    return new NextResponse("Your role cannot upload", { status: 403 });
  }

  const { filename, contentType, size } = (await request.json().catch(() => ({}))) as {
    filename?: string;
    contentType?: string;
    size?: number;
  };
  if (!filename || !contentType?.startsWith("video/")) {
    return new NextResponse("Send a video file", { status: 400 });
  }
  if (!size || size > MAX_BYTES) {
    return new NextResponse("Films must be under 1 GB", { status: 413 });
  }

  const key = videoKey(filename);
  return NextResponse.json({
    key,
    url: publicUrl(key),
    uploadUrl: await signedPut(key, contentType),
    /* Signed into the URL, so the PUT must send them as they are. */
    headers: { "Content-Type": contentType, "Cache-Control": CACHE_CONTROL },
  });
}
