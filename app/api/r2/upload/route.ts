import { NextResponse, type NextRequest } from "next/server";
import { CACHE_CONTROL, listFilms, publicUrl, safeName, signedPut, videoKey } from "@/lib/r2";
import { refuseUnlessEditor } from "../editor";

/** Larger than any reel the site should ship; R2 takes up to 5 GB a PUT. */
const MAX_BYTES = 1024 * 1024 * 1024;

/**
 * Hands the Studio a signed URL to PUT one film straight to R2, so the file
 * never passes through this server. Only an editor gets one (see editor.ts).
 *
 * A file already in the bucket, by name and size, is not sent again: the
 * Studio gets that copy back instead.
 */
export async function POST(request: NextRequest) {
  const refusal = await refuseUnlessEditor(request);
  if (refusal) return refusal;

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

  /* Only a shortcut: if the bucket cannot be listed, upload as before. */
  const name = safeName(filename);
  const films = await listFilms().catch(() => []);
  const same = films.find(({ video }) => video.filename === name && video.size === size);
  if (same) return NextResponse.json({ existing: same.video });

  const key = videoKey(filename);
  return NextResponse.json({
    key,
    url: publicUrl(key),
    uploadUrl: await signedPut(key, contentType),
    /* Signed into the URL, so the PUT must send them as they are. */
    headers: { "Content-Type": contentType, "Cache-Control": CACHE_CONTROL },
  });
}
