import {
  getEngagement,
  getHomePage,
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

export default async function Home() {
  const [
    home,
    pointOfView,
    process,
    services,
    engagement,
    sectors,
    testimonials,
  ] = await Promise.all([
    getHomePage(),
    getPointOfView(),
    getProcess(),
    getServices(),
    getEngagement(),
    getSectors(),
    getTestimonials(),
  ]);

  return (
    <>
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
