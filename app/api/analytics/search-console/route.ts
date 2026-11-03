import type { NextRequest } from "next/server";
import { GET as report, POST as submit } from "sanity-plugin-analytics/api/search-console";
import { KEYS_PLACE, fail, forward, googleEnv, refuseUnlessReader, reportSettings } from "@/lib/studio-reports";

/**
 * The Studio's Search Console tab and each page's SEO view
 * (sanity/analytics.tsx): the property in Site settings › Tracking, or the
 * site's address, read as the service account in Analytics keys, for an
 * editor only.
 */
async function handle(request: NextRequest, handler: typeof report) {
  const refusal = await refuseUnlessReader(request, "text");
  if (refusal) return refusal;
  const { searchConsoleProperty, google } = await reportSettings();
  if (!google) return fail(503, `Paste the Google service account key into ${KEYS_PLACE}`, "text");
  return forward(request, handler, { set: { siteUrl: searchConsoleProperty }, env: googleEnv(google) });
}

export const GET = (request: NextRequest) => handle(request, report);

/** Submits a sitemap again, from the tab's Sitemaps list. */
export const POST = (request: NextRequest) => handle(request, submit);
