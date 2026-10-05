/**
 * Ghost Savvy Studios — the work, as the site shows it.
 *
 * One list, read two ways: the home page takes the plates and the client
 * names, and `/work` takes the whole record — what the studio did, where the
 * client is and which trades the job called on. Keeping both off the same
 * array is what stops the two pages disagreeing about a client's own name.
 *
 * The client's name goes on the card, not the discipline: the studio is
 * called Ghost for a reason. What the studio did sits underneath, small.
 *
 * PLACEHOLDER, in two parts:
 *
 * 1. Every `image` points at the hero poster. Drop the real captures into
 *    `public/media/` and change the line. Plates are cropped with
 *    object-cover at a near-square ratio. Until they land, `/work` shows the
 *    ground and the client's name rather than a stretched poster.
 * 2. `ground` is the card's colour on `/work`, taken off the comps. Once the
 *    captures land, the ground is what shows through behind them.
 */

const PLACEHOLDER = "/media/hero-poster.jpg";

/** The three trades the studio sells, and the filter on `/work`. */
export type Discipline = "Brand" | "Digital" | "Systems";

export const disciplines = ["Brand", "Digital", "Systems"] as const;

export interface Project {
  readonly slug: string;
  /** The client, as they write it themselves. */
  readonly name: string;
  /** What the studio did, in three words or fewer. */
  readonly scope: string;
  /** The job in one line, in the studio's voice. */
  readonly tagline: string;
  readonly location: string;
  readonly sector: string;
  readonly disciplines: readonly Discipline[];
  /** The card's ground on `/work`. */
  readonly ground: string;
  readonly image: string;
}

/** The pale blue and the vermilion the comps alternate between. */
const GROUND = { mist: "#e4e9f7", signal: "#e0673f" } as const;

export const projects = [
  {
    slug: "barbados-pharmaceuticals",
    name: "Barbados Pharmaceutical Inc.",
    scope: "Brand and digital",
    tagline: "Building the architecture of care.",
    location: "Barbados",
    sector: "Pharmaceuticals",
    disciplines: ["Brand", "Digital", "Systems"],
    ground: GROUND.mist,
    image: PLACEHOLDER,
  },
  {
    /* PLACEHOLDER — the earlier comp called this client Maryann. The work
       shown on it is Nakeba Mason's; confirm before this ships. */
    slug: "nakeba-mason",
    name: "Nakeba Mason",
    scope: "Brand and digital",
    tagline: "A brand that matches the level of the work.",
    location: "Barbados",
    sector: "Professional services",
    disciplines: ["Brand", "Digital"],
    ground: GROUND.mist,
    image: PLACEHOLDER,
  },
  {
    slug: "amh-project-solutions",
    name: "AMH Project Solutions",
    scope: "Brand and digital",
    tagline: "Making the unfamiliar feel navigable.",
    location: "Grenada",
    sector: "Construction",
    disciplines: ["Brand", "Digital"],
    ground: GROUND.signal,
    image: PLACEHOLDER,
  },
] as const satisfies readonly Project[];

export const selectedWork = {
  tag: "Selected work",
  items: projects,
} as const satisfies { tag: string; items: readonly Project[] };

/** `/work` itself: the cover, the filter and the way on. */
export const workPage = {
  title: "Work",
  description:
    "A selection of brands, websites and systems built by Ghost Savvy Studios.",
  heading: ["Good thinking.", "Out in the world."],
  summary: [
    "A selection of brands, websites and systems.",
    "Different challenges. One connected team.",
  ],
  /** The first pill, which clears the filter rather than setting one. */
  all: "All work",
  /** Stands in for the capture that has not been exported yet. */
  previewLabel: "Project preview / artwork placeholder",
  empty: "Nothing under that filter yet.",
  close: {
    eyebrow: "The thread through our work",
    heading: ["We start with what", "needs to change."],
    action: { label: "See how we work", href: "/#process" },
  },
} as const;

/** The way through to the full list, set in the band under the cards. */
export const workAction = { label: "Explore our work", href: "/work" } as const;

