/**
 * Ghost Savvy Studios — colour.
 *
 * The system is monochrome-first. Institutional work has to survive a decade
 * of content changes, third-party embeds and print, so the load-bearing
 * palette is a single warm-neutral ink ramp on paper. Colour is signal, not
 * decoration: it appears where something must be noticed, and nowhere else.
 *
 * This file is the source of truth. `app/globals.css` mirrors these values as
 * CSS custom properties for Tailwind; change a hex here and there.
 */

export type ColorRamp = Readonly<Record<ColorStep, string>>;
export type ColorStep =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | 950;

/* -------------------------------------------------------------------------- */
/*  Primitives                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Absolutes. The logo is drawn in pure black and pure white and is never
 * rendered in an ink step — the mark's contrast is part of the mark.
 */
export const absolute = {
  black: "#000000",
  white: "#FFFFFF",
} as const;

/**
 * INK — warm neutral. Hue held around 40deg at very low saturation so long
 * passages of body copy read as paper-and-print rather than screen-grey.
 *
 * Load-bearing steps:
 *   500  lightest ink that clears 4.5:1 on white — the floor for body copy
 *   400  lightest ink that clears 3:1 on white — the floor for borders/icons
 */
export const ink: ColorRamp = {
  50: "#F7F6F3",
  100: "#EDEBE7",
  200: "#DEDBD4",
  300: "#C2BEB6",
  400: "#9A958C",
  500: "#78746C",
  600: "#625E58",
  700: "#45423C",
  800: "#2B2925",
  900: "#1A1815",
  950: "#0E0D0B",
} as const;

/**
 * SIGNAL — vermilion. The one loud colour. Reserved for a single element per
 * viewport: the live link, the thing being changed, the warning that a
 * deadline is statutory. If two things on screen are signal, neither is.
 *
 * 500 is the brand vermilion but only clears 3.9:1 on white — it is a surface
 * and graphics colour. Use 700 when signal has to carry small text on paper.
 */
export const signal: ColorRamp = {
  50: "#FDEEEB",
  100: "#FBD8D1",
  200: "#F7B3A6",
  300: "#F28A76",
  400: "#EE6448",
  500: "#E8452B",
  600: "#CE3A21",
  700: "#B4321B",
  800: "#8E2413",
  900: "#6B1B0E",
  950: "#48120A",
} as const;

/**
 * ACID — chartreuse. The counter-signal, used underneath or behind signal to
 * make a plane read as printed matter rather than UI. Very high luminance:
 * acid never carries text on a light surface, and never sits next to signal
 * without a rule or a gap between them.
 */
export const acid: ColorRamp = {
  50: "#FAFCE6",
  100: "#F3F8C2",
  200: "#E9F28A",
  300: "#DFE95F",
  400: "#D7E23F",
  500: "#BFCB2E",
  600: "#9CA622",
  700: "#77801A",
  800: "#565C14",
  900: "#3A3E0E",
  950: "#252708",
} as const;

/**
 * SLATE — the quiet blue-grey. Carries product chrome, avatars, diagrams and
 * anything that has to sit beside the ink ramp without competing with signal.
 */
export const slate: ColorRamp = {
  50: "#F2F4F7",
  100: "#E2E7ED",
  200: "#C6CFDA",
  300: "#A2AFC1",
  400: "#7C8CA4",
  500: "#5B6B84",
  600: "#47556A",
  700: "#374152",
  800: "#262D39",
  900: "#171C23",
  950: "#0D1014",
} as const;

export const palette = { absolute, ink, signal, acid, slate } as const;

/* -------------------------------------------------------------------------- */
/*  Semantic layer                                                            */
/* -------------------------------------------------------------------------- */

export interface SemanticColors {
  readonly surface: {
    /** Default page ground. */
    readonly page: string;
    /** Banded section that separates without a rule. */
    readonly subtle: string;
    /** Cards and panels lifted off the page. */
    readonly raised: string;
    /** Wells, inputs, code. */
    readonly sunken: string;
    /** Full-bleed opposite-polarity section. */
    readonly inverse: string;
    /** Signal plane — posters, alerts, one CTA. */
    readonly accent: string;
  };
  readonly text: {
    /** Body copy and headlines. */
    readonly primary: string;
    /** Supporting copy, deck text, captions with real content. */
    readonly secondary: string;
    /** Metadata and eyebrow labels. Never the only carrier of meaning. */
    readonly tertiary: string;
    readonly disabled: string;
    /** Copy on `surface.inverse`. */
    readonly inverse: string;
    /** Copy on `surface.accent`. */
    readonly onAccent: string;
    /** Links and emphasis. */
    readonly accent: string;
  };
  readonly border: {
    /** Hairlines inside a component. */
    readonly subtle: string;
    /** Default dividers and input outlines. */
    readonly default: string;
    /** The editorial rule — full-width, structural. */
    readonly strong: string;
    readonly inverse: string;
    /** Focus ring. Always 2px, always 2px offset, never removed. */
    readonly focus: string;
  };
  readonly accent: {
    readonly signal: string;
    readonly acid: string;
    readonly slate: string;
  };
}

export const lightTheme: SemanticColors = {
  surface: {
    page: absolute.white,
    subtle: ink[50],
    raised: absolute.white,
    sunken: ink[100],
    inverse: absolute.black,
    accent: signal[500],
  },
  text: {
    primary: ink[950],
    secondary: ink[600],
    tertiary: ink[500],
    disabled: ink[400],
    inverse: absolute.white,
    onAccent: absolute.white,
    accent: signal[700],
  },
  border: {
    subtle: ink[100],
    default: ink[200],
    strong: ink[950],
    inverse: absolute.white,
    focus: signal[500],
  },
  accent: {
    signal: signal[500],
    acid: acid[400],
    slate: slate[500],
  },
} as const;

