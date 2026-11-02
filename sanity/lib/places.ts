/**
 * Where a project was, read from its Location as written on the card
 * ("Kingston, Jamaica", "Eastern Caribbean"): the region and the countries
 * the home page leads with for visitors from there (lib/region.ts). For the
 * seed and `npm run migrate:moments`, which fill Project › Region and
 * Countries where they are empty. A location it can't read gives nothing,
 * and an editor sets the two by hand.
 */

import { regionOf, type Region } from "../../lib/region";

/** Names a location may give a country by, longest first so "Dominican Republic" isn't read as Dominica. */
const COUNTRY_NAMES: readonly [string, string][] = (
  [
    ["trinidad and tobago", "TT"], ["trinidad", "TT"], ["tobago", "TT"], ["port of spain", "TT"],
    ["jamaica", "JM"], ["kingston", "JM"], ["montego bay", "JM"],
    ["barbados", "BB"], ["bridgetown", "BB"],
    ["grenada", "GD"], ["bahamas", "BS"], ["nassau", "BS"], ["guyana", "GY"], ["georgetown", "GY"],
    ["saint lucia", "LC"], ["st lucia", "LC"], ["st. lucia", "LC"],
    ["antigua", "AG"], ["dominican republic", "DO"], ["dominica", "DM"],
    ["saint vincent", "VC"], ["st vincent", "VC"], ["st. vincent", "VC"],
    ["saint kitts", "KN"], ["st kitts", "KN"], ["st. kitts", "KN"],
    ["cayman", "KY"], ["belize", "BZ"], ["haiti", "HT"], ["puerto rico", "PR"], ["suriname", "SR"],
    ["bermuda", "BM"], ["turks and caicos", "TC"], ["curaçao", "CW"], ["curacao", "CW"], ["aruba", "AW"],
    ["united states", "US"], ["usa", "US"], ["new york", "US"], ["miami", "US"], ["florida", "US"],
    ["california", "US"], ["atlanta", "US"], ["washington", "US"],
    ["las vegas", "US"], ["chicago", "US"], ["los angeles", "US"], ["boston", "US"], ["houston", "US"],
    ["dallas", "US"],
    /* The states, as a location names one: "Lawrenceville, Georgia" is the state, not the country. */
    ...[
      "alabama", "alaska", "arizona", "arkansas", "colorado", "connecticut", "delaware", "georgia",
      "hawaii", "idaho", "illinois", "indiana", "iowa", "kansas", "kentucky", "louisiana", "maine",
      "maryland", "massachusetts", "michigan", "minnesota", "mississippi", "missouri", "montana",
      "nebraska", "nevada", "new hampshire", "new jersey", "new mexico", "north carolina",
      "north dakota", "ohio", "oklahoma", "oregon", "pennsylvania", "rhode island", "south carolina",
      "south dakota", "tennessee", "texas", "utah", "vermont", "virginia", "west virginia",
      "wisconsin", "wyoming",
    ].map((state) => [state, "US"]),
    ["canada", "CA"], ["toronto", "CA"], ["montreal", "CA"], ["vancouver", "CA"], ["ontario", "CA"],
    ["quebec", "CA"], ["british columbia", "CA"], ["alberta", "CA"],
    ["united kingdom", "GB"], ["uk", "GB"], ["england", "GB"], ["scotland", "GB"], ["wales", "GB"], ["london", "GB"],
    ["ireland", "IE"], ["germany", "DE"], ["france", "FR"], ["netherlands", "NL"], ["spain", "ES"],
    ["mexico", "MX"], ["brazil", "BR"], ["colombia", "CO"],
  ] as [string, string][]
).sort((a, b) => b[0].length - a[0].length);

const REGION_WORDS: readonly [RegExp, Region][] = [
  [/caribbean/i, "caribbean"],
  [/latin america|south america|central america/i, "latin-america"],
  [/north america/i, "north-america"],
  [/europe/i, "europe"],
];

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The region and countries a project's location names, as far as it can tell. */
export function placeOf(location: string | null | undefined): { region?: Region; countries?: string[] } {
  if (!location) return {};
  let rest = location.toLowerCase();
  const countries: string[] = [];
  for (const [name, code] of COUNTRY_NAMES) {
    const word = new RegExp(`\\b${escape(name)}\\b`);
    if (!word.test(rest)) continue;
    rest = rest.replace(word, " ");
    if (!countries.includes(code)) countries.push(code);
  }
  const regions = [...new Set(countries.map(regionOf).filter((region): region is Region => Boolean(region)))];
  const named = REGION_WORDS.find(([words]) => words.test(location))?.[1];
  const region = regions.length === 1 ? regions[0] : named;
  return { ...(region ? { region } : {}), ...(countries.length ? { countries } : {}) };
}
