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

  /* PLACEHOLDER — four clients by name only. Their location, sector and
     scope below are guesses from the name: confirm each in the Studio. */
  {
    slug: "lore-filmaker",
    name: "Lore Filmaker",
    scope: "Brand and digital",
    tagline: "A portfolio that lets the films speak first.",
    location: "Caribbean",
    sector: "Film and video production",
    disciplines: ["Brand", "Digital"],
    ground: "#ebe4da",
    image: PLACEHOLDER,
  },
  {
    slug: "higher-level-accounting",
    name: "Higher Level Accounting",
    scope: "Brand, digital and systems",
    tagline: "An accounting practice as organised online as its books.",
    location: "Caribbean",
    sector: "Accounting",
    disciplines: ["Brand", "Digital", "Systems"],
    ground: "#dfe7f2",
    image: PLACEHOLDER,
  },
  {
    slug: "trekker",
    name: "Trekker",
    scope: "Product and digital",
    tagline: "Plan the route, then leave the signal behind.",
    location: "Caribbean",
    sector: "Travel and outdoors",
    disciplines: ["Digital", "Systems"],
    ground: "#dce8d6",
    image: PLACEHOLDER,
  },
  {
    slug: "medz",
    name: "Medz",
    scope: "Product and systems",
    tagline: "Prescriptions filled and delivered without the queue.",
    location: "Caribbean",
    sector: "Health",
    disciplines: ["Digital", "Systems"],
    ground: "#f2dcd6",
    image: PLACEHOLDER,
  },

  /* DEMO — the five below are invented clients, written to fill /work and
     show the case study at different lengths. None of them is real work:
     replace or delete them before the site ships. */
  {
    slug: "saltmere-credit-union",
    name: "Saltmere Credit Union",
    scope: "Brand, digital and systems",
    tagline: "Membership that feels like membership.",
    location: "Saint Lucia",
    sector: "Financial services",
    disciplines: ["Brand", "Digital", "Systems"],
    ground: "#d9e4dc",
    image: PLACEHOLDER,
  },
  {
    slug: "kestrel-bay-resort",
    name: "Kestrel Bay Resort",
    scope: "Brand and digital",
    tagline: "Selling the view before the flight.",
    location: "Antigua",
    sector: "Hospitality",
    disciplines: ["Brand", "Digital"],
    ground: GROUND.signal,
    image: PLACEHOLDER,
  },
  {
    slug: "calabash-water-authority",
    name: "Calabash Water Authority",
    scope: "Digital and systems",
    tagline: "Service updates people can trust in a storm.",
    location: "Eastern Caribbean",
    sector: "Public utilities",
    disciplines: ["Digital", "Systems"],
    ground: GROUND.mist,
    image: PLACEHOLDER,
  },
  {
    slug: "fieldnote-learning",
    name: "Fieldnote Learning",
    scope: "Brand and digital",
    tagline: "Lessons that keep working offline.",
    location: "Jamaica",
    sector: "Education",
    disciplines: ["Brand", "Digital"],
    ground: "#f1e3d3",
    image: PLACEHOLDER,
  },
  {
    slug: "ardent-logistics-group",
    name: "Ardent Logistics Group",
    scope: "Digital and systems",
    tagline: "One view of every shipment.",
    location: "Trinidad and Tobago",
    sector: "Logistics",
    disciplines: ["Digital", "Systems"],
    ground: "#e7e3dc",
    image: PLACEHOLDER,
  },
] as const satisfies readonly Project[];

