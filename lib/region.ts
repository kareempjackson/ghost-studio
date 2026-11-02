/**
 * Ghost Savvy Studios — where a visitor is.
 *
 * Vercel locates each request in a country, and /api/region tells this
 * visitor's browser two things from it: whether they must be asked before
 * analytics cookies are set (lib/consent.ts), and the country itself, which
 * the home page reads as one of the parts of the world the studio works in
 * (lib/moments.ts). One request a page load answers both. The country is
 * never stored, and never finer than a country.
 */

/** The parts of the world the studio works in, as the home page names them. */
export type Region = "caribbean" | "north-america" | "latin-america" | "europe";

export const REGIONS: readonly { readonly value: Region; readonly title: string; readonly name: string }[] = [
  { value: "caribbean", title: "The Caribbean", name: "the Caribbean" },
  { value: "north-america", title: "North America", name: "North America" },
  { value: "latin-america", title: "Latin America", name: "Latin America" },
  { value: "europe", title: "Europe", name: "Europe" },
];

/*
 * ISO country codes. The Caribbean is the islands and the mainland members
 * of CARICOM (Belize, Guyana, Suriname), as clients there count themselves;
 * Mexico is Latin America.
 */
const COUNTRIES: Record<Region, readonly string[]> = {
  caribbean: [
    "AG", "AI", "AW", "BB", "BL", "BM", "BQ", "BS", "BZ", "CU", "CW", "DM", "DO", "GD", "GP",
    "GY", "HT", "JM", "KN", "KY", "LC", "MF", "MQ", "MS", "PR", "SR", "SX", "TC", "TT", "VC",
    "VG", "VI",
  ],
  "north-america": ["US", "CA"],
  "latin-america": [
    "MX", "GT", "HN", "SV", "NI", "CR", "PA", "CO", "VE", "EC", "PE", "BO", "BR", "PY", "UY",
    "AR", "CL",
  ],
  europe: [
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT",
    "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO",
    "GB", "CH", "AD", "AL", "BA", "FO", "GG", "GI", "IM", "JE", "MC", "MD", "ME", "MK", "RS",
    "SM", "UA", "VA", "XK",
  ],
};

const REGION_OF = new Map(
  (Object.entries(COUNTRIES) as [Region, readonly string[]][]).flatMap(([region, codes]) =>
    codes.map((code) => [code, region] as const),
  ),
);

/** The part of the world a country is in, of those the studio works in. */
export const regionOf = (country: string | null | undefined): Region | undefined =>
  country ? REGION_OF.get(country.toUpperCase()) : undefined;

/** How the home page names a region in a sentence, e.g. "the Caribbean". */
export const regionName = (region: Region) => REGIONS.find((one) => one.value === region)!.name;

/* ---- In the browser ------------------------------------------------------- */

export interface Whereabouts {
  /** Whether they must be asked before analytics cookies are set. */
  readonly consentRequired: boolean;
  /** Their country, as an ISO code, when Vercel could tell. */
  readonly country?: string;
}

let asking: Promise<Whereabouts> | null = null;

/** Where this visitor is, asked once a page load. If it can't be told, they are asked about cookies. */
export function whereFrom(): Promise<Whereabouts> {
  asking ??= fetch("/api/region")
    .then((response) => response.json() as Promise<{ consentRequired?: boolean; country?: unknown }>)
    .then((body) => ({
      consentRequired: body.consentRequired !== false,
      country: typeof body.country === "string" && /^[A-Z]{2}$/.test(body.country) ? body.country : undefined,
    }))
    .catch(() => ({ consentRequired: true }));
  return asking;
}
