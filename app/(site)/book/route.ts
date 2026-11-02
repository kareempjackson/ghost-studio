import { stegaClean } from "next-sanity";
import { getSettings } from "@/sanity/content";

/**
 * /book: the studio's booking page, from Site settings › Calls and
 * credentials. Any button or link can point here, and the page it leads to
 * changes in one place; each click is counted as `booking_opened`
 * (app/(site)/_components/Tracking.tsx). Without a booking page, the
 * contact page.
 */
export async function GET(request: Request) {
  const { bookingUrl } = await getSettings();
  const to = bookingUrl ? stegaClean(bookingUrl) : "";
  return Response.redirect(/^https:\/\//.test(to) ? to : new URL("/contact", request.url), 307);
}
