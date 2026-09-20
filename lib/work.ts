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
