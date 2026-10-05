import { revalidateTag } from "next/cache";
import { parseBody } from "next-sanity/webhook";
import { NextResponse, type NextRequest } from "next/server";

/**
 * The backstop for Sanity Live. Live expires cached content as soon as a
 * visitor's browser hears of a change; this expires it whether or not anyone
 * is on the site. Point a GROQ webhook on sanity.io/manage at
 * /api/revalidate, on create, update and delete, with the projection
 * `{_type}` and SANITY_REVALIDATE_SECRET as its secret.
 *
 * Every query is tagged with the document types it reads (see
 * sanity/content.ts), so expiring a type refreshes every page showing it.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return new NextResponse("SANITY_REVALIDATE_SECRET is not set", { status: 500 });
  }

  const { isValidSignature, body } = await parseBody<{ _type?: string }>(
    request,
    secret,
    true,
  );
  if (!isValidSignature) {
    return new NextResponse("Invalid signature", { status: 401 });
  }
  if (!body?._type) {
    return new NextResponse("Missing _type", { status: 400 });
  }

  revalidateTag(body._type, { expire: 0 });
  return NextResponse.json({ revalidated: body._type });
}
