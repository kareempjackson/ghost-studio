/**
 * Where the content lives. The two public values are read by the Studio in
 * the browser as well as by the server, so they must be NEXT_PUBLIC_ and must
 * be read by their full names (Next inlines them at build time).
 */

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-10-01";

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "NEXT_PUBLIC_SANITY_DATASET",
);

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
);

/** Where the Studio is mounted; Presentation and stega links point here. */
export const studioUrl = "/studio";

function assertValue<T>(value: T | undefined, name: string): T {
  if (value === undefined || value === "") {
    throw new Error(`Missing ${name}. Copy .env.example to .env.local.`);
  }
  return value;
}
