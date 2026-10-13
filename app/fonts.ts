import localFont from "next/font/local";

/**
 * DM Sans carries the page and Arial the labels. Both are self-hosted
 * from public/fonts through next/font/local, so they are subset, preloaded and
 * served from our own origin.
 *
 * Defined once here because two root layouts set them — the site's and the
 * portal's — and every call to localFont hosts its own copy of the files.
 *
 * Only the weights the site sets are loaded, because every file here is
 * preloaded on every page. The rest of the family (and the 18/24/36pt optical
 * sizes) is in public/fonts: add a line to use one.
 */
export const dmSans = localFont({
  variable: "--font-dm-sans",
  display: "swap",
  src: [
    {
      path: "../public/fonts/DMSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/DMSans-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/DMSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    { path: "../public/fonts/DMSans-Bold.ttf", weight: "700", style: "normal" },
    {
      path: "../public/fonts/DMSans-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
});

export const arial = localFont({
  variable: "--font-arial",
  display: "swap",
  src: [
    {
      path: "../public/fonts/Arial-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    { path: "../public/fonts/Arial-Bold.ttf", weight: "700", style: "normal" },
  ],
});
