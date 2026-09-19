/**
 * Ghost Savvy Studios — the mark.
 *
 * The wordmark is GHOST with the O removed. What is left is an aperture: the
 * studio is the gap the client's work shows through. In the signature lockup
 * that aperture is filled by a pill carrying "savvy" — GH(savvy)ST — which is
 * the only place the second word ever appears inside the mark.
 *
 * The pill is therefore not a style choice. It is the counter of the missing
 * letter, and it is why `radius.pill` is reserved everywhere else in the
 * system: every pill on a Ghost Savvy surface is a quotation of the logo.
 */

export type LogoTone = "light" | "dark";
export type LogoShape = "horizontal" | "square";

export interface LogoAsset {
  readonly id: string;
  readonly name: string;
  readonly src: string;
  readonly shape: LogoShape;
  /** Intrinsic viewBox, in SVG user units. */
  readonly width: number;
  readonly height: number;
  /** The ground the asset is drawn for. */
  readonly tone: LogoTone;
  /** True when the file paints its own ground and must not be placed on art. */
  readonly opaque: boolean;
  /** Smallest reproduction width in CSS px. */
  readonly minWidth: number;
  readonly usage: string;
}

export const logos = {
  wordmark: {
    id: "wordmark",
    name: "Wordmark — hero artwork",
    src: "/logos/wordmark-hero.svg",
    shape: "horizontal",
    width: 1512,
    height: 323,
    tone: "light",
    opaque: false,
    minWidth: 320,
    usage:
      "The hero artwork: the wordmark cropped at both edges so it runs the full width of the page, with the aperture left open for the reel to sit in. Placed as an image, never masked — the mark is not recoloured to suit a ground.",
  },
  wordmarkFlat: {
    id: "wordmark-flat",
    name: "Wordmark — flat",
    src: "/logos/wordmark-flat.svg",
    shape: "horizontal",
    width: 923,
    height: 204,
    tone: "dark",
    opaque: false,
    minWidth: 120,
    usage:
      "The mark as pure vector with the aperture empty and no descriptor beside it. Transparent ground, white artwork, so it takes the ink of whatever it sits in. Cut from the master drawing with the \u201cDesign Agency\u201d lockup removed and the box trimmed to the registered mark, so the \u00ae still sits on the right edge. Use wherever the aperture is not being filled.",
  },
  badgeDark: {
    id: "badge-dark",
    name: "Badge — dark",
    src: "/logos/logo-black.svg",
    shape: "square",
    width: 500,
    height: 500,
    tone: "dark",
    opaque: true,
    minWidth: 32,
    usage:
      "Square tile, white mark on black. Avatars, app icons, social profiles, anywhere the mark needs its own ground.",
  },
  mark: {
    id: "mark",
    name: "Mark — transparent",
    src: "/logos/logo-mark.svg",
    shape: "square",
    width: 500,
    height: 500,
    tone: "dark",
    opaque: false,
    minWidth: 32,
    usage:
      "The badge artwork with its ground removed. Masked and filled with currentColor, so it takes the ink of whatever it sits in — the only mark to use on chrome that has to read against both paper and photography.",
  },
  badgeLight: {
    id: "badge-light",
    name: "Badge — light",
    src: "/logos/logo-white.svg",
    shape: "square",
    width: 500,
    height: 500,
    tone: "light",
    opaque: true,
    minWidth: 32,
    usage:
      "The same tile inverted, for light surfaces and single-colour print.",
  },
  signatureDark: {
    id: "signature-dark",
    name: "Signature — dark",
    src: "/logos/logo-black-pill.svg",
    shape: "square",
    width: 500,
    height: 500,
    tone: "dark",
    opaque: true,
    minWidth: 96,
    usage:
      'The full name: "savvy" set inside the pill that fills the aperture. Use where the studio has to be named in full — decks, credits, signatures, stationery.',
  },
  signatureLight: {
    id: "signature-light",
    name: "Signature — light",
    src: "/logos/logo-white-pill.svg",
    shape: "square",
    width: 500,
    height: 500,
    tone: "light",
    opaque: true,
    minWidth: 96,
    usage: "The signature lockup inverted for light grounds.",
  },
} as const satisfies Record<string, LogoAsset>;

