import type { CSSProperties } from "react";
import { logos } from "@/lib/brand";

/**
 * The mark, drawn as a mask rather than an image.
 *
 * logo-mark.svg is the badge artwork with its ground removed. Masking it and
 * filling with `currentColor` means the mark inherits the ink of whatever it
 * sits in — black on paper, white over photography — without shipping a second
 * file or inverting anything. The artwork itself is never recoloured; only the
 * ink behind the mask changes, which is what the logo rules allow.
 *
 * This is safe here and wrong for the hero artwork: masking replaces
 * everything inside the shape with one flat colour, so any file carrying a
 * picture must be placed as an image instead.
 */
export function Mark({
  className = "",
  label = "Ghost Savvy Studios",
  decorative = false,
}: {
  className?: string;
  label?: string;
  /** True when a real link label already names the studio next to the mark. */
  decorative?: boolean;
}) {
  const mask: CSSProperties = {
    display: "block",
    aspectRatio: `${logos.mark.width} / ${logos.mark.height}`,
    backgroundColor: "currentColor",
    maskImage: `url(${logos.mark.src})`,
    WebkitMaskImage: `url(${logos.mark.src})`,
    maskSize: "100% 100%",
    WebkitMaskSize: "100% 100%",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
  };

  return (
    <span
      className={className}
      style={mask}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? true : undefined}
    />
  );
}