/** The home page carries the three real clients, not the demo work. */
export const selectedWork = {
  tag: "Selected work",
  items: projects.slice(0, 3),
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
    action: { label: "See how we work", href: "/our-approach" },
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
  feedbackLabel: "Client feedback",
  feedbackHeading: "In their words.",
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
  /** What the client said, at the foot of the page. */
  readonly testimonial?: {
    readonly quote: string;
    readonly name: string;
    readonly role?: string;
    readonly company?: string;
  };
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
    testimonial: {
      quote:
        "The Team Took Time To Understand What We Were Building And Brought The Different Parts Together. We Came Away With A Clearer Way To Present Our Work And A Stronger Foundation For The Team Behind It.",
      name: "Dr. Cindi A. Lewis",
      role: "Chief Executive Officer A.g.",
      company: "Barbados Pharmaceutical Inc.",
    },
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

  /* DEMO — written to the BPI study's shape so the page can be judged with
     a full story. The facts below are not confirmed with the client:
     replace the copy in the Studio before the site ships. */
  "amh-project-solutions": {
    hero: plate("#e0673f", "wide"),
    headline:
      "A brand and website that walk clients through building in Grenada, one stage at a time",
    facts: [
      { label: "Client", value: "AMH Project Solutions" },
      { label: "Location", value: "St. George’s, Grenada" },
      { label: "Industry", value: "Construction And Project Management" },
      { label: "Partnership", value: "Engage" },
      {
        label: "Scope",
        value: "Brand Identity, Website Design And Development, Client Guide, And Site Signage.",
      },
    ],
    tags: ["Brand", "Website", "Print"],
    overview: [
      "AMH Project Solutions manages construction projects in Grenada for clients who are often building from a distance: families in the diaspora, first-time developers, and overseas investors. Most had never managed a build in Grenada, and from the outside the process of approvals, contractors, inspections, and payments felt opaque.",
      "AMH needed a brand that signalled calm control, and a website that explained the process before a client ever picked up the phone.",
      "What we did:",
      "Built a new identity around clarity and steady progress.",
      "Designed and developed a website that maps a build from first conversation to handover.",
      "Wrote and designed a plain-language guide to building in Grenada from abroad.",
      "Carried the identity onto site hoardings, vehicles, and project documents.",
    ],
    feature: plate("#1d1d1b"),
    chapters: [
      {
        label: "Brand identity",
        heading: "An Identity That Signals Steady Hands.",
        body: [
          "Construction brands tend to shout. AMH’s clients needed the opposite: reassurance that someone careful was in charge of their money and their site. We built the identity around a measured grid, a confident vermilion, and plain, direct language.",
        ],
        items: [
          { text: "Delivered a full rebrand for AMH Project Solutions." },
          { text: "Designed a logo system that holds up from a site hoarding to a browser tab." },
          { text: "Set a colour and type system built for documents as much as screens." },
          { text: "Designed proposal, progress report, and handover templates." },
          { text: "Wrote tone-of-voice guidance for the way the team explains a build." },
        ],
        media: [
          [plate("#e0673f", "wide")],
          [plate("#1d1d1b", "portrait"), plate("#f3efe8", "portrait")],
          [plate("#e7e3dc")],
        ],
      },
      {
        label: "Website",
        heading: "Explaining The Build Before The First Call.",
        body: [
          "Prospective clients arrived with the same questions: how long, how much, and what happens when I am not there. We structured the website around the stages of a build, so each answer sits where the question comes up.",
          "Every stage links to the approvals, documents, and checkpoints involved, written for someone who has never built in Grenada.",
        ],
        items: [
          { text: "Mapped a build into stages, from first conversation to handover." },
          { text: "Designed service pages for residential, commercial, and renovation work." },
          { text: "Built an enquiry form that captures the plot, the budget, and the timeline." },
          { text: "Added a project portfolio organised by location and scope." },
          { text: "Designed and developed the website using Next.js and Sanity." },
          { text: "Kept pages light enough for clients reading on mobile networks abroad." },
        ],
        media: [
          [plate("#e4e9f7")],
          [plate("#e0673f", "portrait"), plate("#1d1d1b", "portrait")],
        ],
      },
      {
        label: "Client guide",
        heading: "A Plain-Language Guide To Building From Abroad.",
        body: [
          "Much of AMH’s first meeting with a client was spent explaining the same process. We turned that explanation into a guide clients read before they call, in print and on the website.",
        ],
        items: [
          { text: "Wrote and designed a guide to approvals, contractors, inspections, and payments." },
          { text: "Explained who does what in a Grenadian build, and when." },
          { text: "Included a checklist for clients managing a build from overseas." },
          { text: "Published the guide as a printable document and a section of the website." },
        ],
        media: [[plate("#f3efe8")]],
      },
      {
        label: "On site",
        heading: "The Brand Where People Actually See It.",
        body: [
          "A construction firm’s most visible surface is the hoarding around its sites. We carried the identity onto the places people see AMH at work.",
        ],
        items: [
          { text: "Designed a site hoarding system that carries each project’s details." },
          { text: "Designed vehicle livery for the site team." },
          { text: "Produced safety and wayfinding signage." },
          { text: "Extended the identity into branded workwear." },
        ],
        media: [
          [plate("#1d1d1b", "wide")],
          [plate("#e0673f"), plate("#e7e3dc")],
        ],
      },
      {
        label: "Delivery",
        heading: "A Clearer First Impression For A Complicated Process.",
        body: [
          "AMH now meets clients who already understand how a build works and what AMH does at each stage. The brand, the website, and the guide carry the same message, so the conversation starts further along.",
        ],
        items: [
          { text: "A new identity across digital, print, and site." },
          { text: "A website organised around the stages of a build." },
          { text: "A client guide in print and online." },
          { text: "Site hoarding, vehicle, and signage applications." },
          { text: "Templates for proposals, progress reports, and handover." },
        ],
        media: [],
      },
    ],
  },

  /* DEMO — as above: the shape of a full study, to be replaced with the
     practice's own account before the site ships. */
  "nakeba-mason": {
    hero: plate("#1b2a4a", "wide"),
    headline:
      "A personal brand and website that reflect the standard of an established practice",
    facts: [
      { label: "Client", value: "Nakeba Mason" },
      { label: "Location", value: "Bridgetown, Barbados" },
      { label: "Industry", value: "Professional Services" },
      { label: "Partnership", value: "Build" },
      {
        label: "Scope",
        value: "Personal Brand Identity, Website Design And Development, Speaker Kit, And Stationery.",
      },
    ],
    tags: ["Brand", "Website"],
    overview: [
      "Nakeba Mason runs an established professional practice in Barbados. The work had grown through reputation and referral, but the brand behind it had not kept pace: a self-made logo, an outdated website, and materials that undersold the experience behind them.",
      "The practice needed an identity and a website that matched the level of the work, and made it easy for new clients to understand what it offers and how to begin.",
      "What we did:",
      "Developed a personal brand identity with a considered, editorial feel.",
      "Designed and built a website that sets out the practice’s services and approach.",
      "Produced a speaker kit for conference and media requests.",
      "Designed stationery and document templates for client work.",
    ],
    feature: plate("#f4f1ec"),
    chapters: [
      {
        label: "Brand identity",
        heading: "A Personal Brand With The Weight Of A Firm.",
        body: [
          "A personal brand has to carry a name without feeling like a vanity project. We built the identity around a wordmark in a refined serif, a restrained palette, and generous space, so the work leads and the name signs it.",
        ],
        items: [
          { text: "Designed a wordmark and monogram." },
          { text: "Set a colour and typography system for screen and print." },
          { text: "Directed portrait photography to match the identity." },
          { text: "Wrote tone-of-voice guidance for the practice’s writing." },
          { text: "Delivered brand guidelines the practice can hand to suppliers." },
        ],
        media: [
          [plate("#e4e9f7", "wide")],
          [plate("#1b2a4a", "portrait"), plate("#f4f1ec", "portrait")],
        ],
      },
      {
        label: "Website",
        heading: "Services Set Out Clearly, In The Practice’s Own Voice.",
        body: [
          "New clients found the practice through referral, then searched online to check. The website needed to confirm the recommendation: what the practice does, how it works, and how to start.",
        ],
        items: [
          { text: "Designed service pages that explain each offer and who it is for." },
          { text: "Wrote an approach page that sets out how an engagement runs." },
          { text: "Built an enquiry flow that leads to a booked first conversation." },
          { text: "Added an insights section for articles and talks." },
          { text: "Designed and developed the website using Next.js and Sanity." },
        ],
        media: [
          [plate("#f4f1ec")],
          [plate("#1b2a4a", "portrait"), plate("#e4e9f7", "portrait")],
        ],
      },
      {
        label: "Speaking",
        heading: "Ready For The Stage And The Press.",
        body: [
          "Invitations to speak and to comment were growing. We gave the practice a kit that answers organisers’ and journalists’ requests in one place.",
        ],
        items: [
          { text: "Designed a speaker one-sheet." },
          { text: "Wrote biographies in three lengths." },
          { text: "Selected and prepared approved portraits." },
          { text: "Designed a presentation template in the new identity." },
          { text: "Added a media page to the website." },
        ],
        media: [[plate("#1b2a4a")]],
      },
      {
        label: "Delivery",
        heading: "A Brand That Matches The Level Of The Work.",
        body: [
          "The practice now presents itself with the same care it brings to client work, from the first search result to the documents a client signs.",
        ],
        items: [
          { text: "A personal identity and brand guidelines." },
          { text: "A website with services, approach, insights, and booking." },
          { text: "A speaker kit and media page." },
          { text: "Stationery and document templates." },
        ],
        media: [],
      },
    ],
  },

  /* PLACEHOLDER — the four clients named without a brief: the BPI study's
     shape, with copy drawn from each name. Every fact and every line of
     what was built is to confirm and rewrite in the Studio. */
  "lore-filmaker": {
    hero: plate("#1c1a17", "wide"),
    headline: "A brand and a film-first portfolio for an independent production studio",
    facts: [
      { label: "Client", value: "Lore Filmaker" },
      { label: "Location", value: "Caribbean" },
      { label: "Industry", value: "Film And Video Production" },
      { label: "Partnership", value: "Build" },
      { label: "Scope", value: "Brand Identity, Portfolio Website, Showreel Delivery, And Enquiry Flow." },
    ],
    tags: ["Brand", "Website", "Film"],
    overview: [
      "Lore Filmaker makes brand films, documentaries, and commercial work. The work was strong, but it lived in scattered links, and prospective clients had to piece the studio together from a showreel and a social feed.",
      "The studio needed an identity that stepped back for the footage, and a portfolio where the films load fast and play beautifully on any screen.",
      "What we did:",
      "Built an identity that frames the work instead of competing with it.",
      "Designed and developed a portfolio website organised by project and by craft.",
      "Set up streaming that keeps reels sharp and fast on mobile.",
      "Built an enquiry flow that gathers the brief before the first call.",
    ],
    feature: plate("#ebe4da"),
    chapters: [
      {
        label: "Brand identity",
        heading: "An Identity That Steps Back For The Work.",
        body: [
          "A production studio’s brand is mostly its footage. We kept the identity quiet: a wordmark set for title cards and end slates, a near-black palette that suits a screening room, and type that reads as credits.",
        ],
        items: [
          { text: "Designed a wordmark that works as a title card and an end slate." },
          { text: "Set a palette and type system built around the footage." },
          { text: "Designed templates for treatments, pitch decks, and call sheets." },
        ],
        media: [
          [plate("#1c1a17", "wide")],
          [plate("#ebe4da", "portrait"), plate("#1c1a17", "portrait")],
        ],
      },
      {
        label: "Portfolio website",
        heading: "The Films First, Everything Else Second.",
        body: [
          "Every project opens on its film. The website is organised the way clients look for a filmmaker: by the kind of work they need, then by the projects that prove it.",
        ],
        items: [
          { text: "Designed project pages that open on the film, full width." },
          { text: "Organised the work by craft: brand films, documentary, and commercial." },
          { text: "Served video in formats that stay sharp and load quickly on mobile." },
          { text: "Designed and developed the website using Next.js and Sanity." },
        ],
        media: [[plate("#ebe4da")], [plate("#1c1a17", "portrait"), plate("#ebe4da", "portrait")]],
      },
      {
        label: "Enquiries",
        heading: "A Better Brief Before The First Call.",
        body: [
          "Enquiries used to arrive as a single line in an inbox. The new flow asks for what a quote depends on, so the first conversation starts with the brief already in hand.",
        ],
        items: [
          { text: "Built an enquiry form that captures the format, timeline, and budget." },
          { text: "Routed enquiries to the studio’s inbox with the brief attached." },
        ],
        media: [[plate("#ebe4da")]],
      },
      {
        label: "Delivery",
        heading: "A Studio Clients Can Understand In One Visit.",
        body: [
          "Lore Filmaker now sends prospective clients to one place that shows the work at its best and makes it easy to start a project.",
        ],
        items: [
          { text: "A brand identity and production templates." },
          { text: "A film-first portfolio website." },
          { text: "Fast, sharp video on every screen." },
          { text: "An enquiry flow that gathers the brief." },
        ],
        media: [],
      },
    ],
  },

  "higher-level-accounting": {
    hero: plate("#1d2b3a", "wide"),
    headline: "A brand, website, and client portal for an accounting practice ready to grow",
    facts: [
      { label: "Client", value: "Higher Level Accounting" },
      { label: "Location", value: "Caribbean" },
      { label: "Industry", value: "Accounting And Financial Services" },
      { label: "Partnership", value: "Engage + Integrate" },
      {
        label: "Scope",
        value: "Brand Identity, Website Design And Development, Client Portal, And Microsoft 365.",
      },
    ],
    tags: ["Brand", "Website", "Systems"],
    overview: [
      "Higher Level Accounting provides bookkeeping, tax, and advisory services to small and growing businesses. Its clients trusted the work, but documents arrived by email and WhatsApp, and every month started with chasing receipts.",
      "The practice needed a brand that matched its standards, a website that explained its services clearly, and a single secure place for clients to send and receive documents.",
      "What we did:",
      "Developed a brand identity for the practice.",
      "Designed and built a website that sets out its services and packages.",
      "Built a client portal for documents, requests, and deadlines.",
      "Set up a secure Microsoft 365 environment for the team.",
    ],
    feature: plate("#dfe7f2"),
    chapters: [
      {
        label: "Brand identity",
        heading: "Precise, Without Feeling Cold.",
        body: [
          "Accounting brands tend toward grey. We kept the precision and added warmth: a confident wordmark, a calm navy palette, and plain language that explains what the numbers mean.",
        ],
        items: [
          { text: "Designed a wordmark and supporting graphic system." },
          { text: "Set a colour and type system for screen and print." },
          { text: "Designed proposal, engagement letter, and report templates." },
        ],
        media: [[plate("#1d2b3a", "wide")], [plate("#dfe7f2", "portrait"), plate("#1d2b3a", "portrait")]],
      },
      {
        label: "Website",
        heading: "Services A Business Owner Can Compare At A Glance.",
        body: [
          "Prospective clients wanted to know what was included and what it would cost. We organised the website around the practice’s service packages and the businesses each one suits.",
        ],
        items: [
          { text: "Designed service pages for bookkeeping, tax, payroll, and advisory." },
          { text: "Set out packages with what each one includes." },
          { text: "Built a consultation booking flow." },
          { text: "Designed and developed the website using Next.js and Sanity." },
        ],
        media: [[plate("#dfe7f2")]],
      },
      {
        label: "Client portal",
        heading: "One Place For Every Document And Deadline.",
        body: [
          "Documents used to arrive across email and messaging apps. The portal gives each client one secure place to upload receipts and statements, see what the practice still needs, and track upcoming deadlines.",
        ],
        items: [
          { lead: "Document upload", text: "Clients upload receipts and statements from their phone." },
          { lead: "Requests", text: "The team requests missing documents, and clients see what is outstanding." },
          { lead: "Deadlines", text: "Each client sees their filing and payment dates in one view." },
          { lead: "Access", text: "Configured multi-factor authentication for every client account." },
        ],
        media: [[plate("#1d2b3a")]],
      },
      {
        label: "Delivery",
        heading: "Less Chasing, More Advising.",
        body: [
          "The team spends less time collecting documents and more time on the advice clients pay for, and new clients arrive already understanding the service.",
        ],
        items: [
          { text: "A brand identity and document templates." },
          { text: "A website with services, packages, and booking." },
          { text: "A secure client portal for documents and deadlines." },
          { text: "A Microsoft 365 environment for the team." },
        ],
        media: [],
      },
    ],
  },

  trekker: {
    hero: plate("#1f2d24", "wide"),
    headline: "An offline-first trip planning app for hikers and outdoor travellers",
    facts: [
      { label: "Client", value: "Trekker" },
      { label: "Location", value: "Caribbean" },
      { label: "Industry", value: "Travel And Outdoors" },
      { label: "Partnership", value: "Build" },
      { label: "Scope", value: "Product Design, Mobile App Development, Offline Maps, And Trip Sharing." },
    ],
    tags: ["App", "Product"],
    overview: [
      "Trekker helps hikers and outdoor travellers plan routes, pack for them, and share their plans with someone at home. The best trails are often where the signal is weakest, so an app that needed a connection failed exactly when it mattered.",
      "Trekker needed an app that does its work before the trip and keeps working without a signal once it starts.",
      "What we did:",
      "Designed the app around planning first and navigating offline.",
      "Built route planning with maps saved to the phone.",
      "Added packing lists built from the route and the weather.",
      "Built trip sharing so someone at home knows the plan.",
    ],
    feature: plate("#dce8d6"),
    chapters: [
      {
        label: "Product design",
        heading: "Built Around Where The Signal Ends.",
        body: [
          "We designed every screen for the moment the connection drops. Anything a hiker needs on the trail is saved before they set off, and the app tells them clearly what is ready to use offline.",
        ],
        items: [
          { text: "Mapped the journey from planning at home to the trail and back." },
          { text: "Designed an offline status that shows what is ready before setting off." },
          { text: "Tested the designs with hikers on real routes." },
        ],
        media: [[plate("#1f2d24", "wide")], [plate("#dce8d6", "portrait"), plate("#1f2d24", "portrait")]],
      },
      {
        label: "Route planning",
        heading: "Plan At Home, Follow It Offline.",
        body: [
          "Hikers plan a route on the map, see its distance and elevation, and save the area to their phone. On the trail, the route and their position work without a connection.",
        ],
        items: [
          { text: "Built route planning with distance and elevation." },
          { text: "Saved map areas to the phone for offline use." },
          { text: "Showed the hiker’s position on the route without a signal." },
        ],
        media: [[plate("#dce8d6")]],
      },
      {
        label: "Packing and sharing",
        heading: "Ready Before The Trip, Known At Home.",
        body: [
          "The app builds a packing list from the route and the forecast, and shares the plan with a contact at home, with the time the hiker expects to be back.",
        ],
        items: [
          { text: "Generated packing lists from the route and the weather." },
          { text: "Shared trip plans and expected return times with a contact." },
          { text: "Sent a check-in reminder when the hiker is due back." },
        ],
        media: [[plate("#1f2d24"), plate("#dce8d6")]],
      },
      {
        label: "Delivery",
        heading: "An App That Works Where Hikers Actually Go.",
        body: [
          "Trekker launched with planning, offline navigation, packing, and trip sharing in one app, built for the places with the least coverage.",
        ],
        items: [
          { text: "A product designed around offline use." },
          { text: "Route planning with offline maps." },
          { text: "Packing lists and trip sharing." },
        ],
        media: [],
      },
    ],
  },

  medz: {
    hero: plate("#3a1f1c", "wide"),
    headline: "A prescription ordering and delivery platform for pharmacies and their patients",
    facts: [
      { label: "Client", value: "Medz" },
      { label: "Location", value: "Caribbean" },
      { label: "Industry", value: "Health And Pharmacy" },
      { label: "Partnership", value: "Build + Integrate" },
      {
        label: "Scope",
        value: "Product Design, Patient App, Pharmacy Dashboard, And Delivery Tracking.",
      },
    ],
    tags: ["App", "Platform", "Systems"],
    overview: [
      "Medz connects patients with pharmacies for prescription orders and delivery. Filling a prescription usually meant a trip to the pharmacy and a wait in line, which is hardest for the patients who need their medication most.",
      "Medz needed a patient app that makes ordering simple, and tools that let pharmacists verify, prepare, and dispatch orders safely.",
      "What we did:",
      "Designed a patient app for ordering prescriptions and refills.",
      "Built a pharmacy dashboard for verifying and preparing orders.",
      "Added delivery tracking from the pharmacy to the door.",
      "Built refill reminders for ongoing medication.",
    ],
    feature: plate("#f2dcd6"),
    chapters: [
      {
        label: "Patient app",
        heading: "A Prescription In A Few Taps.",
        body: [
          "Patients photograph a prescription or choose a refill, pick a pharmacy, and choose delivery or collection. The app keeps their prescriptions and orders in one place.",
        ],
        items: [
          { text: "Designed prescription upload by photo." },
          { text: "Built one-tap refills for ongoing medication." },
          { text: "Let patients choose delivery or collection." },
          { text: "Sent reminders before a refill is due." },
        ],
        media: [[plate("#3a1f1c", "wide")], [plate("#f2dcd6", "portrait"), plate("#3a1f1c", "portrait")]],
      },
      {
        label: "Pharmacy dashboard",
        heading: "Verification Stays With The Pharmacist.",
        body: [
          "Every order is checked by a pharmacist before it is prepared. The dashboard gives the pharmacy one queue, from new prescriptions to orders ready for dispatch.",
        ],
        items: [
          { lead: "Order queue", text: "One view of new, verified, prepared, and dispatched orders." },
          { lead: "Verification", text: "Pharmacists review each prescription before preparation." },
          { lead: "Patient contact", text: "Pharmacists message patients about substitutions or questions." },
        ],
        media: [[plate("#f2dcd6")]],
      },
      {
        label: "Delivery",
        heading: "From The Pharmacy To The Door, Tracked.",
        body: [
          "Patients see when their order is prepared, dispatched, and on its way, and the pharmacy sees every delivery in progress.",
        ],
        items: [
          { text: "Built delivery tracking for patients and pharmacies." },
          { text: "Confirmed delivery on arrival." },
        ],
        media: [[plate("#3a1f1c")]],
      },
      {
        label: "Outcome",
        heading: "Medication Without The Queue.",
        body: [
          "Patients order and receive their medication without a trip to the pharmacy, and pharmacists keep control of every prescription they fill.",
        ],
        items: [
          { text: "A patient app for orders, refills, and reminders." },
          { text: "A pharmacy dashboard for verification and preparation." },
          { text: "Delivery tracking from pharmacy to patient." },
        ],
        media: [],
      },
    ],
  },

  /* DEMO — invented clients, from here down. See the note on `projects`. */
  "saltmere-credit-union": {
    hero: plate("#0f3b3a", "wide"),
    headline:
      "A refreshed brand, member website, and online joining for a credit union modernising its service",
    facts: [
      { label: "Client", value: "Saltmere Credit Union" },
      { label: "Location", value: "Castries, Saint Lucia" },
      { label: "Industry", value: "Financial Services" },
      { label: "Partnership", value: "Engage + Integrate" },
      {
        label: "Scope",
        value:
          "Brand Refresh, Website Design And Development, Online Membership, Member Communications, And Microsoft 365.",
      },
    ],
    tags: ["Brand", "Website", "Systems"],
    overview: [
      "Saltmere is a member-owned credit union with branches across Saint Lucia. Its members trusted it, but younger members were drifting to banks with better digital service, and joining still meant a branch visit and a stack of paper forms.",
      "Saltmere needed to modernise how it looked and how people joined, without losing the community feel that set it apart from the banks.",
      "What we did:",
      "Refreshed the brand for screens while keeping its heritage.",
      "Designed and built a member website organised around members’ questions.",
      "Moved membership applications online, with document upload and staff review.",
      "Set up member communications by email and SMS.",
      "Built a secure Microsoft 365 environment for staff.",
    ],
    feature: plate("#d9e4dc"),
    chapters: [
      {
        label: "Brand refresh",
        heading: "Modern, Without Losing The Membership.",
        body: [
          "Saltmere’s mark had served it for decades, and members recognised it. We refined rather than replaced it: redrawn for screens, set in a warmer palette, and paired with photography of real members instead of stock.",
        ],
        items: [
          { text: "Redrew the existing mark for digital use." },
          { text: "Introduced a warmer palette and an accessible type system." },
          { text: "Directed member photography across three branches." },
          { text: "Refreshed branch signage, forms, and statements." },
        ],
        media: [
          [plate("#0f3b3a", "wide")],
          [plate("#d9e4dc", "portrait"), plate("#f4efe6", "portrait")],
        ],
      },
      {
        label: "Website",
        heading: "Answers For Members, Not Just Products.",
        body: [
          "The old website listed products. Members came with questions: how do I join, what does a loan cost, where is my nearest branch. We organised the new website around those questions.",
        ],
        items: [
          { text: "Organised the website around members’ most common questions." },
          { text: "Built loan and savings calculators." },
          { text: "Added branch pages with opening hours and services." },
          { text: "Designed and developed the website using Next.js and Sanity." },
          { text: "Met WCAG 2.1 AA across the website." },
        ],
        media: [
          [plate("#f4efe6")],
          [plate("#0f3b3a", "portrait"), plate("#d9e4dc", "portrait")],
        ],
      },
      {
        label: "Online membership",
        heading: "Joining Without A Branch Visit.",
        body: [
          "Joining took a branch visit and three paper forms. We moved the whole application online, from first details to approval, and gave staff a single queue to review it.",
        ],
        items: [
          { text: "Designed a step-by-step application that saves progress." },
          { text: "Added secure upload for identification and proof of address." },
          { text: "Built a review queue for branch staff." },
          { text: "Sent applicants status updates by email and SMS." },
          { text: "Exported approved applications in the core banking system’s format." },
        ],
        media: [[plate("#d9e4dc")]],
      },
      {
        label: "Internal systems",
        heading: "Secure Tools For The Staff Behind The Service.",
        body: [
          "Staff were sharing one inbox per branch and storing member documents on local drives. We set up an environment that matched the security a financial institution needs.",
        ],
        items: [
          {
            lead: "Microsoft 365 setup",
            text: "Provisioned a new tenant with individual accounts for every staff member.",
          },
          {
            lead: "Access controls",
            text: "Configured multi-factor authentication and Conditional Access policies.",
          },
          {
            lead: "Document management",
            text: "Built a SharePoint structure with retention rules for member records.",
          },
          { lead: "Training", text: "Ran sessions for staff in each branch." },
        ],
        media: [[plate("#0f3b3a")]],
      },
      {
        label: "Delivery",
        heading: "A Credit Union That Works The Way Members Now Expect.",
        body: [
          "Saltmere kept what made it a credit union and changed how people reach it. Members can now find answers, compare products, and join without leaving home.",
        ],
        items: [
          { text: "A refreshed brand across digital, branch, and print." },
          { text: "A member website with calculators and branch pages." },
          { text: "Online membership applications with staff review." },
          { text: "Member communications by email and SMS." },
          { text: "A secure Microsoft 365 environment for staff." },
        ],
        media: [],
      },
    ],
  },

  "kestrel-bay-resort": {
    hero: plate("#0d3b5c", "wide"),
    headline: "A brand, booking website, and launch film for a boutique resort reopening after renovation",
    facts: [
      { label: "Client", value: "Kestrel Bay Resort" },
      { label: "Location", value: "Antigua" },
      { label: "Industry", value: "Hospitality And Tourism" },
      { label: "Partnership", value: "Engage" },
      {
        label: "Scope",
        value: "Brand Identity, Website Design And Development, Direct Booking, Launch Film, And Guest Communications.",
      },
    ],
    tags: ["Brand", "Website", "Film"],
    overview: [
      "Kestrel Bay is a thirty-room resort on Antigua’s quieter coast. After a full renovation it was reopening as a different place, but most of its bookings still came through travel agents and online platforms that took a large share of every stay.",
      "The resort needed a brand to announce the change, and a website that could win bookings directly.",
      "What we did:",
      "Created a new identity for the reopened resort.",
      "Designed and built a website with direct booking.",
      "Directed a launch film shot on the property.",
      "Designed pre-arrival emails and in-room guides.",
    ],
    feature: plate("#f2e6d6"),
    chapters: [
      {
        label: "Brand identity",
        heading: "A New Name On An Old Coastline.",
        body: [
          "The renovation changed everything but the view. We built the identity around the bay itself: a mark drawn from the coastline, a palette from the water at different hours, and a typeface that reads well on a menu as on a screen.",
        ],
        items: [
          { text: "Designed a mark drawn from the shape of the bay." },
          { text: "Set a palette and typography for print, screen, and signage." },
          { text: "Designed menus, room cards, and signage." },
          { text: "Wrote a voice for the resort’s guest-facing writing." },
        ],
        media: [
          [plate("#0d3b5c", "wide")],
          [plate("#f2e6d6", "portrait"), plate("#e0673f", "portrait")],
        ],
      },
      {
        label: "Website",
        heading: "Direct Bookings, In Fewer Steps.",
        body: [
          "Guests compared the resort across three or four websites before booking. We gave them a reason to book direct: better rooms information, honest photography, and a booking flow that takes under two minutes.",
        ],
        items: [
          { text: "Designed room pages with floor plans and real photography." },
          { text: "Integrated the property management system’s booking engine." },
          { text: "Shortened booking to three steps." },
          { text: "Added offers available only on direct bookings." },
          { text: "Designed and developed the website using Next.js and Sanity." },
        ],
        media: [
          [plate("#f2e6d6")],
          [plate("#0d3b5c", "portrait"), plate("#f2e6d6", "portrait")],
        ],
      },
      {
        label: "Launch film",
        heading: "The Resort, Before Arrival.",
        body: [
          "A reopening needs a moment. We directed a short film over a single day on the property, from first light to dinner, cut for the website, social channels, and agents.",
        ],
        items: [
          { text: "Directed a two-day shoot on the property." },
          { text: "Cut a ninety-second film and six short edits for social." },
          { text: "Delivered a looping cut for the website’s opening." },
        ],
        media: [[plate("#0d3b5c", "wide")]],
      },
      {
        label: "Guest communications",
        heading: "The Same Care Before And After The Stay.",
        body: [
          "The brand continues after the booking. We designed the messages and materials a guest receives from confirmation to checkout.",
        ],
        items: [
          { text: "Designed confirmation and pre-arrival emails." },
          { text: "Produced an in-room guide to the resort and the island." },
          { text: "Designed a post-stay email that asks for a review." },
        ],
        media: [[plate("#f2e6d6"), plate("#e0673f")]],
      },
      {
        label: "Delivery",
        heading: "A Reopening Guests Could See Coming.",
        body: [
          "Kestrel Bay reopened with a brand, a website, and a film that showed guests what had changed, and a direct route to book.",
        ],
        items: [
          { text: "A new identity across print, screen, and the property." },
          { text: "A website with direct booking." },
          { text: "A launch film and social edits." },
          { text: "Guest emails and an in-room guide." },
        ],
        media: [],
      },
    ],
  },

  "calabash-water-authority": {
    hero: plate("#16324f", "wide"),
    headline: "A service status platform and customer portal for a water utility serving an entire island",
    facts: [
      { label: "Client", value: "Calabash Water Authority" },
      { label: "Location", value: "Eastern Caribbean" },
      { label: "Industry", value: "Public Utilities" },
      { label: "Partnership", value: "Build + Integrate" },
      {
        label: "Scope",
        value: "Service Research, Status Platform, Customer Portal, And Incident Workflow.",
      },
    ],
    tags: ["Website", "Systems"],
    overview: [
      "Calabash supplies water to every household on the island. When supply was interrupted, by maintenance or by a storm, customers heard about it from neighbours and social media long before the authority could say anything.",
      "The authority needed one reliable place to publish service updates, and a way for customers to pay bills and report problems without calling a busy line.",
      "What we did:",
      "Researched how customers find out about interruptions.",
      "Built a public service status platform with a live map.",
      "Designed and built a customer portal for bills, payments, and reports.",
      "Connected field teams to the platform through an incident workflow.",
    ],
    feature: plate("#e4e9f7"),
    chapters: [
      {
        label: "Research",
        heading: "Starting With How People Find Out.",
        body: [
          "We spoke with customers in every parish and with the staff who answer the phones during an outage. Most people did not want more information. They wanted to know, quickly, whether their street was affected and when water would be back.",
        ],
        items: [
          { text: "Interviewed customers across every parish." },
          { text: "Sat with call centre staff during a planned outage." },
          { text: "Mapped how outage information moved through the organisation." },
        ],
        media: [[plate("#e4e9f7")]],
      },
      {
        label: "Status platform",
        heading: "Interruptions, Mapped And Updated As They Happen.",
        body: [
          "We built a public status page around a map of the island. Each interruption shows the area affected, the cause, and the expected time of restoration, updated by the team handling it.",
        ],
        items: [
          { text: "Built a live map of planned and unplanned interruptions." },
          { text: "Let customers check an address and subscribe to updates." },
          { text: "Sent alerts by SMS and email when an area’s status changes." },
          { text: "Kept the page fast and readable on weak connections during storms." },
        ],
        media: [
          [plate("#16324f", "wide")],
          [plate("#e4e9f7", "portrait"), plate("#16324f", "portrait")],
        ],
      },
      {
        label: "Customer portal",
        heading: "Bills, Payments, And Reports In One Account.",
        body: [
          "Customers could only pay in person or by bank transfer. The portal brings their account online: see the bill, pay it, and report a leak or a low-pressure problem with a photo and a location.",
        ],
        items: [
          { text: "Designed and built an account portal for customers." },
          { text: "Integrated card payments with the billing system." },
          { text: "Added fault reporting with photos and map locations." },
          { text: "Designed paperless billing sign-up." },
        ],
        media: [[plate("#e4e9f7"), plate("#d8dde8")]],
      },
      {
        label: "Incident workflow",
        heading: "One Source Of Truth For The Teams In The Field.",
        body: [
          "The status page is only as good as the information behind it. We connected the platform to the way field crews already worked, so an update in the field becomes an update for customers.",
        ],
        items: [
          { lead: "Field updates", text: "Built a mobile form for crews to update an incident’s status." },
          { lead: "Approvals", text: "Added a check by the duty manager before public updates go out." },
          { lead: "Reporting", text: "Gave management a dashboard of response and restoration times." },
        ],
        media: [[plate("#16324f")]],
      },
      {
        label: "Delivery",
        heading: "Fewer Calls, And Better Answers When People Do Call.",
        body: [
          "Customers now hear about interruptions from the authority first. Call centre staff work from the same information customers see.",
        ],
        items: [
          { text: "A public service status platform with alerts." },
          { text: "A customer portal for bills, payments, and fault reports." },
          { text: "A field incident workflow and management reporting." },
        ],
        media: [],
      },
    ],
  },

  "fieldnote-learning": {
    hero: plate("#2f4a3a", "wide"),
    headline: "A brand and offline-first learning platform for an education non-profit reaching rural schools",
    facts: [
      { label: "Client", value: "Fieldnote Learning" },
      { label: "Location", value: "Kingston, Jamaica" },
      { label: "Industry", value: "Education And Non-Profit" },
      { label: "Partnership", value: "Build" },
      { label: "Scope", value: "Brand Identity, Learning Platform, Teacher Tools, And Funder Reporting." },
    ],
    tags: ["Brand", "Platform"],
    overview: [
      "Fieldnote produces maths and literacy lessons for primary schools. Its lessons were good, but they reached rural schools as photocopies, and the schools that most needed them had the least reliable internet.",
      "Fieldnote needed a platform that worked without a connection, and a brand that could stand in front of teachers, children, and funders alike.",
      "What we did:",
      "Created a brand that works for children, teachers, and funders.",
      "Built an offline-first learning platform for tablets and laptops.",
      "Designed tools for teachers to plan lessons and track progress.",
      "Built reporting that turns classroom use into funder updates.",
    ],
    feature: plate("#f1e3d3"),
    chapters: [
      {
        label: "Brand identity",
        heading: "Friendly Enough For A Classroom, Serious Enough For A Funder.",
        body: [
          "Fieldnote speaks to three audiences at once. We built an identity with a playful illustration system for the lessons and a quieter, more formal register for reports and proposals.",
        ],
        items: [
          { text: "Designed a wordmark and an illustration system for lessons." },
          { text: "Set a palette that holds up on low-cost screens and in print." },
          { text: "Designed report and proposal templates for funders." },
        ],
        media: [
          [plate("#f1e3d3", "wide")],
          [plate("#2f4a3a", "portrait"), plate("#e0673f", "portrait")],
        ],
      },
      {
        label: "Learning platform",
        heading: "Lessons That Keep Working Offline.",
        body: [
          "Schools might have a connection once a week. The platform downloads a term of lessons when it can, then runs entirely on the device, syncing progress back whenever a connection returns.",
        ],
        items: [
          { text: "Built an offline-first web app that installs on tablets and laptops." },
          { text: "Downloaded a term of lessons in a single sync." },
          { text: "Synced pupils’ progress when a connection returns." },
          { text: "Kept the app usable on low-cost devices." },
        ],
        media: [[plate("#2f4a3a"), plate("#f1e3d3")]],
      },
      {
        label: "Teacher tools",
        heading: "Planning And Progress Without The Paperwork.",
        body: [
          "Teachers were tracking progress in exercise books. We gave them a simple view of where each pupil is, and lesson plans that line up with the national curriculum.",
        ],
        items: [
          { text: "Designed a class view of each pupil’s progress." },
          { text: "Mapped lessons to the national curriculum." },
          { text: "Added printable worksheets for classes without devices." },
        ],
        media: [[plate("#f1e3d3")]],
      },
      {
        label: "Delivery",
        heading: "The Same Lessons, Reaching Further.",
        body: [
          "Fieldnote can now reach schools that a photocopier could not, and show funders what happens in the classroom.",
        ],
        items: [
          { text: "A brand for lessons, teachers, and funders." },
          { text: "An offline-first learning platform." },
          { text: "Teacher planning and progress tools." },
          { text: "Funder reporting built from classroom use." },
        ],
        media: [],
      },
    ],
  },

  "ardent-logistics-group": {
    hero: plate("#202426", "wide"),
    headline: "A shipment tracking portal and connected operations systems for a regional freight forwarder",
    facts: [
      { label: "Client", value: "Ardent Logistics Group" },
      { label: "Location", value: "Port of Spain, Trinidad And Tobago" },
      { label: "Industry", value: "Logistics And Freight Forwarding" },
      { label: "Partnership", value: "Integrate" },
      {
        label: "Scope",
        value: "Operations Review, Customer Tracking Portal, Systems Integration, And Website.",
      },
    ],
    tags: ["Systems", "Platform", "Website"],
    overview: [
      "Ardent moves freight between Trinidad and Tobago, the wider Caribbean, and Miami. Each shipment touched four systems and a dozen emails, and customers asking where their goods were waited while staff pieced the answer together.",
      "Ardent needed one view of every shipment, for its own team and for its customers.",
      "What we did:",
      "Reviewed how a shipment moved through the business.",
      "Connected the operations, accounting, and customs systems.",
      "Built a customer portal for tracking, documents, and invoices.",
      "Redesigned the website around the services customers buy.",
    ],
    feature: plate("#e7e3dc"),
    chapters: [
      {
        label: "Operations review",
        heading: "Following A Shipment From Booking To Delivery.",
        body: [
          "Before building anything, we followed shipments through the business, from the first quote to proof of delivery, and recorded every system and hand-off along the way.",
        ],
        items: [
          { text: "Mapped the life of a shipment across four systems." },
          { text: "Identified where information was re-keyed by hand." },
          { text: "Agreed one shipment record as the source of truth." },
        ],
        media: [[plate("#e7e3dc")]],
      },
      {
        label: "Systems integration",
        heading: "Four Systems, One Shipment Record.",
        body: [
          "We connected the systems Ardent already relied on, rather than replacing them, so a status change in one shows up everywhere.",
        ],
        items: [
          { lead: "Operations", text: "Linked the freight management system to a central shipment record." },
          { lead: "Accounting", text: "Raised invoices automatically at each billable milestone." },
          { lead: "Customs", text: "Pulled clearance status from the customs broker’s system." },
          { lead: "Alerts", text: "Notified the team when a shipment stalls at any stage." },
        ],
        media: [[plate("#202426", "wide")]],
      },
      {
        label: "Customer portal",
        heading: "One View Of Every Shipment.",
        body: [
          "Customers now see what Ardent sees: where a shipment is, what documents are outstanding, and what has been invoiced.",
        ],
        items: [
          { text: "Built shipment tracking with milestone history." },
          { text: "Let customers download bills of lading and customs documents." },
          { text: "Showed invoices and payment status." },
          { text: "Gave each customer account multiple users with their own permissions." },
        ],
        media: [[plate("#e7e3dc", "portrait"), plate("#202426", "portrait")]],
      },
      {
        label: "Website",
        heading: "Services Explained By Route And Cargo.",
        body: [
          "The website now explains Ardent’s services the way customers think about them: by route, by cargo type, and by how quickly it needs to arrive.",
        ],
        items: [
          { text: "Organised services by route and cargo type." },
          { text: "Built a quote request that captures the details operations need." },
          { text: "Linked the website to the customer portal." },
        ],
        media: [[plate("#e7e3dc")]],
      },
      {
        label: "Delivery",
        heading: "Fewer Emails, Faster Answers.",
        body: [
          "Ardent’s team works from one shipment record, and customers answer their own questions in the portal.",
        ],
        items: [
          { text: "An operations review and a single shipment record." },
          { text: "Integrated operations, accounting, and customs systems." },
          { text: "A customer portal for tracking, documents, and invoices." },
          { text: "A redesigned website with quote requests." },
        ],
        media: [],
      },
    ],
  },
};
