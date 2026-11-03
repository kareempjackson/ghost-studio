import type { NextRequest } from "next/server";
import { GET as report } from "sanity-plugin-analytics/api/analytics";
import { KEYS_PLACE, fail, forward, googleEnv, refuseUnlessReader, reportSettings } from "@/lib/studio-reports";

/**
 * The Studio's GA4 tab (sanity/analytics.tsx): the property in Site settings
 * › Tracking, read as the service account in Analytics keys, for an editor
 * only.
 */
export async function GET(request: NextRequest) {
  const refusal = await refuseUnlessReader(request, "text");
  if (refusal) return refusal;
  const { gaPropertyId, google } = await reportSettings();
  if (!google) return fail(503, `Paste the Google service account key into ${KEYS_PLACE}`, "text");
  if (!gaPropertyId) return fail(503, "Add the Google Analytics property ID in Site settings › Tracking", "text");
  return forward(request, report, { set: { propertyId: gaPropertyId }, env: googleEnv(google) });
}
