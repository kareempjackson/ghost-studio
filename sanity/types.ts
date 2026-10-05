/**
 * The content, as the components read it.
 *
 * These are the shapes the site was built against when its copy lived in
 * typed objects, kept as they were; sanity/content.ts projects every query
 * into one of them. A picture is a CDN URL, or null until it is uploaded,
 * and the components fall back to the ground colour beside it.
 */

export interface Link {
  readonly label: string;
  readonly href: string;
}

export type Lines = readonly string[];

export interface Picture {
  readonly src: string | null;
  readonly alt: string;
}

/* ---- Site ---------------------------------------------------------------- */

export interface SiteSettings {
  readonly title: string;
  readonly description: string;
  readonly email: string;
  readonly social: readonly { readonly id: string; readonly label: string; readonly href: string }[];
  readonly headerAction: Link;
}

export interface NavItem extends Link {
  readonly inHeader: boolean;
  readonly children?: readonly Link[];
  readonly intro?: { readonly label: string; readonly deck: string };
}

export interface VentureLink extends Link {
  readonly ground: string;
  readonly ink: string;
}

export interface Navigation {
  readonly items: readonly NavItem[];
  readonly ventures: { readonly label: string; readonly links: readonly VentureLink[] };
  readonly contactLabel: string;
  readonly featureLabel: string;
  readonly openLabel: string;
  /** The one piece of work the menu carries: the first selected project. */
  readonly feature: Project | null;
  /** The chain of people the menu's feature card sets, from the services page. */
  readonly network: ServicesPage["method"]["network"];
}

export interface Footer {
  readonly contactBand: { readonly eyebrow: string; readonly heading: Lines; readonly action: Link };
  readonly explore: { readonly label: string; readonly links: readonly Link[] };
  readonly newsletter: {
    readonly heading: string;
    readonly placeholder: string;
    readonly inputLabel: string;
    readonly action: string;
    readonly subject: string;
    readonly note: { readonly before: string; readonly link: Link; readonly after: string };
    readonly done: string;
    readonly invalid: string;
  };
  readonly legal: readonly Link[];
  readonly top: string;
}

export interface Chat {
  readonly launcher: { readonly open: string; readonly close: string; readonly label: string };
  readonly heading: string;
  readonly status: string;
  readonly intro: string;
  readonly topics: Lines;
  readonly topicsLabel: string;
  readonly name: { readonly label: string; readonly placeholder: string };
  readonly email: { readonly label: string; readonly placeholder: string };
  readonly message: { readonly label: string; readonly placeholder: string };
  readonly preview: string;
  readonly ready: {
    readonly label: string;
    readonly about: string;
    readonly from: string;
    readonly message: string;
    readonly empty: string;
    readonly send: string;
    readonly edit: string;
  };
  readonly note: string;
  readonly contact: string;
  readonly closeLabel: string;
}

/** Everything the header, menu, footer and chat need, fetched once in the layout. */
export interface Chrome {
  readonly settings: SiteSettings;
  readonly navigation: Navigation;
  readonly footer: Footer;
  readonly chat: Chat;
}

/* ---- Work and articles ----------------------------------------------------- */

export type Discipline = "Brand" | "Digital" | "Systems";

export interface Project {
  readonly slug: string;
  readonly name: string;
  readonly scope: string;
  readonly tagline: string;
  readonly location: string;
  readonly sector: string;
  readonly disciplines: readonly Discipline[];
  readonly ground: string;
  /** Null until the picture is uploaded: a draft can exist without one. */
  readonly image: string | null;
  readonly imageAlt: string;
}

export type Topic = "Strategy" | "Design" | "Engineering";

export interface ArticleCard {
  readonly slug: string;
  readonly topic: Topic;
  readonly title: Lines;
  readonly excerpt: string;
  readonly cover: { readonly src: string | null; readonly alt: string; readonly ground: string };
}

/** Portable Text, as stored. Rendered by app/(site)/_components/RichText.tsx. */
export type RichText = readonly { readonly _type: string; readonly _key: string; readonly [key: string]: unknown }[];

export type MediaAspect = "landscape" | "wide" | "portrait";

