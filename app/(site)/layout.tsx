import type { Metadata } from "next";
import { arial, dmSans } from "@/app/fonts";
import { typekit } from "@/lib/brand";
import { gtagScript, gtagSrc, loadsAnalytics } from "@/lib/analytics";
import { introScript } from "@/lib/intro";
import { Suspense } from "react";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { SITE_URL } from "@/lib/site";
import { getChrome, getSettings } from "@/sanity/content";
import { SanityLive } from "@/sanity/lib/live";
import { ChromeProvider } from "./_components/ChromeProvider";
import { PageTransition } from "./_components/PageTransition";
import "./globals.css";

/*
 * DM Sans and Arial are self-hosted (app/fonts.ts). Hardcover VF, the
 * editorial guest, is still served by Adobe Fonts and cannot be self-hosted,
 * so that kit stays linked below.
 */

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await getSettings();
  return {
    /* Where canonical and share-card addresses point: lib/site.ts. */
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s — ${title}` },
    description,
    /* A page without its own share fields still carries the site's. */
    openGraph: { type: "website", siteName: title, title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const chrome = await getChrome();

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
        {/* The Google tag. See lib/analytics.ts. */}
        {loadsAnalytics && (
          <>
            <script async src={gtagSrc} />
            <script dangerouslySetInnerHTML={{ __html: gtagScript }} />
          </>
        )}
        {/* Decides, before first paint, whether this tab has seen the intro.
            See lib/intro.ts. */}
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        {/* The intro's mark, fetched before it has to rise. */}
        <link rel="preload" as="image" href="/logos/logo-mark.svg" />
        <link rel="preload" as="image" href="/logos/logo-mark-grey.svg" />
        {typekit.preconnect.map((href) => (
          <link key={href} rel="preconnect" href={href} crossOrigin="" />
        ))}
        <link rel="stylesheet" href={typekit.href} />
      </head>
      <body className="min-h-full flex flex-col">
        <ChromeProvider chrome={chrome}>{children}</ChromeProvider>
        <PageTransition />
        <Suspense>
          <Live />
        </Suspense>
      </body>
    </html>
  );
}

/**
 * Keeps the page in step with Sanity. Published: a listener that expires
 * cached content the moment it changes. In draft mode (from the Studio's
 * Presentation tool): drafts too, plus the click-to-edit overlays.
 */
async function Live() {
  const { isEnabled } = await draftMode();
  return (
    <>
      <SanityLive includeDrafts={isEnabled} />
      {isEnabled && <VisualEditing />}
    </>
  );
}
