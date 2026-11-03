import type { NextRequest } from "next/server";
import { GET as test } from "sanity-plugin-analytics/api/pagespeed";
import { SITE_URL } from "@/lib/site";
import { KEYS_PLACE, fail, forward, refuseUnlessReader, reportSettings } from "@/lib/studio-reports";

/** PageSpeed takes a few seconds a page, and longer on mobile. */
export const maxDuration = 60;

/**
 * The Studio's Lighthouse tab and each page's SEO view
 * (sanity/analytics.tsx): Google's PageSpeed test of one of the site's own
 * pages, on the key in Analytics keys, for an editor only. Without a key
 * of its own a test shares Google's free quota, which is usually used up.
 */
export async function GET(request: NextRequest) {
  const refusal = await refuseUnlessReader(request, "google");
  if (refusal) return refusal;

  const site = new URL(SITE_URL);
  if (["localhost", "127.0.0.1"].includes(site.hostname)) {
    return fail(409, "Lighthouse tests the live site: run it from the Studio at the site's own address", "google");
  }
  const asked = request.nextUrl.searchParams.get("url") ?? "";
  if (!URL.canParse(asked) || new URL(asked).origin !== site.origin)
    return fail(400, `Lighthouse tests pages on ${site.origin} only`, "google");

  const { pagespeedKey } = await reportSettings();
  if (!pagespeedKey) return fail(503, `Paste the PageSpeed API key into ${KEYS_PLACE}`, "google");
  return forward(request, test, { env: { PAGESPEED_API_KEY: pagespeedKey } });
}
