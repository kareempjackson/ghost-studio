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

/**
 * Copy from the rich text editor, as Portable Text: one block per paragraph,
 * heading, quote or list item, its words in spans, bold, italic and the rest
 * as marks, links as mark definitions. Rendered by
 * app/(site)/_components/Rich.tsx.
 */
export interface RichBlock {
  readonly _type: "block";
  readonly _key: string;
  readonly style?: "normal" | "h2" | "h3" | "h4" | "blockquote";
  readonly listItem?: "bullet" | "number";
  readonly level?: number;
  readonly children: readonly { readonly _type: string; readonly _key: string; readonly text?: string; readonly marks?: readonly string[] }[];
  readonly markDefs?: readonly { readonly _type: string; readonly _key: string; readonly href?: string }[];
}

export type Rich = readonly RichBlock[];

/** A film URL where one is uploaded to play in a picture's place. */
export type Film = string | null;

export interface Picture {
  readonly src: string | null;
  readonly alt: string;
  readonly video: Film;
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
  /** The one piece of work the menu carries: the chosen project, or the first selected. */
  readonly feature: Project | null;
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
  readonly intro: Rich;
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
  readonly imageVideo: Film;
  /** Fill crops to the card; fit shows the whole picture on the card's ground. */
  readonly fit: "cover" | "contain";
  readonly imageAlt: string;
}

/** An insight's topic, by name: the topics are documents editors add. */
export type Topic = string;

export interface ArticleCard {
  readonly slug: string;
  readonly topic: Topic;
  readonly title: Lines;
  readonly excerpt: Rich;
  readonly cover: { readonly src: string | null; readonly alt: string; readonly video: Film; readonly ground: string };
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
  readonly heading: Rich;
  readonly body: Rich;
  readonly listHeading: string | null;
  readonly items: readonly { readonly lead: string | null; readonly text: Rich }[];
  readonly media: readonly (readonly Media[])[];
}

/** A project's own page: the card's record, and the case study if written. */
export interface ProjectDetail extends Project {
  readonly description: string | null;
  readonly hero: Media | null;
  readonly logo: Picture;
  readonly headline: Rich;
  readonly facts: readonly { readonly label: string; readonly value: Rich }[];
  readonly tags: Lines;
  readonly overview: Rich;
  readonly website: string | null;
  readonly feature: Media | null;
  readonly chapters: readonly Chapter[];
  readonly testimonial: ClientTestimonial | null;
  readonly more: readonly Project[];
}

/** What search engines and share cards show for an insight: its SEO tab. */
export interface SearchMeta {
  /** As the editor wrote it: set as the whole title, the site's name not added. */
  readonly title: string | null;
  readonly description: string | null;
  readonly keyword: string | null;
}

export interface ArticleDetail extends ArticleCard {
  readonly publishedAt: string | null;
  readonly updatedAt: string;
  readonly body: RichText | null;
  /** Minutes, at 225 words a minute; at least one. */
  readonly readingMinutes: number;
  readonly seo: SearchMeta;
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
    readonly summary: Rich;
    readonly action: string;
    readonly image: { readonly src: string | null; readonly alt: string; readonly video: Film };
  };
  readonly entries: readonly {
    readonly slug: string;
    readonly category: string;
    readonly title: Lines;
    readonly excerpt: Rich;
    readonly cover: { readonly src: string | null; readonly alt: string; readonly video: Film; readonly ground: string };
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
  readonly methodology: { readonly heading: string; readonly difference: Rich };
  readonly selectedWork: {
    readonly tag: string;
    readonly items: readonly Project[];
    readonly action: Link;
  };
  readonly journal: JournalSection;
}

export interface ViewCard {
  readonly label: string;
  readonly statement: Rich;
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
  readonly body: Rich;
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
  readonly copy: Rich;
  readonly audience: Rich;
  readonly terms: string;
  readonly action: Link;
}

export interface Engagement {
  readonly chip: string;
  readonly title: string;
  readonly subtitle: string;
  readonly image: { readonly src: string; readonly video: Film; readonly width: number; readonly height: number; readonly alt: string };
  readonly models: readonly EngagementModel[];
}

export interface Sector {
  readonly slug: string;
  readonly name: string;
  readonly work: Rich;
  readonly image: string;
  readonly imageVideo: Film;
}

export interface Sectors {
  readonly eyebrow: string;
  readonly items: readonly Sector[];
}

export interface Testimonial {
  readonly quote: Rich;
  readonly name: string;
  readonly role: string;
  readonly company: string;
  /** Square, cropped around the face; their initials are shown without one. */
  readonly portrait: string | null;
  readonly portraitAlt: string;
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
  readonly summary: Rich;
  readonly action: Link;
}

export interface Step {
  readonly title: string;
  readonly body: Rich;
}

export interface Question {
  readonly question: string;
  readonly answer: Rich;
}

