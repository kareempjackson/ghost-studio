/**
 * Ghost Savvy Studios — typography.
 *
 * Three faces:
 *
 *   DM Sans          The voice of the studio. A low-contrast geometric
 *                    grotesque at 400, 500 and 700, self-hosted from
 *                    public/fonts through next/font/local (`--font-dm-sans`).
 *
 *   Arial            Labels, navigation and tokens. 400 and 700, self-hosted
 *                    from public/fonts (`--font-arial`).
 *
 *   hardcover-vf     The editorial counterweight, served by Adobe Fonts
 *                    (kit `hsf3srj`). Variable 200–900, roman +
 *                    italic. Used at one size class per page, for the pull
 *                    quote, the epigraph, the number that matters. It is a
 *                    guest, never the host.
 *
 * Fallback stacks are not decorative. Institutional traffic includes locked
 * SOEs and offline caches where the kit will not load, so both stacks are
 * ordered to hold metrics rather than to look nice.
 */

/* -------------------------------------------------------------------------- */
/*  Families                                                                  */
/* -------------------------------------------------------------------------- */

export interface FontFamily {
  readonly id: string;
  readonly name: string;
  readonly stack: string;
  readonly role: string;
  /** Discrete weights for static faces, or the variable axis range. */
  readonly weights: readonly number[];
  readonly variable: boolean;
  readonly italics: boolean;
  readonly licensed: boolean;
}

const GROTESK_FALLBACK =
  '"Helvetica Neue", Helvetica, "Segoe UI", Roboto, Arial, sans-serif';

export const families = {
  grotesk: {
    id: "grotesk",
    name: "DM Sans",
    stack: `var(--font-dm-sans), ${GROTESK_FALLBACK}`,
    role: "Everything by default: display, headlines, UI, body.",
    weights: [400, 500, 700],
    variable: false,
    italics: true,
    licensed: false,
  },
  editorial: {
    id: "editorial",
    name: "Hardcover VF",
    stack: '"hardcover-vf", Georgia, "Times New Roman", serif',
    role: "One editorial moment per page — pull quote, epigraph, hero numeral.",
    weights: [200, 300, 400, 500, 600, 700, 800, 900],
    variable: true,
    italics: true,
    licensed: true,
  },
  mono: {
    id: "mono",
    name: "Arial",
    stack: 'var(--font-arial), Arial, "Helvetica Neue", Helvetica, sans-serif',
    role: "Navigation, labels, tokens, code and tabular data.",
    weights: [400, 700],
    variable: false,
    italics: false,
    licensed: false,
  },
} as const satisfies Record<string, FontFamily>;

export type FamilyId = keyof typeof families;

/** The Adobe Fonts kit that serves Hardcover VF. */
export const typekit = {
  id: "hsf3srj",
  href: "https://use.typekit.net/hsf3srj.css",
  preconnect: ["https://use.typekit.net", "https://p.typekit.net"],
} as const;

/* -------------------------------------------------------------------------- */
/*  Fluid scale                                                               */
/* -------------------------------------------------------------------------- */

/** Viewport range the fluid scale interpolates across. */
export const fluidRange = { min: 390, max: 1440 } as const;

const round = (n: number) => Math.round(n * 1000) / 1000;

/**
 * A `clamp()` that grows linearly between the two viewport bounds, then stops.
 * Both ends are real designed sizes, so type never drifts past what was drawn.
 */
export function fluid(minPx: number, maxPx: number): string {
  if (minPx === maxPx) return `${round(minPx / 16)}rem`;

  const slope = (maxPx - minPx) / (fluidRange.max - fluidRange.min);
  const interceptRem = round((minPx - slope * fluidRange.min) / 16);
  const slopeVw = round(slope * 100);

  return `clamp(${round(minPx / 16)}rem, ${interceptRem}rem + ${slopeVw}vw, ${round(
    maxPx / 16
  )}rem)`;
}

/* -------------------------------------------------------------------------- */
/*  Roles                                                                     */
/* -------------------------------------------------------------------------- */

export interface TypeStyle {
  readonly id: string;
  readonly label: string;
  readonly family: FamilyId;
  /** Designed size at the smallest and largest viewport, in px. */
  readonly size: readonly [min: number, max: number];
  readonly lineHeight: number;
  /** In em, so it tracks the size. */
  readonly letterSpacing: number;
  readonly weight: number;
  readonly transform?: "uppercase";
  readonly italic?: boolean;
  /** Maximum measure in characters. Enforced, not suggested. */
  readonly measure?: number;
  readonly usage: string;
}

/**
 * The scale is deliberately short. Nine text roles and four display roles is
 * enough to build a government portal; a longer scale is a licence for drift.
 *
 * Display roles are set uppercase with negative tracking because the wordmark
 * is uppercase — the headline and the logo are the same gesture at two sizes.
 */