/** One plate: a picture, a film over it, or the ground until either is in. */
export interface Media {
  readonly src: string | null;
  readonly alt: string;
  readonly video: string | null;
  readonly ground: string | null;
  readonly aspect: MediaAspect;
}

export interface Chapter {
  /** The anchor, from the label: "brand-identity". */
  readonly id: string;
  readonly label: string;
  readonly heading: string;
  readonly body: Lines;
  readonly listHeading: string | null;
  readonly items: readonly { readonly lead: string | null; readonly text: string }[];
  readonly media: readonly (readonly Media[])[];
}

/** A project's own page: the card's record, and the case study if written. */
export interface ProjectDetail extends Project {
  readonly description: string | null;
  readonly hero: Media | null;
  readonly logo: Picture;
  readonly headline: string;
  readonly facts: readonly { readonly label: string; readonly value: string }[];
  readonly tags: Lines;
  readonly overview: Lines;
  readonly website: string | null;
  readonly feature: Media | null;
  readonly chapters: readonly Chapter[];
  readonly more: readonly Project[];
}

export interface ArticleDetail extends ArticleCard {
  readonly publishedAt: string | null;
  readonly description: string | null;
  readonly body: RichText | null;
}

/* ---- Bands ----------------------------------------------------------------- */

export interface JournalSection {
  readonly eyebrow: string;
  readonly heading: string;
  readonly featured: {
    readonly slug: string;
    readonly category: string;
    readonly label: string;
    readonly title: Lines;
    readonly summary: string;
    readonly action: string;
    readonly image: { readonly src: string | null; readonly alt: string };
  };
  readonly entries: readonly {
    readonly slug: string;
    readonly category: string;
    readonly title: Lines;
    readonly excerpt: string;
    readonly cover: { readonly src: string | null; readonly alt: string; readonly ground: string };
  }[];
}

export interface HomePage {
  readonly hero: {
    readonly video: string | null;
    readonly poster: string | null;
    readonly showreelLabel: string;
    readonly showreelMark: string;
  };
  readonly claim: { readonly cover: Lines; readonly motto: Lines };
  readonly methodology: { readonly heading: string; readonly difference: string };
  readonly selectedWork: {
    readonly tag: string;
    readonly items: readonly Project[];
    readonly action: Link;
  };
  readonly journal: JournalSection;
}

export interface ViewCard {
  readonly label: string;
  readonly statement: string;
  readonly action: string;
  readonly ground: string;
  readonly tilt: number;
}

export interface PointOfView {
  readonly eyebrow: string;
  readonly heading: Lines;
  readonly deck: Lines;
  readonly action: Link;
  readonly cards: readonly ViewCard[];
}

export type ProcessIconName = "target" | "merge" | "layers" | "cycle";

export interface ProcessStep {
  readonly title: string;
  readonly short: string;
  readonly question: string;
  readonly body: string;
  readonly outputs: Lines;
  readonly icon: ProcessIconName;
}

export interface Process {
  readonly mark: string;
  readonly steps: readonly ProcessStep[];
}

export interface Service {
  readonly slug: string;
  readonly name: string;
  readonly promise: string;
  readonly capabilities: Lines;
  readonly action: string;
}

export interface Services {
  readonly eyebrow: string;
  readonly cta: string;
  readonly items: readonly Service[];
}

export interface EngagementModel {
  readonly slug: string;
  readonly name: string;
  readonly kind: string;
  readonly copy: string;
  readonly audience: string;
  readonly terms: string;
  readonly action: Link;
}

export interface Engagement {
  readonly chip: string;
  readonly title: string;
  readonly subtitle: string;
  readonly image: { readonly src: string; readonly width: number; readonly height: number; readonly alt: string };
  readonly models: readonly EngagementModel[];
}

export interface Sector {
  readonly slug: string;
  readonly name: string;
  readonly work: string;
  readonly image: string;
}

export interface Sectors {
  readonly eyebrow: string;
  readonly items: readonly Sector[];
}

export interface Testimonial {
  readonly quote: string;
  readonly name: string;
  readonly role: string;
  readonly company: string;
}

export interface Testimonials {
  readonly eyebrow: string;
  readonly heading: string;
  readonly deck: Lines;
  readonly label: string;
  readonly items: readonly Testimonial[];
  readonly controls: {
    readonly previous: string;
    readonly next: string;
    readonly previousLabel: string;
    readonly nextLabel: string;
  };
}