export interface TeamMember {
  readonly name: string;
  readonly role: string;
  readonly portrait: string | null;
  readonly portraitVideo: Film;
  readonly ground: string;
}

export interface FamilyMember {
  readonly name: string;
  readonly statement: Lines;
  readonly href: string;
}

export interface AboutPage extends Seo, Cover {
  readonly who: { readonly label: string; readonly heading: string; readonly deck: Rich; readonly body: Rich };
  readonly team: {
    readonly label: string;
    readonly heading: Lines;
    readonly deck: Rich;
    readonly portraitLabel: string;
    readonly members: readonly TeamMember[];
  };
  readonly expect: { readonly label: string; readonly heading: string; readonly items: readonly Step[] };
  readonly family: { readonly label: string; readonly heading: Lines; readonly members: readonly FamilyMember[] };
}

export interface ServicesPage extends Seo, Cover {
  readonly ways: { readonly label: string; readonly heading: string; readonly deck: Rich };
  readonly disciplines: { readonly label: string; readonly heading: string; readonly deck: Rich };
  readonly method: {
    readonly label: string;
    readonly heading: Lines;
    readonly copy: Rich;
    readonly action: Link;
  };
  /** The project the page closes on; null only with no project to show. */
  readonly featured: Project | null;
}

export interface Audience {
  readonly slug: string;
  readonly name: Lines;
  readonly body: Rich;
  /** True once the audience has its own page at /who-we-serve/[slug]. */
  readonly hasPage: boolean;
}

export interface WhoWeServePage extends Seo, Cover {
  readonly audiences: {
    readonly label: string;
    readonly heading: Lines;
    readonly deck: Rich;
    readonly items: readonly Audience[];
  };
  /** The project the page closes on; null only with no project to show. */
  readonly featured: Project | null;
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
  /** Beside a project's testimonial, and over its quote. */
  readonly feedbackLabel: string;
  readonly feedbackHeading: string;
  readonly more: { readonly label: string; readonly heading: string; readonly action: Link };
}

/** What a client said about the work, at the foot of its case study. */
export interface ClientTestimonial {
  readonly quote: Rich;
  readonly name: string;
  readonly role: string | null;
  readonly company: string;
  readonly portrait: string | null;
  readonly portraitAlt: string;
}

export interface InsightsPage extends Seo {
  readonly eyebrow: string;
  readonly heading: Lines;
  readonly summary: Rich;
  readonly status: string | null;
  readonly all: string;
  readonly filterLabel: string;
  readonly empty: string;
  readonly articles: readonly ArticleCard[];
  /** The filter's pills: the topics with an insight under them, in order. */
  readonly topics: readonly Topic[];
}

interface FormField {
  readonly label: string;
  readonly placeholder: string;
}

export interface ContactPage extends Seo {
  readonly eyebrow: string;
  readonly heading: Lines;
  readonly summary: Rich;
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
    readonly note: Rich;
    readonly sending: string;
    /** {email}: the sender's address. */
    readonly sent: string;
    readonly another: string;
    /** {email}: the studio's address. */
    readonly failed: string;
  };
}

export interface TrackPageData extends Seo, Cover {
  readonly slug: string;
  readonly plate: { readonly src: string | null; readonly video: Film; readonly alt: string; readonly ground: string | null };
  readonly terms: { readonly price: string; readonly minimum: string; readonly compare: Link };
  readonly who: { readonly label: string; readonly heading: Lines; readonly deck: Rich };
  readonly shape: { readonly label: string; readonly heading: string; readonly items: readonly Step[] };
  readonly process: { readonly label: string; readonly heading: Lines; readonly items: readonly Step[] };
  readonly questions: { readonly label: string; readonly heading: string; readonly items: readonly Question[] };
  readonly others: { readonly label: string };
  /** The project the page closes on; null only with no project to show. */
  readonly featured: Project | null;
}

export interface Note {
  readonly text: string;
  readonly ground: string;
}

export interface Experiment {
  readonly title: string;
  readonly body: Rich;
  readonly ground: string;
}

export interface FamilyPageData extends Seo {
  readonly href: string;
  readonly cover: {
    readonly heading: Lines;
    readonly summary: Rich;
    readonly action: Link;
    readonly notes: readonly Note[];
    readonly card: Picture;
  };
  readonly archive: {
    readonly label: string;
    readonly heading: Lines;
    readonly deck: Rich;
    readonly items: readonly Experiment[];
    /** What the archive says while it has no story and no plate. */
    readonly empty: { readonly heading: string; readonly body: Rich | null };
  };
  readonly ask: FamilyAsk;
  readonly family: FamilyBand;
  /** The family's stories, newest first: the archive opens on them. */
  readonly stories: readonly StoryCard[];
}

export interface FamilyAsk {
  readonly label: string;
  readonly heading: Lines;
  readonly summary: Rich;
  readonly action: Link;
}

/** The band that sends a reader on to the rest of the family. */
export interface FamilyBand {
  readonly label: string;
  readonly heading: Lines;
}

