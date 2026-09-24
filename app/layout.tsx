import type { Metadata } from "next";
import localFont from "next/font/local";
import { typekit } from "@/lib/brand";
import { introScript } from "@/lib/intro";
import { PageTransition } from "./_components/PageTransition";
import "./globals.css";

/**
 * DM Sans carries the page and Arial the labels. Both are self-hosted
 * from public/fonts through next/font/local, so they are subset, preloaded and
 * served from our own origin. Hardcover VF, the editorial guest, is still
 * served by Adobe Fonts and cannot be self-hosted, so that kit stays linked
 * below.
 *
 * Only the weights the site sets are loaded, because every file here is
 * preloaded on every page. The rest of the family (and the 18/24/36pt optical
 * sizes) is in public/fonts: add a line to use one.
 */
const dmSans = localFont({
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

const arial = localFont({
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

export const metadata: Metadata = {
  title: {
    default: "Ghost Savvy Studios",
    template: "%s — Ghost Savvy Studios",
  },
  description:
    "We build public-facing digital systems for institutions that cannot afford to get them wrong.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      /* The brand ships a dark palette, but the site is a printed sheet:
         white ground, black ink, at every system setting. */
      data-theme="light"
      className={`${dmSans.variable} ${arial.variable} h-full antialiased`}
      /* The intro script may set `data-intro` before React hydrates. */
      suppressHydrationWarning
    >
      <head>
        {/* Decides, before first paint, whether this tab has seen the intro.
            See lib/intro.ts. */}
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        {/* The intro's mark, fetched before it has to rise. */}
        <link rel="preload" as="image" href="/logos/logo-mark.svg" />
        <link rel="preload" as="image" href="/logos/logo-mark-grey.svg" />
        <link rel="preload" as="image" href="/media/intro-still.jpg" />
        {typekit.preconnect.map((href) => (
          <link key={href} rel="preconnect" href={href} crossOrigin="" />
        ))}
        <link rel="stylesheet" href={typekit.href} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <PageTransition />
      </body>
    </html>
  );
}
