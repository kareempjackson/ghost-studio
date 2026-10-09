import { shareImage } from "@/lib/og";

export const alt = "Brand system — Ghost Savvy Studios";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The brand system's share card. Its words are in code, as the page's are. */
export default function Image() {
  return shareImage({ label: "Brand", title: "Brand system" });
}
