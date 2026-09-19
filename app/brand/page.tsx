import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";

import {
  // colour
  absolute,
  acid,
  colorRules,
  darkTheme,
  ink,
  lightTheme,
  pairings,
  signal,
  slate,
  themeToCssVariables,
  // type
  families,
  fluid,
  typeScale,
  typeStyleToCss,
  typekit,
  typographyRules,
  type TypeRole,
  // layout
  elevation,
  grid,
  layoutRules,
  radius,
  sectionRhythm,
  space,
  // motion
  duration,
  easing,
  motionRules,
  // mark
  logoBackgrounds,
  logoConstruction,
  logoList,
  logoMinimums,
  logoMisuse,
  logos,
  // voice
  bannedLanguage,
  positioning,
  voicePrinciples,
  writingMechanics,
} from "@/lib/brand";

import { CopyValue } from "./_components/CopyValue";
import { SectionNav } from "./_components/SectionNav";
import { guideSections } from "./_components/sections";
import { ContrastAudit, Ramp, SemanticTokens } from "./_components/Swatches";
import {
  Block,
  Compare,
  Eyebrow,
  Field,
  Mono,
  Pill,
  Rule,
  RuleList,
  Section,
  Table,
  Type,
} from "./_components/ui";

export const metadata: Metadata = {
  title: "Brand system",
  description:
    "The Ghost Savvy Studios brand system: the mark, the palette, the type scale, and the rules that keep them honest.",
};

const VERSION = "v1.0 — August 2026";

/**
 * The guide pins itself to the light theme rather than following the viewer's
 * preference. A colour specification has to be read on a known ground, or the
 * swatches are describing a page that no longer exists.
 */
const documentTheme = {
  ...themeToCssVariables(lightTheme),
  colorScheme: "light",
} as CSSProperties;

/* -------------------------------------------------------------------------- */

