import { CONSENT_COUNTRIES } from "@/lib/analytics";

const asked = new Set<string>(CONSENT_COUNTRIES);

/**
 * Where this visitor is (lib/region.ts): the country Vercel locates them in,
 * and from it whether they must be asked before analytics cookies are set
 * (lib/consent.ts), yes in the EEA, the UK and Switzerland. Without a
 * country they are asked. In `next dev`, which has no country, GS_DEV_COUNTRY
 * in .env.local stands in for one. For this visitor only: never cached.
 */
export function GET(request: Request) {
  const country = (
    request.headers.get("x-vercel-ip-country") ??
    (process.env.NODE_ENV === "development" ? process.env.GS_DEV_COUNTRY : undefined)
  )
    ?.trim()
    .toUpperCase();
  return Response.json(
    { consentRequired: !country || asked.has(country), ...(country ? { country } : {}) },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
