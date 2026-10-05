/**
 * Ghost Savvy Studios — the strip under the cover.
 *
 * Two things the studio made, with the working principle between them. It
 * sits under the cover of `/services` and `/about` alike, so it lives here
 * and both pages set the same three plates.
 *
 * PLACEHOLDER — the tee is the 326px export the home page uses and reads
 * soft at this size; the tote is not exported yet. Drop both into
 * `public/images/` at 2x and set `src`.
 */
export const studioStrip = {
  label: "From the studio",
  tee: {
    src: "/images/merch.png",
    alt: "The back of a black Ghost Savvy t-shirt reading “Unclear brief, shipped product.”",
  },
  principle: {
    label: "GhostSavvy / A working principle",
    statement: ["Clarity", "before", "complexity."],
    source: "From the studio",
  },
  tote: {
    src: null as string | null,
    alt: "A black Ghost Savvy tote reading “Work over noise” on a red velvet chair.",
  },
} as const;
