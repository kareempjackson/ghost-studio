/**
 * WCAG 2.2 contrast math.
 *
 * Ghost Savvy builds for institutions that are legally bound to WCAG 2.1 AA.
 * "Accessibility is not a phase at the end" is a brand claim, so the brand
 * system ships the measurement, not just the intention: every pairing in the
 * guide is computed from the tokens at render time rather than annotated by
 * hand and left to rot.
 */

export type WcagLevel = "AAA" | "AA" | "AA Large" | "Fail";

/** Text size class used to pick the WCAG threshold. */
export type TextSize = "normal" | "large";

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Parse `#rgb` / `#rrggbb` into 0–255 channels. Throws on malformed input. */
export function hexToRgb(hex: string): Rgb {
  const match = HEX.exec(hex.trim());
  if (!match) throw new Error(`Not a hex colour: ${hex}`);

  const value = match[1];
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;

  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const channel = (n: number) =>
    Math.round(Math.min(255, Math.max(0, n)))
      .toString(16)
      .padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}`.toUpperCase();
}

/** sRGB channel → linear-light, per WCAG. */
function linearize(channel8Bit: number): number {
  const c = channel8Bit / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Relative luminance, 0 (black) → 1 (white). */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (
    0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
  );
}

/** Contrast ratio between two opaque colours, 1 → 21. */
export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const [light, dark] = a > b ? [a, b] : [b, a];
  return (light + 0.05) / (dark + 0.05);
}

/** Ratio rounded the way it should be reported: down, never up. */
export function reportRatio(ratio: number): string {
  return `${(Math.floor(ratio * 100) / 100).toFixed(2)}:1`;
}

/**
 * WCAG level for a text pairing. `large` means >= 24px, or >= 18.66px bold.
 * Non-text UI (icons, borders, focus rings) needs 3:1 — see `passesNonText`.
 */
export function wcagLevel(ratio: number, size: TextSize = "normal"): WcagLevel {
  if (size === "large") {
    if (ratio >= 4.5) return "AAA";
    if (ratio >= 3) return "AA Large";
    return "Fail";
  }
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA Large";
  return "Fail";
}

/** WCAG 1.4.11 — non-text contrast for UI components and graphics. */
export function passesNonText(ratio: number): boolean {
  return ratio >= 3;
}

/** Pick whichever of two inks is more legible on `background`. */
export function bestTextOn(
  background: string,
  candidates: readonly [string, string]
): string {
  const [a, b] = candidates;
  return contrastRatio(a, background) >= contrastRatio(b, background) ? a : b;
}