/** A story from the Ghost family, as its card shows it. */
export interface StoryCard {
  readonly slug: string;
  readonly family: string;
  readonly href: string;
  readonly title: string;
  readonly summary: Rich;
  readonly ground: string;
  readonly image: string | null;
  readonly imageVideo: Film;
  readonly imageAlt: string;
  /** What one is called and its number in the family, oldest first: Experiment 01. */
  readonly eyebrow: string;
}

/** The words every story under a family page shares. */
export interface StoryLabels {
  readonly itemLabel: string;
  readonly overview: string;
  readonly readMore: string;
  readonly readLess: string;
  readonly listHeading: string;
  readonly partsLabel: string;
  readonly voiceLabel: string;
  readonly voiceHeading: string;
  readonly more: { readonly label: string; readonly heading: string; readonly action: Link };
}

/** A story's own page: the record, the claim, the parts, and how it ended. */
export interface StoryDetail extends StoryCard {
  readonly description: string | null;
  readonly hero: Media | null;
  readonly notes: readonly Note[];
  readonly headline: Rich;
  readonly facts: readonly { readonly label: string; readonly value: Rich }[];
  readonly tags: Lines;
  readonly overview: Rich;
  readonly link: Link | null;
  readonly feature: Media | null;
  readonly chapters: readonly Chapter[];
  /** What changed, in figures; null until there is one. */
  readonly outcome: {
    readonly label: string;
    readonly heading: Rich | null;
    readonly items: readonly { readonly value: string; readonly label: string }[];
  } | null;
  /** What someone it was for said about it; null until there is a quote and a name. */
  readonly voice: ClientTestimonial | null;
  readonly more: readonly StoryCard[];
}

/** A story, with what it carries over from its family's page. */
export interface StoryPageData {
  readonly story: StoryDetail;
  readonly family: {
    readonly href: string;
    readonly title: string;
    readonly labels: StoryLabels;
    readonly ask: FamilyAsk;
    readonly band: FamilyBand;
  };
}

export interface LegalSection {
  readonly id: string;
  readonly title: string;
  readonly paragraphs: Rich;
  readonly list?: Rich | null;
}

export interface LegalDocument extends Seo {
  readonly slug: string;
  readonly eyebrow: string;
  readonly updatedLabel: string;
  readonly updated: string;
  readonly intro: Rich;
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
  readonly plate: { readonly src: string | null; readonly video: Film; readonly alt: string; readonly ground: string | null };
  readonly start: { readonly label: string; readonly heading: string; readonly deck: Rich; readonly body: Rich };
  readonly phases: { readonly label: string; readonly heading: Lines; readonly itemLabel: string; readonly pageEyebrow: string; readonly items: readonly ApproachPhase[] };
  /** The project the page closes on; null only with no project to show. */
  readonly featured: Project | null;
}

/** A phase's own page, with every phase alongside it for the pills. */
export interface PhasePage extends Seo {
  readonly slug: string;
  /** The page's eyebrow, e.g. Clarity Engineering / Phase 01. */
  readonly eyebrow: string;
  readonly heading: Lines;
  readonly question: string;
  readonly action: Link | null;
  readonly plate: { readonly src: string | null; readonly video: Film; readonly alt: string; readonly ground: string | null };
  readonly purpose: { readonly label: string; readonly heading: Rich; readonly deck: Rich | null };
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
  /** The project the page closes on; null only with no project to show. */
  readonly featured: Project | null;
}

/** An audience's own page. */
export interface AudiencePage extends Seo {
  readonly slug: string;
  /** The /who-we-serve eyebrow, carried over: these pages sit under it. */
  readonly eyebrow: string;
  readonly name: Lines;
  readonly heading: Lines;
  readonly summary: Rich;
  readonly action: Link | null;
  readonly plate: { readonly src: string | null; readonly video: Film; readonly alt: string; readonly ground: string | null };
  readonly challenge: { readonly label: string; readonly heading: Lines; readonly deck: Rich | null };
  readonly practice: {
    readonly label: string;
    readonly heading: Lines;
    readonly items: readonly { readonly title: string | null; readonly body: Rich }[];
  } | null;
  readonly outputs: { readonly label: string; readonly heading: Lines; readonly items: Lines } | null;
  /** The project the page closes on; null only with no project to show. */
  readonly featured: Project | null;
}

/** What the contact form's server action needs: the email copy and the labels. */
export interface EnquiryCopy {
  readonly studioEmail: string;
  readonly siteName: string;
  readonly form: Pick<ContactPage["form"], "name" | "email" | "company" | "help" | "brief" | "budget" | "timing">;
  readonly acknowledgement: {
    readonly subject: string;
    /** {name}: the sender's first name. */
    readonly greeting: string;
    /** Paragraphs separated by a blank line. */
    readonly body: string;
    readonly recapLabel: string;
    readonly signoff: Lines;
  };
}