export const projectHref = (slug: string) => `/work/${slug}`;

/** The words every case study shares, on the /work document. */
export const caseStudyLabels = {
  back: "Selected work",
  overview: "Overview",
  readMore: "Read more",
  readLess: "Read less",
  visit: "Visit site",
  listHeading: "What We Did",
  partsLabel: "Parts of the story",
  more: {
    label: "More from GhostSavvy",
    heading: "Selected projects.",
    action: { label: "See all work", href: "/work" },
  },
} as const;

type Aspect = "landscape" | "wide" | "portrait";

/** A plate: its ground until the picture is in, and its shape. */
export interface PlateSeed {
  readonly ground: string;
  readonly aspect: Aspect;
}

export interface CaseStudySeed {
  readonly hero?: PlateSeed;
  readonly headline: string;
  readonly facts: readonly { label: string; value: string }[];
  readonly tags: readonly string[];
  readonly overview: readonly string[];
  readonly website?: string;
  readonly feature?: PlateSeed;
  readonly chapters: readonly {
    label: string;
    heading: string;
    body: readonly string[];
    items: readonly { lead?: string; text: string }[];
    /** Rows of plates after the text: one across, or two side by side. */
    media: readonly (readonly PlateSeed[])[];
  }[];
}

const plate = (ground: string, aspect: Aspect = "landscape"): PlateSeed => ({ ground, aspect });

/**
 * The case studies, by project slug. Set from each project's comp.
 *
 * PLACEHOLDER: every plate is the comp's colour until its picture or film is
 * uploaded in the Studio. The BPI comp cuts the overview's second paragraph
 * off mid-sentence, and does not give the address for Visit site; both are
 * marked to finish in the Studio.
 */
