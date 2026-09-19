/**
 * Ghost Savvy Studios — space, radius, grid.
 *
 * The page is a printed sheet: a hard outer margin, a hairline rule under
 * every band, and a 12-column field that content is allowed to break out of
 * exactly once per section. Space is the primary hierarchy device — the
 * system has very few rules and very little colour, so distance does the work.
 */

/** 4px base. Steps are named by their multiple, not by t-shirt size. */
export const space = {
  0: "0rem",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  32: "8rem",
  40: "10rem",
  48: "12rem",
  64: "16rem",
} as const;

export type SpaceStep = keyof typeof space;

/** Vertical rhythm between page bands, by band weight. */
export const sectionRhythm = {
  tight: { min: 48, max: 80 },
  default: { min: 80, max: 144 },
  loose: { min: 120, max: 224 },
} as const;

/**
 * Radius. The system is square by default — institutional work should not
 * look soft. `pill` is the exception and it is a brand asset, not a style:
 * it is the shape of the aperture in the wordmark. Use it for tags, the
 * "savvy" lockup, avatars and one primary control. Nothing else.
 */
export const radius = {
  none: "0rem",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "1rem",
  xl: "1.5rem",
  pill: "9999px",
} as const;

export type RadiusToken = keyof typeof radius;

/** Hairlines. The 1px rule is the studio's most-used graphic element. */
export const stroke = {
  hairline: "1px",
  rule: "1px",
  heavy: "2px",
  /** Focus rings and the editorial underline. */
  emphasis: "2px",
} as const;

export const grid = {
  columns: 12,
  /** Gutter at the small and large ends of the fluid range. */
  gutter: { min: 16, max: 24 },
  /** Page margin at the small and large ends. */
  margin: { min: 20, max: 64 },
  /** Outer bound of the layout field. */
  maxWidth: 1440,
  /** Bound for long-form reading columns. */
  proseWidth: 720,
} as const;

/** Mobile-first. Matches Tailwind's defaults so nothing has to be remapped. */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Elevation is nearly absent by design. A shadow is a claim that something
 * floats; in a document, almost nothing does. Two levels only.
 */
export const elevation = {
  none: "none",
  raised: "0 1px 2px rgba(14, 13, 11, 0.06), 0 2px 8px rgba(14, 13, 11, 0.04)",
  overlay: "0 8px 24px rgba(14, 13, 11, 0.12), 0 2px 6px rgba(14, 13, 11, 0.08)",
} as const;

export const layoutRules = [
  {
    rule: "Every band is separated by a 1px rule or a change of ground, never both.",
    why: "Doubling the separator is how an editorial grid turns into a dashboard.",
  },
  {
    rule: "Content sits on the 12-column field; one element per section may break out full-bleed.",
    why: "The break-out is what makes the grid legible. Two break-outs and there is no grid.",
  },
  {
    rule: "Square by default. Pill is reserved. Nothing in between without a reason.",
    why: "A mixed radius vocabulary reads as several products stitched together.",
  },
  {
    rule: "Interactive targets are at least 24x24 CSS px, and 44x44 for anything primary.",
    why: "WCAG 2.2 SC 2.5.8 sets the floor at 24px; 44px is what actually works on a phone in the field.",
  },
] as const;
