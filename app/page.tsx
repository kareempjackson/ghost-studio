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

export default function Home() {
  return (
    <>
      <SiteHeader />
      {/* One layer above the footer, with its own ground: the page is the
          sheet that slides up off the footer lying underneath it. */}
      <main className="relative z-[1] flex flex-1 flex-col bg-surface-page">
        <Hero />
        <SelectedWork />
        <ExploreWork />
        <PointOfView />
        <Methodology />
        <Process />
        <Services />
        <Engagement />
        <Sectors />
        <Testimonials />
        <Journal />
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
