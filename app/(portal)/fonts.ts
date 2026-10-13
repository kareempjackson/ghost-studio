import localFont from "next/font/local";

/**
 * The portal's one addition to the type: DM Sans at its 36pt optical size,
 * light, for page titles and the large figures — a balance, a milestone
 * count. The display cut is drawn tighter for size, so it holds together at
 * 64px where the text cut goes loose. Regular comes along for figures that
 * sit beside light ones and need a touch more weight.
 *
 * Kept out of app/fonts.ts so the site never preloads it.
 */
export const dmSansDisplay = localFont({
  variable: "--font-dm-sans-display",
  display: "swap",
  src: [
    {
      path: "../../public/fonts/DMSans_36pt-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/DMSans_36pt-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
});
