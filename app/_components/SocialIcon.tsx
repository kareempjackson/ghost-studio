/**
 * The two marks, drawn as one family: outline only, one stroke weight, the
 * same rounded square around both, at a 2px stroke so they carry the same
 * weight as the type around them. Neither is the platform's own filled
 * logo — at this size a filled glyph reads as a sticker, and the menu and
 * the footer are set in line, not in badges.
 */
const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "size-5",
  "aria-hidden": true,
  focusable: "false",
} as const;

const ICONS = {
  instagram: (
    <svg {...ICON_PROPS}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.75" />
      <circle cx="16.9" cy="7.1" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  linkedin: (
    <svg {...ICON_PROPS}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <path d="M8.5 10.75v5.5" />
      <circle cx="8.5" cy="7.9" r="1.1" fill="currentColor" stroke="none" />
      <path d="M11.75 16.25v-5.5M11.75 13.25c0-1.55.95-2.5 2.25-2.5s2.25.95 2.25 2.5v3" />
    </svg>
  ),
} as const;

/** The Instagram or LinkedIn mark, 20px, in the ink of whatever holds it. */
export function SocialIcon({ id }: { id: keyof typeof ICONS }) {
  return ICONS[id];
}