export const darkTheme: SemanticColors = {
  surface: {
    page: absolute.black,
    subtle: ink[950],
    raised: ink[900],
    sunken: absolute.black,
    inverse: absolute.white,
    accent: signal[500],
  },
  text: {
    primary: ink[50],
    secondary: ink[300],
    tertiary: ink[400],
    disabled: ink[600],
    inverse: ink[950],
    onAccent: absolute.white,
    accent: signal[300],
  },
  border: {
    subtle: ink[800],
    default: ink[700],
    strong: ink[50],
    inverse: ink[950],
    focus: signal[400],
  },
  accent: {
    signal: signal[500],
    acid: acid[400],
    slate: slate[400],
  },
} as const;

export const themes = { light: lightTheme, dark: darkTheme } as const;
export type ThemeName = keyof typeof themes;

/* -------------------------------------------------------------------------- */
/*  Documented pairings                                                       */
/* -------------------------------------------------------------------------- */

export interface ColorPairing {
  readonly name: string;
  readonly foreground: string;
  readonly background: string;
  /** How the pairing is judged: text thresholds vs. WCAG 1.4.11 non-text. */
  readonly usage: "body" | "large" | "non-text";
  readonly note: string;
}

/** Every combination the brand actually ships, so each can be measured. */
export const pairings: readonly ColorPairing[] = [
  {
    name: "Body on paper",
    foreground: ink[950],
    background: absolute.white,
    usage: "body",
    note: "The default. Everything else is an exception that needs a reason.",
  },
  {
    name: "Secondary on paper",
    foreground: ink[600],
    background: absolute.white,
    usage: "body",
    note: "Deck copy and captions carrying real content.",
  },
  {
    name: "Tertiary on paper",
    foreground: ink[500],
    background: absolute.white,
    usage: "body",
    note: "Eyebrow labels and metadata. The lightest ink allowed on text.",
  },
  {
    name: "Border on paper",
    foreground: ink[400],
    background: absolute.white,
    usage: "non-text",
    note: "The lightest ink allowed on a control outline or icon.",
  },
  {
    name: "Body on inverse",
    foreground: ink[50],
    background: absolute.black,
    usage: "body",
    note: "Full-bleed dark sections and the badge lockup.",
  },
  {
    name: "Secondary on inverse",
    foreground: ink[300],
    background: absolute.black,
    usage: "body",
    note: "Deck copy inside a dark band.",
  },
  {
    name: "Link on paper",
    foreground: signal[700],
    background: absolute.white,
    usage: "body",
    note: "Signal is darkened to 700 whenever it carries small text.",
  },
  {
    name: "Signal plane",
    foreground: absolute.white,
    background: signal[500],
    usage: "large",
    note: "Poster type only — 24px+ or 18.66px+ bold.",
  },
  {
    name: "Signal as graphic",
    foreground: signal[500],
    background: absolute.white,
    usage: "non-text",
    note: "Rules, dots, focus rings, chart marks. Not small text.",
  },
  {
    name: "Acid plane",
    foreground: ink[950],
    background: acid[400],
    usage: "body",
    note: "Acid always takes ink, never white.",
  },
  {
    name: "Slate on paper",
    foreground: slate[500],
    background: absolute.white,
    usage: "body",
    note: "Diagram labels and product chrome.",
  },
] as const;

/* -------------------------------------------------------------------------- */
/*  CSS variable emission                                                     */
/* -------------------------------------------------------------------------- */

/** Flatten a theme into the `--gs-*` custom properties used in globals.css. */
export function themeToCssVariables(
  theme: SemanticColors
): Readonly<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const [group, entries] of Object.entries(theme)) {
    for (const [key, value] of Object.entries(entries)) {
      out[`--gs-${group}-${kebab(key)}`] = value as string;
    }
  }
  return out;
}

function kebab(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/* -------------------------------------------------------------------------- */
/*  Rules                                                                     */
/* -------------------------------------------------------------------------- */

export const colorRules = [
  {
    rule: "Monochrome is the default state. Reach for colour only when something must be noticed.",
    why: "A page that uses colour everywhere has no way left to say 'here'. Ink on paper is the brand; signal is the exception that proves it.",
  },
  {
    rule: "One signal element per viewport.",
    why: "Two vermilion things on screen cancel each other out and the hierarchy collapses.",
  },
  {
    rule: "Colour never carries meaning alone.",
    why: "WCAG 1.4.1. Status needs a word or a mark as well as a hue — roughly 1 in 12 men cannot separate the vermilion from the ink.",
  },
  {
    rule: "Signal darkens to 700 when it carries text under 24px.",
    why: "Signal 500 measures under 4.5:1 on paper. It is a plane and a graphic, not a body-copy ink.",
  },
  {
    rule: "Acid takes ink, never white. Acid never touches signal without a rule or a gap.",
    why: "Chartreuse is the highest-luminance colour in the system; white on it fails at every size, and vibrating against vermilion is a print effect, not a UI one.",
  },
  {
    rule: "Components name semantic tokens, never ramp steps.",
    why: "`text.secondary` survives a theme switch and a palette revision. `ink.600` does not.",
  },
] as const;