export interface StudioStrip {
  readonly label: string;
  readonly tee: Picture;
  readonly principle: { readonly label: string; readonly statement: Lines; readonly source: string };
  readonly tote: Picture;
}

/* ---- Pages ----------------------------------------------------------------- */

interface Seo {
  readonly title: string;
  readonly description: string;
}

interface Cover {
  readonly eyebrow: string;
  readonly heading: Lines;
  readonly summary: string;
  readonly action: Link;
}

export interface Step {
  readonly title: string;
  readonly body: string;
}

export interface Question {
  readonly question: string;
  readonly answer: string;
}

export interface TeamMember {
  readonly name: string;
  readonly role: string;
  readonly portrait: string | null;
  readonly ground: string;
}

export interface FamilyMember {
  readonly name: string;
  readonly statement: Lines;
  readonly href: string;
}

export interface AboutPage extends Seo, Cover {
  readonly who: { readonly label: string; readonly heading: string; readonly deck: string; readonly body: Lines };
  readonly team: {
    readonly label: string;
    readonly heading: Lines;
    readonly deck: string;
    readonly portraitLabel: string;
    readonly members: readonly TeamMember[];
  };
  readonly expect: { readonly label: string; readonly heading: string; readonly items: readonly Step[] };
  readonly family: { readonly label: string; readonly heading: Lines; readonly members: readonly FamilyMember[] };
}

export interface ServicesPage extends Seo, Cover {
  readonly ways: { readonly label: string; readonly heading: string; readonly deck: string };
  readonly disciplines: { readonly label: string; readonly heading: string; readonly deck: string };
  readonly method: {
    readonly label: string;
    readonly heading: Lines;
    readonly copy: Lines;
    readonly action: Link;
    readonly network: {
      readonly alt: string;
      readonly nodes: readonly { readonly x: number; readonly y: number; readonly r: number; readonly src: string | null }[];
    };
  };
}

export interface Audience {
  readonly slug: string;
  readonly name: Lines;
  readonly body: string;
  /** True once the audience has its own page at /who-we-serve/[slug]. */
  readonly hasPage: boolean;
}

export interface WhoWeServePage extends Seo, Cover {
  readonly audiences: {
    readonly label: string;
    readonly heading: Lines;
    readonly deck: string;
    readonly items: readonly Audience[];
  };
}

export interface WorkPage extends Seo {
  readonly heading: Lines;
  readonly summary: Lines;
  readonly projects: readonly Project[];
  readonly all: string;
  readonly previewLabel: string;
  readonly empty: string;
  readonly close: { readonly eyebrow: string; readonly heading: Lines; readonly action: Link };
  readonly caseStudy: CaseStudyLabels;
}

/** The words every case study shares, from the /work document. */
export interface CaseStudyLabels {
  readonly back: string;
  readonly overview: string;
  readonly readMore: string;
  readonly readLess: string;
  readonly visit: string;
  readonly listHeading: string;
  readonly partsLabel: string;
  readonly more: { readonly label: string; readonly heading: string; readonly action: Link };
}

export interface InsightsPage extends Seo {
  readonly eyebrow: string;
  readonly heading: Lines;
  readonly summary: string;
  readonly status: string | null;
  readonly all: string;
  readonly filterLabel: string;
  readonly empty: string;
  readonly articles: readonly ArticleCard[];
}

interface FormField {
  readonly label: string;
  readonly placeholder: string;
}

export interface ContactPage extends Seo {
  readonly eyebrow: string;
  readonly heading: Lines;
  readonly summary: Lines;
  readonly start: { readonly label: string; readonly email: string; readonly copy: string; readonly copied: string };
  readonly base: { readonly label: string; readonly lines: Lines };
  readonly next: { readonly label: string; readonly steps: Lines };
  readonly form: {
    readonly label: string;
    readonly heading: string;
    readonly optional: string;
    readonly name: FormField;
    readonly email: FormField;
    readonly company: FormField;
    readonly help: { readonly label: string; readonly options: Lines };
    readonly brief: FormField;
    readonly budget: { readonly label: string; readonly placeholder: string; readonly options: Lines };
    readonly timing: FormField;
    readonly action: string;
    readonly note: string;
    readonly handed: string;
    readonly again: string;
  };
}

