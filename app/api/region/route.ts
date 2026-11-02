import { CONSENT_COUNTRIES } from "@/lib/analytics";

const asked = new Set<string>(CONSENT_COUNTRIES);

/**
 * Whether this visitor must be asked before analytics cookies are set
 * (lib/consent.ts): yes in the EEA, the UK and Switzerland, from the country
 * Vercel locates them in. Without a country, as in `next dev`, they are
 * asked. For this visitor only: never cached.
 */
export function GET(request: Request) {
  const country = request.headers.get("x-vercel-ip-country")?.toUpperCase();
  return Response.json(
    { consentRequired: !country || asked.has(country) },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