export const typeScale = {
  "display-xl": {
    id: "display-xl",
    label: "Display XL",
    family: "grotesk",
    size: [44, 120],
    lineHeight: 0.92,
    letterSpacing: -0.03,
    weight: 700,
    transform: "uppercase",
    measure: 22,
    usage: "One per site. The statement on the cover.",
  },
  "display-l": {
    id: "display-l",
    label: "Display L",
    family: "grotesk",
    size: [34, 76],
    lineHeight: 0.96,
    letterSpacing: -0.025,
    weight: 700,
    transform: "uppercase",
    measure: 30,
    usage: "Section openers. One per full-bleed band.",
  },
  "display-m": {
    id: "display-m",
    label: "Display M",
    family: "grotesk",
    size: [28, 52],
    lineHeight: 1,
    letterSpacing: -0.02,
    weight: 700,
    transform: "uppercase",
    measure: 36,
    usage: "Sub-sections and card headings inside a long page.",
  },
  editorial: {
    id: "editorial",
    label: "Editorial",
    family: "editorial",
    size: [24, 44],
    lineHeight: 1.18,
    letterSpacing: -0.01,
    weight: 300,
    italic: true,
    measure: 42,
    usage: "The one Hardcover moment: pull quote, epigraph, hero numeral.",
  },
  headline: {
    id: "headline",
    label: "Headline",
    family: "grotesk",
    size: [22, 30],
    lineHeight: 1.15,
    letterSpacing: -0.015,
    weight: 700,
    measure: 46,
    usage: "Article titles and dialog headers. Sentence case.",
  },
  title: {
    id: "title",
    label: "Title",
    family: "grotesk",
    size: [18, 21],
    lineHeight: 1.25,
    letterSpacing: -0.01,
    weight: 700,
    measure: 52,
    usage: "Card titles, list group headers, form section names.",
  },
  "body-l": {
    id: "body-l",
    label: "Body L",
    family: "grotesk",
    size: [18, 20],
    lineHeight: 1.55,
    letterSpacing: -0.005,
    weight: 400,
    measure: 68,
    usage: "Deck copy directly under a display role.",
  },
  body: {
    id: "body",
    label: "Body",
    family: "grotesk",
    size: [16, 17],
    lineHeight: 1.6,
    letterSpacing: 0,
    weight: 400,
    measure: 72,
    usage: "The default. Never below 16px anywhere a citizen has to read.",
  },
  "body-s": {
    id: "body-s",
    label: "Body S",
    family: "grotesk",
    size: [15, 15],
    lineHeight: 1.55,
    letterSpacing: 0,
    weight: 400,
    measure: 76,
    usage: "Dense tables and secondary panels. Not for primary content.",
  },
  caption: {
    id: "caption",
    label: "Caption",
    family: "grotesk",
    size: [13, 13],
    lineHeight: 1.45,
    letterSpacing: 0.005,
    weight: 400,
    measure: 60,
    usage: "Image credits, footnotes, help text.",
  },
  label: {
    id: "label",
    label: "Label",
    family: "grotesk",
    size: [11, 12],
    lineHeight: 1.2,
    letterSpacing: 0.12,
    weight: 700,
    transform: "uppercase",
    measure: 32,
    usage: "Eyebrows, section numbers, table headers, tags.",
  },
  mono: {
    id: "mono",
    label: "Mono",
    family: "mono",
    size: [13, 13],
    lineHeight: 1.5,
    letterSpacing: 0,
    weight: 400,
    measure: 80,
    usage: "Token names, hex values, code.",
  },
} as const satisfies Record<string, TypeStyle>;

export type TypeRole = keyof typeof typeScale;

/** A `TypeStyle` as React inline styles, fluid sizing included. */
export function typeStyleToCss(style: TypeStyle): React.CSSProperties {
  return {
    fontFamily: families[style.family].stack,
    fontSize: fluid(style.size[0], style.size[1]),
    lineHeight: style.lineHeight,
    letterSpacing: `${style.letterSpacing}em`,
    fontWeight: style.weight,
    fontStyle: style.italic ? "italic" : "normal",
    textTransform: style.transform,
  };
}

/* -------------------------------------------------------------------------- */
/*  Rules                                                                     */
/* -------------------------------------------------------------------------- */

export const typographyRules = [
  {
    rule: "Grotesk carries the page. Editorial appears once.",
    why: "Two voices arguing at the same volume is how a system stops reading as one studio.",
  },
  {
    rule: "Display roles are uppercase; everything below Headline is sentence case.",
    why: "Uppercase is the studio's shout. Below 30px it costs legibility and gains nothing.",
  },
  {
    rule: "Tracking tightens as size grows and opens as size shrinks.",
    why: "Optical compensation. Forma DJR Deck is drawn for deck sizes and needs help at caption sizes.",
  },
  {
    rule: "Body copy never drops below 16px.",
    why: "Below 16px, mobile browsers zoom on focus and low-vision users lose the line. It is also the WCAG 1.4.4 reflow floor in practice.",
  },
  {
    rule: "Measure is capped per role and enforced with max-inline-size in ch.",
    why: "WCAG 1.4.8 asks for 80 characters or fewer. The scale ships under it by default so nobody has to remember.",
  },
  {
    rule: "Never fake a weight. Only 400 and 700 are licensed for Forma.",
    why: "Synthetic bold and oblique wreck the joins on a grotesque and are the fastest way to look counterfeit.",
  },
] as const;