export default function BrandPage() {
  return (
    <div style={documentTheme} className="bg-surface-page text-primary">
      <a
        href="#positioning"
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-50 focus-visible:bg-ink-950 focus-visible:px-4 focus-visible:py-3 focus-visible:text-white"
      >
        Skip to the guide
      </a>

      <div className="xl:grid xl:grid-cols-[15rem_minmax(0,1fr)]">
        <SectionNav sections={guideSections} />

        <main className="min-w-0 xl:border-l xl:border-edge">
          <Cover />
          <Positioning />
          <Mark />
          <Colour />
          <Typography />
          <SpaceAndGrid />
          <Motion />
          <Voice />
          <InUse />
          <Tokens />
          <Colophon />
        </main>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Cover                                                                     */
/* -------------------------------------------------------------------------- */

function Cover() {
  return (
    <header className="bg-black text-white">
      <Field className="flex min-h-[85vh] flex-col justify-between gap-16 py-10 lg:py-14">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <Image
            src={logos.wordmark.src}
            alt="Ghost Savvy Studios"
            width={logos.wordmark.width}
            height={logos.wordmark.height}
            unoptimized
            priority
            className="h-6 w-auto sm:h-7"
          />
          <Type role="label" className="text-ink-400">
            Brand system &nbsp;/&nbsp; {VERSION}
          </Type>
        </div>

        <Type role="display-xl" as="h1" className="text-white">
          {positioning.line}
        </Type>

        <div className="grid gap-px border-t border-ink-800 bg-ink-800 sm:grid-cols-3">
          {[
            { k: "Typefaces", v: "DM Sans · Space Mono · Hardcover VF" },
            { k: "Palette", v: "Ink, signal, acid, slate" },
            { k: "Source", v: "lib/brand — TypeScript" },
          ].map((item) => (
            <div key={item.k} className="grid gap-2 bg-black pt-5">
              <Type role="label" className="text-ink-400">
                {item.k}
              </Type>
              <Type role="body-s" className="text-ink-200">
                {item.v}
              </Type>
            </div>
          ))}
        </div>
      </Field>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*  01 Positioning                                                            */
/* -------------------------------------------------------------------------- */

function Positioning() {
  return (
    <Section
      id="positioning"
      index="01"
      title="Positioning"
      lead={positioning.audience}
    >
      <div className="grid gap-14">
        <figure className="grid gap-6 border-y border-edge-strong py-10">
          <Type
            role="editorial"
            as="blockquote"
            className="text-primary"
            measure
          >
            {positioning.proof}
          </Type>
          <figcaption>
            <Eyebrow>Methodology — Clarity Engineering</Eyebrow>
          </figcaption>
        </figure>

        <div className="grid gap-px bg-edge sm:grid-cols-2">
          <div className="grid gap-3 bg-surface-page pt-5 sm:pr-8">
            <Eyebrow>The promise</Eyebrow>
            <Type role="body-l" className="text-primary" measure>
              {positioning.promise}
            </Type>
          </div>
          <div className="grid gap-3 bg-surface-page pt-5 sm:pl-8">
            <Eyebrow>Why the studio is called Ghost</Eyebrow>
            <Type role="body-l" className="text-secondary" measure>
              The O is missing from the wordmark. The studio is the gap the
              institution&rsquo;s work shows through — their name goes on the
              door, and the system keeps running after we leave.
            </Type>
          </div>
        </div>

        <Block
          title="What this document is for"
          note="A brand system is only worth the drift it prevents. Everything here is generated from lib/brand, so a value that changes in code changes on this page — and a rule with no token behind it is not a rule, it is an opinion."
        >
          <div className="grid gap-px bg-edge sm:grid-cols-3">
            {[
              {
                k: "Designers",
                v: "The scale, the ramps and the measures are the whole vocabulary. Nothing outside them ships.",
              },
              {
                k: "Engineers",
                v: "Import from @/lib/brand or use the Tailwind tokens. Never hard-code a hex.",
              },
              {
                k: "Writers",
                v: "Section 07 is binding. It is the fastest part of the brand to lose.",
              },
            ].map((item) => (
              <div key={item.k} className="grid gap-3 bg-surface-page pt-5">
                <Eyebrow>{item.k}</Eyebrow>
                <Type role="body-s" className="text-secondary" measure>
                  {item.v}
                </Type>
              </div>
            ))}
          </div>
        </Block>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  02 The mark                                                               */
/* -------------------------------------------------------------------------- */

function Mark() {
  return (
    <Section
      id="mark"
      index="02"
      title="The mark"
      lead="GHOST with the O removed. What is left is an aperture — and in the signature lockup a pill fills it, carrying the second word: GH(savvy)ST. Every pill elsewhere in the system quotes that shape, which is why the radius is reserved."
    >
      <div className="grid gap-14">
        <Block
          title="Variants"
          note="Five files, and no sixth. If a placement is not covered here, it is the wordmark on black."
        >
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {logoList.map((asset) => (
              <li key={asset.id} className="grid gap-4">
                <div
                  className={
                    asset.opaque
                      ? "flex items-center justify-center border border-edge"
                      : "flex items-center justify-center bg-black p-8"
                  }
                >
                  <Image
                    src={asset.src}
                    alt={`${asset.name} lockup`}
                    width={asset.width}
                    height={asset.height}
                    unoptimized
                    className={asset.shape === "square" ? "w-full" : "w-full"}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Type role="title" as="h4">
                      {asset.name}
                    </Type>
                    <Pill>{asset.shape}</Pill>
                  </div>
                  <Type role="body-s" className="text-secondary">
                    {asset.usage}
                  </Type>
                  <CopyValue value={asset.src} label={asset.name} />
                </div>
              </li>
            ))}
          </ul>
        </Block>

        <Block
          title="Construction and clear space"
          note={`X is the cap height of the wordmark — the height of the H. Clear space is ${logoConstruction.clearSpace}X on every side, at every size, in every medium.`}
        >
          <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-start lg:gap-12">
            <div
              className="inline-block bg-black"
              style={
                {
                  "--cap": "3rem",
                  padding: "calc(var(--cap) * 0.5)",
                } as CSSProperties
              }
            >
              <div className="relative">
                <Image
                  src={logos.wordmark.src}
                  alt="Wordmark with its clear space marked"
                  width={logos.wordmark.width}
                  height={logos.wordmark.height}
                  unoptimized
                  style={{ height: "var(--cap)", width: "auto" }}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute border border-dashed border-signal-500"
                  style={{ inset: "calc(var(--cap) * -0.5)" }}
                />
              </div>
            </div>

            <ul className="grid gap-4">
              {logoConstruction.notes.map((note) => (
                <li key={note} className="border-t border-edge pt-4">
                  <Type role="body-s" className="text-secondary" measure>
                    {note}
                  </Type>
                </li>
              ))}
            </ul>
          </div>
        </Block>

        <Block title="Minimum sizes">
          <Table
            head={["Context", "Floor"]}
            rows={logoMinimums.map((m) => [
              <Type key="c" role="body-s" className="text-primary">
                {m.context}
              </Type>,
              <Mono key="v" className="text-secondary">
                {m.value}
              </Mono>,
            ])}
          />
        </Block>

        <Block title="Grounds">
          <Table
            head={["Ground", "Instruction", ""]}
            rows={logoBackgrounds.map((b) => [
              <Type key="g" role="body-s" className="text-primary">
                {b.ground}
              </Type>,
              <Type key="i" role="body-s" className="text-secondary">
                {b.instruction}
              </Type>,
              <Pill key="p" tone={b.allowed ? "pass" : "fail"}>
                {b.allowed ? "Allowed" : "Never"}
              </Pill>,
            ])}
          />
        </Block>

        <Block
          title="Misuse"
          note="Four of these are shown so nobody has to imagine them."
        >
          <div className="grid gap-8">
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Do not stretch",
                  style: { transform: "scaleX(1.5)" },
                },
                {
                  label: "Do not rotate",
                  style: { transform: "rotate(-8deg)" },
                },
                {
                  label: "Do not add effects",
                  style: {
                    filter: "drop-shadow(0 6px 8px rgba(232,69,43,0.9))",
                  },
                },
                { label: "Do not use mid-ink grounds", ground: ink[500] },
              ].map((demo) => (
                <li key={demo.label} className="grid gap-3">
                  <div
                    className="relative flex h-24 items-center justify-center overflow-hidden px-6"
                    style={{ backgroundColor: demo.ground ?? absolute.black }}
                  >
                    <Image
                      src={logos.wordmark.src}
                      alt=""
                      width={logos.wordmark.width}
                      height={logos.wordmark.height}
                      unoptimized
                      className="h-4 w-auto"
                      style={demo.style}
                    />
                    <span
                      aria-hidden
                      className="absolute top-2 right-2 size-3 rounded-pill bg-signal-500"
                    />
                  </div>
                  <Type role="caption" className="text-secondary">
                    {demo.label}
                  </Type>
                </li>
              ))}
            </ul>

            <ul className="grid gap-px bg-edge sm:grid-cols-2">
              {logoMisuse.map((item) => (
                <li
                  key={item.title}
                  className="grid gap-2 bg-surface-page pt-5"
                >
                  <Type role="title" as="h4">
                    {item.title}
                  </Type>
                  <Type role="body-s" className="text-secondary" measure>
                    {item.detail}
                  </Type>
                </li>
              ))}
            </ul>
          </div>
        </Block>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  03 Colour                                                                 */
/* -------------------------------------------------------------------------- */

function Colour() {
  return (
    <Section
      id="colour"
      index="03"
      title="Colour"
      lead="Monochrome first. Institutional work has to survive a decade of content changes, third-party embeds and print, so the load-bearing palette is one warm-neutral ink ramp on paper. Colour is signal, not decoration."
    >
      <div className="grid gap-14">
        <div className="grid gap-10">
          <Ramp
            name="Ink"
            ramp={ink}
            note="The system. Hue held near 40° at very low saturation so long passages read as paper and print rather than screen grey. Ink 500 is the lightest step that clears 4.5:1 on paper; ink 400 is the lightest that clears 3:1 for borders and icons."
          />
          <Ramp
            name="Signal"
            ramp={signal}
            note="Vermilion. One element per viewport: the live link, the thing being changed, the deadline that is statutory. Signal 500 is a plane and a graphic; signal 700 is what carries small text on paper."
          />
          <Ramp
            name="Acid"
            ramp={acid}
            note="Chartreuse. The counter-signal, used behind or beneath signal to make a plane read as printed matter. Acid always takes ink, never white."
          />
          <Ramp
            name="Slate"
            ramp={slate}
            note="The quiet blue-grey for product chrome, avatars and diagrams — present without competing with signal."
          />
        </div>

        <Block
          title="Semantic layer"
          note="Components name these, never a ramp step. A semantic token survives a theme switch and a palette revision; ink.600 does not."
        >
          <div className="grid gap-10">
            <SemanticTokens
              name="Light — the default"
              theme={lightTheme}
              ground={ink[200]}
            />
            <SemanticTokens
              name="Dark — full-bleed bands and dark mode"
              theme={darkTheme}
              ground={ink[700]}
            />
          </div>
        </Block>

        <Block
          title="Contrast audit"
          note="Every pairing the brand ships, measured at render time by lib/brand/contrast.ts against WCAG 2.2. Nothing here is annotated by hand, so nothing here can go quietly out of date."
        >
          <ContrastAudit pairings={pairings} />
        </Block>

        <Block title="Rules">
          <RuleList items={colorRules} />
        </Block>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  04 Typography                                                             */
/* -------------------------------------------------------------------------- */

const SAMPLE: Partial<Record<TypeRole, string>> = {
  "display-xl": "Get it right in public",
  "display-l": "Knowing what to build",
  "display-m": "Five capabilities",
  editorial: "Accessibility is not a phase at the end",
  headline: "Content migration without editorial loss",
  title: "Systems integration",
  "body-l":
    "Governments, universities and mission-driven organisations hire us to define the problem properly.",
  body: "We build the system that solves it — accessible from the start, and yours to run afterwards.",
  "body-s":
    "Built to the standard the regulation names, not remediated after launch.",
  caption: "Figure 3 — service pattern, second review",
  label: "Who we work with",
  mono: "--gs-text-primary: #0E0D0B;",
};

function Typography() {
  const licensed = [families.grotesk, families.editorial];

  return (
    <Section
      id="typography"
      index="04"
      title="Typography"
      lead={`DM Sans carries the page and Space Mono sets the labels, both self-hosted from public/fonts through next/font/local. Hardcover VF appears once, served by Adobe Fonts kit ${typekit.id}. Synthetic bold is never an answer.`}
    >
      <div className="grid gap-14">
        <Block title="Families">
          <div className="grid gap-10">
            {licensed.map((family) => (
              <div
                key={family.id}
                className="grid gap-5 border-t border-edge pt-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <Type role="headline" as="h4">
                    {family.name}
                  </Type>
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill>
                      {family.variable ? "Variable 200–900" : "400 · 700"}
                    </Pill>
                    {family.italics ? <Pill>Italic</Pill> : null}
                  </div>
                </div>

                <p
                  className="[overflow-wrap:anywhere] text-primary"
                  style={{
                    fontFamily: family.stack,
                    fontSize: fluid(28, 56),
                    lineHeight: 1.05,
                    letterSpacing: "-0.02em",
                    fontWeight: family.id === "editorial" ? 300 : 700,
                    fontStyle: family.id === "editorial" ? "italic" : "normal",
                  }}
                >
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ
                  <br />
                  abcdefghijklmnopqrstuvwxyz 0123456789
                </p>

                <div className="flex flex-wrap gap-x-8 gap-y-3">
                  {family.weights.map((weight) => (
                    <span
                      key={weight}
                      className="text-primary"
                      style={{
                        fontFamily: family.stack,
                        fontWeight: weight,
                        fontSize: "1.375rem",
                      }}
                    >
                      {weight}
                    </span>
                  ))}
                </div>

                <div className="grid gap-2">
                  <Type role="body-s" className="text-secondary" measure>
                    {family.role}
                  </Type>
                  <Mono className="text-tertiary">{family.stack}</Mono>
                </div>
              </div>
            ))}

            <div className="grid gap-3 border-t border-edge pt-6">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <Type role="headline" as="h4">
                  {families.mono.name}
                </Type>
                <Pill>Unlicensed — system stack</Pill>
              </div>
              <Type role="body-s" className="text-secondary" measure>
                {families.mono.role} Deliberately not a brand face: tokens and
                code should look like tokens and code.
              </Type>
              <Mono className="text-tertiary">{families.mono.stack}</Mono>
            </div>
          </div>
        </Block>

        <Block
          title="The scale"
          note={`Twelve roles. Sizes are fluid between ${390}px and ${1440}px viewports and stop at both ends, so type never drifts past a size that was drawn. Measure is capped in ch and enforced, not suggested.`}
        >
          <ul className="grid gap-px bg-edge">
            {(Object.keys(typeScale) as TypeRole[]).map((role) => {
              const spec = typeScale[role];
              return (
                <li
                  key={role}
                  className="grid gap-4 bg-surface-page py-8 lg:grid-cols-[14rem_1fr] lg:gap-10"
                >
                  <div className="grid content-start gap-1.5">
                    <Type role="label" className="text-primary">
                      {spec.label}
                    </Type>
                    <Mono className="text-tertiary">
                      {spec.size[0]}→{spec.size[1]}px · {spec.lineHeight} ·{" "}
                      {spec.letterSpacing}em · {spec.weight}
                      {spec.measure ? ` · ${spec.measure}ch` : ""}
                    </Mono>
                    <Type role="caption" className="text-secondary">
                      {spec.usage}
                    </Type>
                  </div>
                  <p
                    className="min-w-0 text-primary"
                    style={{
                      ...typeStyleToCss(spec),
                      maxInlineSize: spec.measure
                        ? `${spec.measure}ch`
                        : undefined,
                    }}
                  >
                    {SAMPLE[role] ?? spec.label}
                  </p>
                </li>
              );
            })}
          </ul>
        </Block>

        <Block title="Rules">
          <RuleList items={typographyRules} />
        </Block>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  05 Space and grid                                                         */
/* -------------------------------------------------------------------------- */

function SpaceAndGrid() {
  return (
    <Section
      id="space"
      index="05"
      title="Space &amp; grid"
      lead="The page is a printed sheet: a hard outer margin, a hairline under every band, and a twelve-column field that content breaks out of exactly once per section. With very little colour and very few rules, distance does the hierarchy."
    >
      <div className="grid gap-14">
        <Block
          title="Space"
          note="4px base. Steps are named by their multiple, so the name is the maths."
        >
          <div className="overflow-x-auto">
            <ul className="grid min-w-[24rem] gap-px bg-edge">
              {Object.entries(space).map(([step, value]) => (
                <li
                  key={step}
                  className="flex items-center gap-6 bg-surface-page py-2"
                >
                  <Mono className="w-8 shrink-0 text-tertiary tabular-nums">
                    {step}
                  </Mono>
                  <Mono className="w-20 shrink-0 text-secondary">{value}</Mono>
                  <span
                    aria-hidden
                    className="h-3 bg-ink-950"
                    style={{ width: value }}
                  />
                </li>
              ))}
            </ul>
          </div>
        </Block>

        <Block
          title="Radius"
          note="Square by default — institutional work should not look soft. Pill is the aperture from the wordmark and is reserved for tags, avatars, the savvy lockup and one primary control."
        >
          <ul className="flex flex-wrap gap-6">
            {Object.entries(radius).map(([name, value]) => (
              <li key={name} className="grid gap-2">
                <span
                  aria-hidden
                  className="block size-20 border border-edge-strong"
                  style={{ borderRadius: value }}
                />
                <Type role="label" className="text-primary">
                  {name}
                </Type>
                <Mono className="text-tertiary">{value}</Mono>
              </li>
            ))}
          </ul>
        </Block>

        <Block
          title="Field"
          note={`${grid.columns} columns, a ${grid.gutter.min}–${grid.gutter.max}px gutter and a ${grid.margin.min}–${grid.margin.max}px page margin, bounded at ${grid.maxWidth}px. Long-form reading is bounded far earlier, at ${grid.proseWidth}px.`}
        >
          <div className="grid gap-6">
            <div
              aria-hidden
              className="grid gap-2 border border-edge p-2"
              style={{
                gridTemplateColumns: `repeat(${grid.columns}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: grid.columns }).map((_, i) => (
                <span key={i} className="h-24 bg-ink-100" />
              ))}
            </div>
            <Table
              head={["Band", "Vertical rhythm"]}
              rows={Object.entries(sectionRhythm).map(([name, r]) => [
                <Type key="n" role="body-s" className="text-primary">
                  {name}
                </Type>,
                <Mono key="v" className="text-secondary">
                  {r.min}px → {r.max}px
                </Mono>,
              ])}
            />
          </div>
        </Block>

        <Block
          title="Elevation"
          note="Nearly absent by design. A shadow claims that something floats, and in a document almost nothing does."
        >
          <ul className="flex flex-wrap gap-6">
            {Object.entries(elevation).map(([name, value]) => (
              <li key={name} className="grid gap-3">
                <span
                  aria-hidden
                  className="block size-28 bg-surface-page"
                  style={{
                    boxShadow: value,
                    border:
                      value === "none"
                        ? "1px solid var(--gs-border-default)"
                        : undefined,
                  }}
                />
                <Type role="label" className="text-primary">
                  {name}
                </Type>
              </li>
            ))}
          </ul>
        </Block>

        <Block title="Rules">
          <RuleList items={layoutRules} />
        </Block>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  06 Motion                                                                 */
/* -------------------------------------------------------------------------- */

function Motion() {
  return (
    <Section
      id="motion"
      index="06"
      title="Motion"
      lead="Motion explains a state change. It does not decorate, and it never delays somebody trying to file something. If a transition can be removed without losing meaning, remove it."
    >
      <div className="grid gap-14">
        <Block title="Duration">
          <Table
            head={["Token", "ms", "Use"]}
            rows={[
              [
                "instant",
                duration.instant,
                "Toggles, checkboxes, hover states",
              ],
              ["fast", duration.fast, "Tooltips, small reveals"],
              [
                "base",
                duration.base,
                "The default for anything that moves or fades",
              ],
              ["slow", duration.slow, "Panels, drawers, disclosure"],
              [
                "deliberate",
                duration.deliberate,
                "Full-bleed section reveals. The ceiling.",
              ],
            ].map(([token, ms, use]) => [
              <Mono key="t" className="text-primary">
                {token}
              </Mono>,
              <Mono key="m" className="text-secondary tabular-nums">
                {ms}
              </Mono>,
              <Type key="u" role="body-s" className="text-secondary">
                {use}
              </Type>,
            ])}
          />
        </Block>

        <Block
          title="Easing"
          note="Hover or focus a curve to run it. Under prefers-reduced-motion the travel is removed and the feedback stays."
        >
          <ul className="grid gap-px bg-edge">
            {Object.entries(easing).map(([name, curve]) => (
              <li key={name} className="bg-surface-page py-4">
                <button
                  type="button"
                  className="group grid w-full gap-3 text-left sm:grid-cols-[10rem_1fr] sm:items-center sm:gap-8"
                  aria-label={`Preview the ${name} curve`}
                >
                  <span className="grid gap-1">
                    <Type role="label" as="span" className="text-primary">
                      {name}
                    </Type>
                    <Mono className="text-tertiary">{curve}</Mono>
                  </span>
                  <span
                    aria-hidden
                    className="relative block h-8 w-56 max-w-full border-b border-edge"
                  >
                    <span
                      className="absolute bottom-0 left-0 block size-3 rounded-pill bg-ink-950 transition-transform group-hover:translate-x-[13.25rem] group-focus-visible:translate-x-[13.25rem]"
                      style={{
                        transitionDuration: `${duration.deliberate}ms`,
                        transitionTimingFunction: curve,
                      }}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Block>

        <Block title="Rules">
          <RuleList items={motionRules} />
        </Block>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  07 Voice                                                                  */
/* -------------------------------------------------------------------------- */

function Voice() {
  return (
    <Section
      id="voice"
      index="07"
      title="Voice"
      lead="The reader is a programme lead accountable to a minister, an auditor or a court. They are not looking to be impressed. Write every line as if it will be read aloud in a procurement review."
    >
      <div className="grid gap-14">
        <div className="grid gap-10">
          {voicePrinciples.map((principle, i) => (
            <div key={principle.name} className="grid gap-5">
              <div className="grid gap-3 border-t border-edge-strong pt-5 sm:grid-cols-[3rem_1fr] sm:gap-6">
                <Eyebrow className="pt-1">
                  {String(i + 1).padStart(2, "0")}
                </Eyebrow>
                <div className="grid gap-2">
                  <Type role="headline" as="h3">
                    {principle.name} — {principle.statement}
                  </Type>
                  <Type role="body-s" className="text-secondary" measure>
                    {principle.why}
                  </Type>
                </div>
              </div>
              <div className="sm:pl-[4.5rem]">
                <Compare yes={principle.yes} no={principle.no} />
              </div>
            </div>
          ))}
        </div>

        <Block title="Mechanics">
          <ul className="grid gap-px bg-edge">
            {writingMechanics.map((m) => (
              <li key={m.rule} className="grid gap-2 bg-surface-page py-5">
                <Type role="title" as="h4" measure>
                  {m.rule}
                </Type>
                <Type role="body-s" className="text-secondary" measure>
                  {m.detail}
                </Type>
              </li>
            ))}
          </ul>
        </Block>

        <Block
          title="Words the studio does not use"
          note="Not a stylistic preference. Each of these moves risk from the writer to the reader."
        >
          <Table
            head={["Avoid", "Write instead"]}
            rows={bannedLanguage.map((w) => [
              <Type
                key="a"
                role="body-s"
                className="text-disabled line-through decoration-1"
              >
                {w.avoid}
              </Type>,
              <Type key="i" role="body-s" className="text-primary">
                {w.instead}
              </Type>,
            ])}
          />
        </Block>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  08 In use                                                                 */
/* -------------------------------------------------------------------------- */

function InUse() {
  return (
    <Section
      id="in-use"
      index="08"
      title="In use"
      lead="The system assembled. Every element here is built from the tokens above and nothing else."
    >
      <div className="grid gap-14">
        <Block
          title="Controls"
          note="Primary is ink. Signal is the single most important action on a page and there is never a second one. Every target clears 44px."
        >
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              className="inline-flex min-h-11 items-center bg-ink-950 px-6 font-sans text-[0.9375rem] font-bold text-white transition-colors duration-150 hover:bg-ink-800"
            >
              Start a project
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center bg-signal-500 px-6 font-sans text-[0.9375rem] font-bold text-white transition-colors duration-150 hover:bg-signal-600"
            >
              Book the discovery call
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center border border-edge-strong px-6 font-sans text-[0.9375rem] font-bold text-primary transition-colors duration-150 hover:bg-surface-subtle"
            >
              See how we work
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-edge px-5 font-sans text-[0.9375rem] text-primary transition-colors duration-150 hover:border-edge-strong"
            >
              Read the method
              <span aria-hidden>&rarr;</span>
            </button>
            <a
              href="#colour"
              className="font-sans text-[0.9375rem] font-bold text-accent underline decoration-1 underline-offset-4"
            >
              Read the accessibility statement
            </a>
          </div>
        </Block>

        <Block
          title="Field"
          note="The focus ring is a brand element: 2px signal, 2px offset, never removed. Error state carries a word as well as a colour."
        >
          <div className="grid max-w-md gap-2">
            <label
              htmlFor="demo-field"
              className="font-sans text-[0.9375rem] font-bold text-primary"
            >
              Organisation name
            </label>
            <input
              id="demo-field"
              type="text"
              placeholder="Department for Transport"
              className="min-h-11 border border-edge bg-surface-page px-3 font-sans text-[1.0625rem] text-primary placeholder:text-disabled"
            />
            <span className="font-sans text-[0.8125rem] text-secondary">
              As it should appear in the published case study.
            </span>
          </div>
        </Block>

        <Block
          title="Poster"
          note="The one place the palette gets loud: acid behind, signal on top, ink for the type. This is a plane, not a component — it appears once in a page and never inside a card."
        >
          <div className="relative isolate max-w-lg">
            <div
              aria-hidden
              className="absolute inset-0 translate-x-3 translate-y-3 -z-10"
              style={{ backgroundColor: acid[400] }}
            />
            <div
              className="grid gap-6 p-8"
              style={{ backgroundColor: signal[500] }}
            >
              <Type role="display-m" as="p" className="text-white">
                Accessibility is not a phase at the end
              </Type>
              <Type role="body-s" className="text-white/90" measure>
                Public websites in the United States face a fixed compliance
                review: Title II of the ADA sets WCAG 2.1 Level AA as the
                standard. Build to it, or remediate in public.
              </Type>
            </div>
          </div>
        </Block>

        <Block
          title="Band"
          note="A full-bleed inverse section, the studio's standard punctuation between arguments."
        >
          <div className="bg-black px-6 py-12 text-white sm:px-10 sm:py-16">
            <div className="grid gap-8">
              <Type role="label" className="text-ink-400">
                Methodology — Clarity Engineering
              </Type>
              <Type role="display-l" as="p" className="text-white" measure>
                Building has never been the hard part
              </Type>
              <ol className="grid gap-px bg-ink-800 sm:grid-cols-3">
                {[
                  ["01", "Discover the job"],
                  ["02", "Define the system"],
                  ["03", "Hand over the keys"],
                ].map(([n, label]) => (
                  <li key={n} className="grid gap-2 bg-black pt-5">
                    <Type role="label" className="text-ink-400">
                      {n}
                    </Type>
                    <Type role="title" className="text-white">
                      {label}
                    </Type>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Block>

        <Block
          title="Tags"
          note="Pills quote the aperture. Use them for capability tags and filters, never for buttons that navigate."
        >
          <div className="flex flex-wrap gap-2">
            {[
              "Accessibility compliance",
              "Content migration",
              "Headless builds",
              "Systems integration",
              "Custom data systems",
            ].map((tag) => (
              <Pill key={tag}>{tag}</Pill>
            ))}
            <Pill tone="signal">Statutory deadline</Pill>
            <Pill tone="acid">In review</Pill>
          </div>
        </Block>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  09 Tokens                                                                 */
/* -------------------------------------------------------------------------- */

const USAGE = `import {
  brand,
  contrastRatio,
  lightTheme,
  typeScale,
  typeStyleToCss,
  wcagLevel,
} from "@/lib/brand";

// Semantic first. Components never name a ramp step.
const heading = lightTheme.text.primary;      // #0E0D0B
const rule    = lightTheme.border.default;    // #DEDBD4

// Type roles carry size, line-height, tracking, weight and case together.
<h2 style={typeStyleToCss(typeScale["display-m"])}>Five capabilities</h2>

// Check a pairing before it ships, not after the audit.
const ratio = contrastRatio(brand.color.signal[500], "#FFFFFF");
wcagLevel(ratio);          // "AA Large" — signal 500 is a plane, not body copy
wcagLevel(ratio, "large"); // "AA Large"`;

const TAILWIND = `<!-- Semantic utilities, wired in app/globals.css -->
<section class="bg-surface-subtle text-primary border-t border-edge">
  <p class="text-secondary">Deck copy.</p>
  <span class="rounded-pill bg-signal-500 text-white">One per viewport.</span>
</section>`;

function Tokens() {
  return (
    <Section
      id="tokens"
      index="09"
      title="Using the tokens"
      lead="lib/brand is the source of truth and app/globals.css mirrors it for Tailwind. This page renders from the TypeScript, so a value that changes in code changes here — which is the only reason to trust a brand guide."
    >
      <div className="grid gap-14">
        <Block title="Files">
          <Table
            head={["Path", "Holds"]}
            rows={[
              [
                "lib/brand/color.ts",
                "Ramps, semantic themes, documented pairings, colour rules",
              ],
              [
                "lib/brand/contrast.ts",
                "WCAG 2.2 maths — luminance, ratio, level, best-text-on",
              ],
              [
                "lib/brand/typography.ts",
                "Families, the fluid scale, type roles, typography rules",
              ],
              [
                "lib/brand/layout.ts",
                "Space, radius, stroke, grid, breakpoints, elevation",
              ],
              [
                "lib/brand/motion.ts",
                "Durations, easings, travel, the reduced-motion guard",
              ],
              [
                "lib/brand/logo.ts",
                "Asset manifest, construction, minimums, grounds, misuse",
              ],
              [
                "lib/brand/voice.ts",
                "Positioning, voice principles, mechanics, banned language",
              ],
              [
                "app/globals.css",
                "The same values as CSS custom properties and Tailwind theme",
              ],
            ].map(([path, holds]) => [
              <CopyValue key="p" value={path} label={path} />,
              <Type key="h" role="body-s" className="text-secondary">
                {holds}
              </Type>,
            ])}
          />
        </Block>

        <Block title="TypeScript">
          <pre className="overflow-x-auto border border-edge bg-surface-subtle p-5">
            <code className="font-mono text-[0.8125rem] leading-6 text-primary">
              {USAGE}
            </code>
          </pre>
        </Block>

        <Block title="Tailwind">
          <pre className="overflow-x-auto border border-edge bg-surface-subtle p-5">
            <code className="font-mono text-[0.8125rem] leading-6 text-primary">
              {TAILWIND}
            </code>
          </pre>
        </Block>

        <Block
          title="Loading the faces"
          note="DM Sans and Space Mono are self-hosted from public/fonts through next/font/local. Hardcover VF is licensed through Adobe Fonts and cannot be self-hosted, so the kit is linked from the root layout with a preconnect. Every fallback stack is ordered to hold metrics, because institutional traffic includes locked desktops where the kit will not load at all."
        >
          <pre className="overflow-x-auto border border-edge bg-surface-subtle p-5">
            <code className="font-mono text-[0.8125rem] leading-6 text-primary">
              {`<link rel="stylesheet" href="${typekit.href}" />`}
            </code>
          </pre>
        </Block>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */

function Colophon() {
  return (
    <footer className="bg-black text-white">
      <Field className="grid gap-10 py-14 lg:py-20">
        <Rule className="bg-ink-800" />
        <div className="flex flex-wrap items-end justify-between gap-8">
          <Image
            src={logos.wordmark.src}
            alt="Ghost Savvy Studios"
            width={logos.wordmark.width}
            height={logos.wordmark.height}
            unoptimized
            className="h-8 w-auto"
          />
          <div className="grid gap-1 text-right">
            <Type role="label" className="text-ink-400">
              Brand system {VERSION}
            </Type>
            <Type role="caption" className="text-ink-300">
              Rendered from lib/brand. Change the token, not the page.
            </Type>
          </div>
        </div>
      </Field>
    </footer>
  );
}
