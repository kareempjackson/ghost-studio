import type { Metadata } from "next";
import Image from "next/image";
import type { CSSProperties } from "react";
import { aboutPage } from "@/lib/about";
import { ChatLauncher } from "../_components/ChatLauncher";
import { ContactBand } from "../_components/ContactBand";
import { PageCover } from "../_components/PageCover";
import { MONO, SectionHead } from "../_components/SectionHead";
import { SiteFooter } from "../_components/SiteFooter";
import { SiteHeader } from "../_components/SiteHeader";
import { LABEL, StudioStrip } from "../_components/StudioStrip";
import { UpRight } from "../_components/UpRight";

export const metadata: Metadata = {
  title: aboutPage.title,
  description: aboutPage.description,
};

/** 26px at 390 to 36px at 1440, held there. One expectation, as a claim. */
const EXPECT_STYLE: CSSProperties = {
  fontSize: "clamp(1.625rem, 1.3929rem + 0.952vw, 2.25rem)",
  fontWeight: 500,
  letterSpacing: "-0.04em",
  lineHeight: 1.1,
};

/** 26px at 390 to 32px at 1440, held there. What a family member is for. */
const FAMILY_STYLE: CSSProperties = {
  fontSize: "clamp(1.625rem, 1.4857rem + 0.571vw, 2rem)",
  fontWeight: 400,
  letterSpacing: "-0.04em",
  lineHeight: 1.12,
};

const BAND = "px-5 py-24 sm:px-8 lg:px-12 lg:py-36";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * `/about` — who the studio is.
 *
 * The cover and the strip are the ones `/services` opens on, so the two
 * pages read as one voice. Then four answers in the order a stranger asks
 * them: what you do, who does it, what it is like, and what else you are.
 */
export default function About() {
  const { who, team, expect, family } = aboutPage;

  return (
    <>
      <SiteHeader />
      {/* One layer above the footer, with its own ground: the page is the
          sheet that slides up off the footer lying underneath it. */}
      <main className="relative z-[1] flex flex-1 flex-col bg-surface-page">
        <PageCover
          id="about-heading"
          eyebrow={aboutPage.eyebrow}
          heading={aboutPage.heading}
          summary={aboutPage.summary}
          action={aboutPage.action}
        />

        <StudioStrip />

        <section aria-labelledby="who-heading" className={BAND}>
          <SectionHead
            id="who-heading"
            label={who.label}
            heading={who.heading}
            deck={who.deck}
          >
            <div className="mt-14 max-w-[42rem] space-y-6 text-[1.0625rem] leading-[1.7] tracking-[-0.01em] text-primary lg:mt-24 lg:text-[1.1875rem]">
              {who.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </SectionHead>
        </section>

        <section
          id="team"
          aria-labelledby="team-heading"
          className={`scroll-mt-[var(--gs-header-h)] ${BAND}`}
        >
          <SectionHead
            id="team-heading"
            label={team.label}
            heading={team.heading}
            deck={team.deck}
          />

          <ul className="mt-14 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:mt-24 lg:grid-cols-3 lg:gap-y-16">
            {team.members.map((member, index) => (
              <li key={member.name}>
                <div
                  style={{ backgroundColor: member.ground }}
                  className="relative aspect-square overflow-hidden"
                >
                  {member.portrait ? (
                    <Image
                      src={member.portrait}
                      alt={member.name}
                      fill
                      sizes="(min-width: 1024px) 31vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className={`${LABEL} absolute top-4 left-4 text-ink-950 sm:top-6 sm:left-6 lg:top-7 lg:left-7`}
                    >
                      {team.portraitLabel} / {pad(index + 1)}
                    </span>
                  )}
                </div>
                <h3 className="mt-5 text-[1.25rem] leading-[1.2] font-normal tracking-[-0.03em] text-primary lg:mt-6 lg:text-[1.375rem]">
                  {member.name}
                </h3>
                <p className={`${LABEL} mt-3 text-ink-500`}>{member.role}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="expect-heading" className={BAND}>
          <SectionHead
            id="expect-heading"
            label={expect.label}
            heading={expect.heading}
          />

          <ol className="mt-14 grid gap-y-14 lg:mt-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-x-8 lg:gap-y-20">
            {expect.items.map((item, index) => (
              <li key={item.title}>
                <p className={`${MONO} text-ink-500`}>{pad(index + 1)}</p>
                <h3 className="mt-6 text-primary lg:mt-8" style={EXPECT_STYLE}>
                  {item.title}
                </h3>
                <p className="mt-4 max-w-[30rem] text-[1rem] leading-[1.6] tracking-[-0.01em] text-secondary lg:mt-6 lg:text-[1.0625rem]">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="family-heading" className={BAND}>
          <SectionHead
            id="family-heading"
            label={family.label}
            heading={family.heading}
          />

          <ul className="mt-14 grid gap-y-14 sm:grid-cols-3 sm:gap-x-5 lg:mt-24">
            {family.members.map((member) => (
              <li key={member.name}>
                <a
                  href={member.href}
                  className="group flex flex-col text-primary"
                >
                  <span className={`${LABEL} text-ink-950`}>{member.name}</span>
                  <span
                    className="mt-8 transition-colors duration-200 group-hover:text-accent lg:mt-12"
                    style={FAMILY_STYLE}
                  >
                    {member.statement.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </span>
                  <span className="mt-10 transition-colors duration-200 group-hover:text-accent lg:mt-16">
                    <UpRight />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
      {/* The close sits over the footer, not inside the page, so its rounded
          corners open onto the footer beneath it. */}
      <ContactBand />
      <SiteFooter />
      <ChatLauncher />
    </>
  );
}
