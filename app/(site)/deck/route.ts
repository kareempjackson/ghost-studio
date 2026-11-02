import { stegaClean } from "next-sanity";
import { getSettings } from "@/sanity/content";

/**
 * /deck: the credentials deck, from Site settings › Calls and credentials,
 * downloaded under its own file name (Sanity's `?dl=`). Any button or link
 * can point here, and a new deck replaces the old one everywhere at once;
 * each click is counted as `deck_download`
 * (app/(site)/_components/Tracking.tsx). Without a deck, the contact page.
 */
export async function GET(request: Request) {
  const { deck } = await getSettings();
  if (!deck?.url) return Response.redirect(new URL("/contact", request.url), 307);
  const file = new URL(stegaClean(deck.url));
  file.searchParams.set("dl", stegaClean(deck.originalFilename ?? "") || "ghost-savvy-studios-credentials.pdf");
  return Response.redirect(file, 307);
}
