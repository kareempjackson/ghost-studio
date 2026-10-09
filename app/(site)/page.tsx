import type { Metadata } from "next";
import { stegaClean } from "next-sanity";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import {
  getEngagement,
  getHomePage,
  getSettings,
  getPointOfView,
  getProcess,
  getSectors,
  getServices,
  getTestimonials,
} from "@/sanity/content";
import { Engagement } from "./_components/Engagement";
import { ChatLauncher } from "./_components/ChatLauncher";
import { ContactBand } from "./_components/ContactBand";
import { ExploreWork } from "./_components/ExploreWork";
import { Hero } from "./_components/Hero";
import { IntroOverlay } from "./_components/IntroOverlay";
import { Journal } from "./_components/Journal";
import { Methodology } from "./_components/Methodology";
import { PointOfView } from "./_components/PointOfView";
import { Process } from "./_components/Process";
import { Sectors } from "./_components/Sectors";
import { Services } from "./_components/Services";
import { SelectedWork } from "./_components/SelectedWork";
import { SiteFooter } from "./_components/SiteFooter";
import { SiteHeader } from "./_components/SiteHeader";
import { Testimonials } from "./_components/Testimonials";

/**
 * The home page carries the site's own title and description, from the
 * layout; its share image is ./opengraph-image.png, the brand card.
 */
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const [
    settings,
    home,
    pointOfView,
    process,
    services,
    engagement,
    sectors,
    testimonials,
  ] = await Promise.all([
    getSettings(),
    getHomePage(),
    getPointOfView(),
    getProcess(),
    getServices(),
    getEngagement(),
    getSectors(),
    getTestimonials(),
  ]);

  /* Who the site belongs to, for search engines: the studio, its address,
     its mark and where else it is. */
  const name = stegaClean(settings.title);
  const structured = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name,
        url: absoluteUrl("/"),
        /* Files in public/, at addresses that never change: the app's
           own icon and share card are served under hashed names. */
        logo: absoluteUrl("/logo.png"),
        image: absoluteUrl("/og.png"),
        description: stegaClean(settings.description),
        email: stegaClean(settings.email),
        sameAs: settings.social.map((link) => stegaClean(link.href)),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name,
        url: absoluteUrl("/"),
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }}
      />
      <SiteHeader />
      {/* One layer above the footer, with its own ground: the page is the
          sheet that slides up off the footer lying underneath it. */}
      <main className="relative z-[1] flex flex-1 flex-col bg-surface-page">
        <Hero hero={home.hero} claim={home.claim} />
        <SelectedWork selectedWork={home.selectedWork} claim={home.claim} />
        <ExploreWork hero={home.hero} workAction={home.selectedWork.action} />
        <PointOfView pointOfView={pointOfView} />
        <Methodology
          methodology={home.methodology}
          action={pointOfView.action}
        />
        <Process process={process} />
        <Services services={services} action={pointOfView.action} />
        <Engagement engagement={engagement} />
        <Sectors sectors={sectors} />
        <Testimonials
          testimonials={testimonials}
          action={pointOfView.action}
        />
        <Journal journal={home.journal} />
      </main>
      {/* The close sits over the footer, not inside the page, so its rounded
          corners open onto the footer beneath it. */}
      <ContactBand />
      <SiteFooter />
      <ChatLauncher />
      <IntroOverlay />
    </>
  );
}