export interface TrackPageData extends Seo, Cover {
  readonly slug: string;
  readonly plate: { readonly src: string | null; readonly alt: string; readonly ground: string | null };
  readonly terms: { readonly price: string; readonly minimum: string; readonly compare: Link };
  readonly who: { readonly label: string; readonly heading: Lines; readonly deck: string };
  readonly shape: { readonly label: string; readonly heading: string; readonly items: readonly Step[] };
  readonly process: { readonly label: string; readonly heading: Lines; readonly items: readonly Step[] };
  readonly questions: { readonly label: string; readonly heading: string; readonly items: readonly Question[] };
  readonly others: { readonly label: string };
}

export interface Note {
  readonly text: string;
  readonly ground: string;
}

export interface Experiment {
  readonly title: string;
  readonly body: string;
  readonly ground: string;
}

export interface FamilyPageData extends Seo {
  readonly href: string;
  readonly cover: {
    readonly heading: Lines;
    readonly summary: string;
    readonly action: Link;
    readonly notes: readonly Note[];
    readonly card: Picture;
  };
  readonly archive: { readonly label: string; readonly heading: Lines; readonly deck: string; readonly items: readonly Experiment[] };
  readonly ask: { readonly label: string; readonly heading: Lines; readonly summary: string; readonly action: Link };
  readonly family: { readonly label: string; readonly heading: Lines };
}

export interface LegalSection {
  readonly id: string;
  readonly title: string;
  readonly paragraphs: Lines;
  readonly list?: Lines | null;
}

export interface LegalDocument extends Seo {
  readonly slug: string;
  readonly updated: string;
  readonly intro: string;
  readonly contentsLabel: string;
  readonly sections: readonly LegalSection[];
}

export interface ApproachPhase {
  readonly slug: string;
  readonly title: string;
  readonly question: string;
  readonly image: Picture;
  /** True once the phase has its own page at /our-approach/[slug]. */
  readonly hasPage: boolean;
}

export interface ApproachPage extends Seo, Cover {
  readonly plate: { readonly src: string | null; readonly alt: string; readonly ground: string | null };
  readonly start: { readonly label: string; readonly heading: string; readonly deck: string; readonly body: string };
  readonly phases: { readonly label: string; readonly heading: Lines; readonly itemLabel: string; readonly pageEyebrow: string; readonly items: readonly ApproachPhase[] };
  /** The chain of people that closes the page, off the /services document. */
  readonly network: ServicesPage["method"]["network"];
}

/** A phase's own page, with every phase alongside it for the pills. */
export interface PhasePage extends Seo {
  readonly slug: string;
  /** The page's eyebrow, e.g. Clarity Engineering / Phase 01. */
  readonly eyebrow: string;
  readonly heading: Lines;
  readonly question: string;
  readonly action: Link | null;
  readonly plate: { readonly src: string | null; readonly alt: string; readonly ground: string | null };
  readonly purpose: { readonly label: string; readonly heading: string; readonly deck: string | null };
  readonly practice: {
    readonly label: string;
    readonly heading: string;
    readonly items: readonly Step[];
  } | null;
  readonly outputs: {
    readonly label: string;
    readonly heading: Lines;
    readonly deck: string | null;
    readonly items: Lines;
  } | null;
  readonly phases: readonly ApproachPhase[];
  readonly network: ServicesPage["method"]["network"];
}

/** An audience's own page. */
export interface AudiencePage extends Seo {
  readonly slug: string;
  /** The /who-we-serve eyebrow, carried over: these pages sit under it. */
  readonly eyebrow: string;
  readonly name: Lines;
  readonly heading: Lines;
  readonly summary: string;
  readonly action: Link | null;
  readonly plate: { readonly src: string | null; readonly alt: string; readonly ground: string | null };
  readonly challenge: { readonly label: string; readonly heading: Lines; readonly deck: string | null };
  readonly practice: {
    readonly label: string;
    readonly heading: Lines;
    readonly items: readonly { readonly title: string | null; readonly body: string }[];
  } | null;
  readonly outputs: { readonly label: string; readonly heading: Lines; readonly items: Lines } | null;
  readonly network: ServicesPage["method"]["network"];
}