export type LogoId = keyof typeof logos;

export const logoList: readonly LogoAsset[] = Object.values(logos);

/**
 * Construction. Every measurement is derived from the cap height of the
 * wordmark — the height of the H — so the mark scales without a spec sheet.
 */
export const logoConstruction = {
  /** Cap height in the wordmark's own units (viewBox 965 x 204). */
  capHeightUnits: 202,
  /** Clear space on all four sides, as a multiple of cap height. */
  clearSpace: 0.5,
  /** Aspect ratio of the horizontal wordmark. */
  wordmarkRatio: 965 / 204,
  notes: [
    "Clear space is half the cap height on every side. Nothing enters it — not a rule, not a nav item, not the edge of a photograph.",
    "The square badges are pre-composed and already carry their own margin. Never inset the artwork further, never crop it, never add a border.",
    "The registered mark is part of the artwork. It is never redrawn, repositioned or removed, including at minimum size.",
  ],
} as const;

/** Reproduction floors, digital and print. */
export const logoMinimums = [
  { context: "Wordmark, screen", value: "120px wide" },
  { context: "Wordmark, print", value: "30mm wide" },
  { context: "Badge, screen", value: "32px — 24px for a favicon" },
  { context: "Signature lockup, screen", value: "96px wide" },
  {
    context: "Signature lockup, print",
    value: '25mm — below this, drop "savvy" and use the badge',
  },
] as const;

/** How the mark meets its ground. */
export const logoBackgrounds = [
  {
    ground: "Black or ink 900+",
    instruction: "Wordmark in white. The default pairing.",
    allowed: true,
  },
  {
    ground: "White or ink 50",
    instruction: "Wordmark in black, or the light badge.",
    allowed: true,
  },
  {
    ground: "Photography",
    instruction:
      "White wordmark, only over an area that holds at least 3:1 against white. Add a black scrim before you add a container.",
    allowed: true,
  },
  {
    ground: "Signal vermilion",
    instruction: "White wordmark only. Never ink, never acid.",
    allowed: true,
  },
  {
    ground: "Acid chartreuse",
    instruction: "Black wordmark only. White fails on acid at every size.",
    allowed: true,
  },
  {
    ground: "Mid ink (300–600)",
    instruction:
      "Not a logo ground. Move to black, to white, or place the badge.",
    allowed: false,
  },
] as const;

export const logoMisuse = [
  {
    title: "Do not fill the aperture",
    detail:
      'The gap is the mark. Nothing goes in it except the "savvy" pill from the signature lockup.',
  },
  {
    title: "Do not set the name in Forma and call it the logo",
    detail: "The wordmark is drawn artwork. Live text is never a substitute.",
  },
  {
    title: "Do not recolour",
    detail:
      "Black, white, or knocked out of a brand plane. There is no vermilion logo and no gradient logo.",
  },
  {
    title: "Do not stretch, skew, rotate or outline",
    detail: "Scale proportionally. The mark sits level on every surface.",
  },
  {
    title: "Do not add effects",
    detail: "No shadow, no glow, no bevel, no blur behind the artwork.",
  },
  {
    title: "Do not rebuild the lockup",
    detail:
      "Do not re-space the letters, swap the pill for a circle, or set a tagline inside the clear space.",
  },
] as const;

/* -------------------------------------------------------------------------- */
/*  The aperture                                                              */
/* -------------------------------------------------------------------------- */

/**
 * The aperture, as a rectangle inside the hero artwork's 1512 x 323 viewBox.
 *
 * Not derived, not eyeballed: these are the artwork's own numbers. The file
 * draws the opening as `<rect x="345.633" width="832.192" height="322.4"
 * rx="161.2">` and clips to the same rect, so anything positioned from here
 * lands in the aperture exactly, at every width. The radius is half the
 * height — a true pill, which is the counter of the missing letter and the
 * reason the brand reserves that shape everywhere else.
 */