export const caseStudies: Record<string, CaseStudySeed> = {
  "barbados-pharmaceuticals": {
    hero: plate("#132a28", "wide"),
    headline:
      "A new brand, website, and working environment for a business operating across borders",
    facts: [
      { label: "Client", value: "Barbados Pharmaceutical Inc." },
      { label: "Location", value: "Bridgetown, Barbados" },
      { label: "Industry", value: "Pharmaceuticals, Manufacturing, And Distribution" },
      { label: "Partnership", value: "Engage + Integrate" },
      {
        label: "Scope",
        value:
          "Brand Identity, Website Design And Development, Multilingual CMS, Brand Film, Microsoft 365, And Security Architecture.",
      },
    ],
    tags: ["Brand", "Website", "Infrastructure"],
    overview: [
      "BPI manufactures and distributes essential medicines from Barbados into the Caribbean, Latin America, and Africa. As its distribution partnerships and regulatory relationships expanded, its brand, website, and internal systems needed to support a business working across three continents.",
      "Investors, regulators, researchers, and distribution partners had different information needs, but encountered the same [the comp cuts this paragraph off here — finish it in the Studio]",
    ],
    feature: plate("#b0b0b0"),
    chapters: [
      {
        label: "Brand identity",
        heading: "A Consistent Identity Across The Business.",
        body: [
          "BPI needed its public presence to reflect the scale and purpose of its work. We rebuilt the brand and carried that identity into the website, film, and everyday business communications.",
        ],
        items: [
          { text: "Delivered a full rebrand for Barbados Pharmaceutical Inc." },
          { text: "Applied the new identity to the website, connecting the brand with the digital experience." },
          { text: "Extended the identity into branded applications, including clothing and supporting materials." },
          { text: "Created an adaptive HTML email signature suite for the leadership team." },
          { text: "Supported both light and dark email environments." },
          { text: "Kept the brand work connected to the team building BPI’s website and internal systems." },
        ],
        media: [
          [plate("#33201f", "wide")],
          [plate("#f6f6f6", "portrait"), plate("#132a28", "portrait")],
          [plate("#f6f6f6")],
        ],
      },
      {
        label: "Website",
        heading: "Different Audiences. Clearer Routes To The Right Information.",
        body: [
          "BPI’s website needed to answer different questions. Investors wanted to understand the opportunity. Regulators, researchers, and distribution partners needed access to material relevant to their roles.",
          "We structured the website around those audiences and brought its information, resources, and events into one platform.",
        ],
        items: [
          { text: "Designed audience pathways for investors, regulators, researchers, and partners." },
          { text: "Organised the experience to direct each audience to relevant material." },
          { text: "Designed and developed the website using Next.js and Sanity." },
          { text: "Built a gated resource library." },
          { text: "Added full-text search across publications and reports." },
          { text: "Integrated event registration into the website." },
          { text: "Connected the new website design with BPI’s refreshed identity." },
        ],
        media: [
          [plate("#e4e4e4")],
          [plate("#132a28", "portrait"), plate("#0d1a3a", "portrait")],
          [plate("#d8d4cf")],
        ],
      },
      {
        label: "Multilingual experience",
        heading: "A Website Built To Communicate Across Borders.",
        body: [
          "A business serving multiple regions needed more than a single-language website. We built multilingual publishing into the platform so BPI could present its work to audiences across its international network.",
        ],
        items: [
          { text: "Delivered the website in English, Spanish, French, Portuguese, and Dutch." },
          { text: "Built the multilingual content management system in Sanity." },
          { text: "Supported five language versions within the same website platform." },
          { text: "Combined multilingual access with audience-specific pathways." },
          { text: "Gave BPI a platform for communicating its work across different markets." },
        ],
        media: [[plate("#d8d4cf")], [plate("#d8d4cf"), plate("#d8d4cf")]],
      },
      {
        label: "Brand film",
        heading: "Making BPI’s Purpose Clear.",
        body: [
          "BPI’s founding argument is that the Global South should be able to supply its own medicines. We directed a brand film that explained this purpose through the people leading the business and the places where its work happens.",
        ],
        items: [
          { text: "Built the film around BPI’s founding argument and long-term purpose." },
          { text: "Featured the company’s leadership on camera." },
          { text: "Used location footage from Barbados and the distribution network." },
          { text: "Connected the leadership narrative with the context of BPI’s operations." },
          { text: "Delivered the film alongside the brand and website work." },
        ],
        media: [
          [plate("#9fb4bd")],
          [plate("#132a28", "portrait"), plate("#0d1a3a", "portrait")],
        ],
      },
      {
        label: "Internal infrastructure",
        heading: "A Shared Working Environment Behind The Public Presence.",
        body: [
          "BPI’s internal systems needed the same attention as its brand and website. The organisation lacked a unified Microsoft 365 environment, a clear document structure, and established access controls.",
          "We built the environment from the ground up, bringing communication, information management, and security into a coordinated setup.",
        ],
        items: [
          { lead: "Microsoft 365 setup", text: "Provisioned a new tenant and established the organisation’s working environment." },
          { lead: "Email migration", text: "Moved mailboxes while maintaining continuity through the transition." },
          { lead: "Access controls", text: "Configured Conditional Access policies, identity rules, travel-access rules, and multi-factor authentication." },
          { lead: "Document organisation", text: "Built the SharePoint information architecture to give business documents a clear structure." },
          { lead: "Project tracking", text: "Integrated Monday.com with the way the business worked." },
          { lead: "Email identity", text: "Implemented adaptive HTML signatures across the leadership team, supporting light and dark modes." },
        ],
        media: [[plate("#7a2a14")]],
      },
      {
        label: "Delivery",
        heading: "One Engagement, From Public Identity To Internal Operations.",
        body: [
          "BPI received a new brand, a multilingual public platform, and the systems supporting its team. GhostSavvy delivered these together, keeping decisions connected across design, development, and implementation.",
        ],
        items: [
          { text: "A refreshed brand identity applied across digital and business communications." },
          { text: "A website available in five languages." },
          { text: "Four audience pathways for investors, regulators, researchers, and partners." },
          { text: "A gated resource library, publication search, and event registration." },
          { text: "A leadership-led brand film." },
          { text: "A new Microsoft 365 environment with email, document management, and access controls." },
          { text: "Connected project tracking and consistent leadership email signatures." },
        ],
        media: [],
      },
    ],
  },
};