export const wordmarkAperture = {
  x: 345.633,
  y: 0,
  width: 832.192,
  height: 322.4,
} as const;

/** The same rectangle as CSS percentages, ready for absolute positioning. */
export const wordmarkApertureCss = {
  left: `${(wordmarkAperture.x / logos.wordmark.width) * 100}%`,
  top: `${(wordmarkAperture.y / logos.wordmark.height) * 100}%`,
  width: `${(wordmarkAperture.width / logos.wordmark.width) * 100}%`,
  height: `${(wordmarkAperture.height / logos.wordmark.height) * 100}%`,
} as const;

/**
 * The artwork split at the aperture, so the two halves can be moved apart.
 *
 * The letters sit entirely outside the opening — G and H end exactly where the
 * aperture begins, S and T begin exactly where it ends — so the mark can be
 * cut into two files at those boundaries and reassembled with no seam. Each
 * half keeps the full 323-unit height, so both scale off the same box.
 */
export const wordmarkSplit = {
  left: {
    src: "/logos/wordmark-left.svg",
    x: 0,
    width: wordmarkAperture.x,
  },
  right: {
    src: "/logos/wordmark-right.svg",
    x: wordmarkAperture.x + wordmarkAperture.width,
    width:
      logos.wordmark.width - (wordmarkAperture.x + wordmarkAperture.width),
  },
} as const;

/** Each half as CSS percentages of the artwork box. */
export const wordmarkSplitCss = {
  left: {
    left: `${(wordmarkSplit.left.x / logos.wordmark.width) * 100}%`,
    width: `${(wordmarkSplit.left.width / logos.wordmark.width) * 100}%`,
  },
  right: {
    left: `${(wordmarkSplit.right.x / logos.wordmark.width) * 100}%`,
    width: `${(wordmarkSplit.right.width / logos.wordmark.width) * 100}%`,
  },
} as const;

/** The aperture as plain fractions, for interpolating in pixel space. */
export const wordmarkApertureFraction = {
  x: wordmarkAperture.x / logos.wordmark.width,
  y: wordmarkAperture.y / logos.wordmark.height,
  width: wordmarkAperture.width / logos.wordmark.width,
  height: wordmarkAperture.height / logos.wordmark.height,
} as const;

/**
 * The pill that fills the aperture, cut out of the signature lockup.
 *
 * "savvy" is drawn artwork, not live type, so the second word is never set in
 * Forma and passed off as the mark. This file is the same two elements the
 * square signature is built from — the white pill and the black word inside
 * it — lifted onto their own viewBox so the lockup can be composed at page
 * scale instead of only at tile scale.
 *
 * Its ratio is the aperture's ratio to five decimal places, because it is the
 * same shape: drop it on `wordmarkApertureCss` and it lands in the opening
 * exactly, at any width. That is what makes GH(savvy)ST reproducible as a
 * full-bleed lockup without redrawing anything.
 */
export const savvyPill = {
  src: "/logos/savvy-pill.svg",
  width: 198.125,
  height: 76.7558,
} as const;

/**
 * The aperture column, as custom properties for `.gs-aperture-column`.
 *
 * Two bands stand in the gap the missing O leaves — the cover statement under
 * the hero artwork, and the whole of the footer — and both are registered to a
 * wordmark running full bleed behind or below them. Handing the stylesheet the
 * artwork's own percentages keeps the only copy of those numbers here, and
 * leaves CSS holding the one thing that is genuinely a layout decision: the
 * breakpoint below which 55% of the page stops being a measure.
 */
export const wordmarkApertureVars = {
  "--gs-aperture-left": wordmarkApertureCss.left,
  "--gs-aperture-width": wordmarkApertureCss.width,
} as const;
