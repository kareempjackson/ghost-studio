/**
 * Writes the site's search titles and descriptions: what a page shows in
 * search results and on share cards. All of it stays editable in the
 * Studio afterwards, in each page's SEO fields.
 *
 *   npm run migrate:seo -- --dry   # list what would change
 *   npm run migrate:seo
 *
 * Search titles go in the Meta title fields, whole, as search results
 * show them, so a page's name, its share card and its heading stay as they
 * are. Descriptions fill the pages' description fields, 120 to 160
 * characters, where search results cut them. Phases, audiences and
 * projects had none and fell back to a line too short to be useful; a few
 * pages had one that said too little. And /brand, whose words were in code,
 * gets the document that holds them, with what it says today.
 *
 * Only what differs is written, to the published document and to its draft
 * if there is one, so an editor's open draft keeps the change when it is
 * published. Each is patched against the revision it was read at: one
 * edited meanwhile makes the run fail without writing, and running it again
 * picks it up.
 *
 * Run it after the code that reads the search titles is deployed: the site
 * before it shows descriptions but not the titles.
 *
 * Needs SANITY_API_WRITE_TOKEN, read from .env.local.
 */

import { createClient } from "next-sanity";

const dry = process.argv.includes("--dry");

const token = process.env.SANITY_API_WRITE_TOKEN;
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
if (!token || !projectId || !dataset) {
  console.error(
    "Set NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET and SANITY_API_WRITE_TOKEN in .env.local.",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-10-01",
  useCdn: false,
  perspective: "raw",
});

/** Each document's fields, by its published id. A dotted key reaches into an object. */
const copy: Record<string, Record<string, string>> = {
  homePage: {
    metaTitle: "Ghost Savvy Studios — Websites, apps, brands and IT systems",
    description:
      "A design-first studio building websites, apps, brands and IT systems for founders, institutions and nonprofits across the Caribbean, North America and Europe.",
  },
  aboutPage: {
    description:
      "Ghost Savvy Studios is a design-first studio founded in 2024, building products, brands and IT systems for growing organisations. Meet the team behind it.",
  },
  servicesPage: {
    metaTitle: "Brand, design and technology services — Ghost Savvy Studios",
  },
  "trackPage-build": {
    metaTitle: "Build: a product team on subscription — Ghost Savvy Studios",
    description:
      "Engineering, design and product strategy on a monthly subscription: a team composed around what you’re building, with more disciplines than you could hire.",
  },
  "trackPage-engage": {
    metaTitle: "Engage: fixed-scope digital projects — Ghost Savvy Studios",
    description:
      "A defined engagement for a specific business problem, from a website to a system, with named deliverables, scope agreed up front and a path to handover.",
  },
  "trackPage-integrate": {
    metaTitle: "Integrate: cloud and IT integration — Ghost Savvy Studios",
    description:
      "Cloud, identity and connected workflows: the operational layer behind a business that works, built around the systems your team already uses.",
  },
  managedServicesPage: {
    metaTitle: "Managed IT services and support — Ghost Savvy Studios",
  },
  whoWeServePage: {
    metaTitle: "Who we serve: clients and sectors — Ghost Savvy Studios",
    description:
      "Ghost Savvy Studios works with funded founders, enterprise teams, public agencies, nonprofits, universities and health organisations. See what we do for each.",
  },
  workPage: {
    metaTitle: "Work: case studies and client projects — Ghost Savvy Studios",
    description:
      "Case studies from Ghost Savvy Studios: brands, websites, apps and internal systems for clients in the Caribbean, the United States and beyond.",
  },
  insightsPage: {
    metaTitle: "Insights on design and engineering — Ghost Savvy Studios",
    description:
      "Notes from the work: case studies and ideas on product strategy, design and software engineering, written by the team at Ghost Savvy Studios.",
  },
  contactPage: {
    metaTitle: "Contact us to start a project — Ghost Savvy Studios",
    description:
      "Tell us what you’re trying to solve. Share as much or as little as you have, and we’ll reply to set up a first call with the Ghost Savvy Studios team.",
  },
  approachPage: {
    metaTitle: "Our approach: Clarity Engineering — Ghost Savvy Studios",
  },
  "legalPage-terms": {
    description:
      "The terms that apply when you use the Ghost Savvy Studios website: using the site and its content, enquiries, liability, and the law that governs them.",
  },

  "phase-discover-the-job": {
    description:
      "Discover the Job, the first phase of Clarity Engineering: we listen to the people involved, watch the work as it happens and name the problem before building.",
  },
  "phase-define-the-system": {
    description:
      "Define the System, the second phase of Clarity Engineering: we turn the need behind a request into a system brief, a prioritised scope and a release plan.",
  },
  "phase-build-with-precision": {
    description:
      "Build with Precision, the third phase of Clarity Engineering: a working product, reviewed together, quality-checked and documented for handover.",
  },
  "phase-evolve-the-product": {
    description:
      "Evolve the Product, the fourth phase of Clarity Engineering: we watch what happens after launch and use that evidence to choose the next improvement.",
  },

  "audience-funded-startups-and-founders": {
    description:
      "A product team for funded founders who need more disciplines than they can hire: clearer priorities, a consistent experience and a dependable foundation.",
  },
  "audience-enterprise-and-mid-market-teams": {
    description:
      "Design and technology for enterprise and mid-market teams with established systems: clearer journeys, a connected operation and a manageable transition.",
  },
  "audience-institutions-and-public-agencies": {
    description:
      "Public websites, engagement platforms and service portals for institutions and public agencies, organised around what residents and service users need.",
  },
  "audience-nonprofits-and-ngos": {
    description:
      "Websites and working systems for nonprofits and NGOs with a lot to communicate and a small team: a clear mission, manageable publishing, less admin.",
  },
  "audience-universities-and-research-institutions": {
    description:
      "Websites and publishing for universities and research institutions: a shared structure connecting departments, research and the people looking for them.",
  },
  "audience-health-and-public-health": {
    description:
      "Public-facing websites and communications for health and public health organisations, making published information easier to find and use.",
  },

  "project-barbados-pharmaceuticals": {
    description:
      "How Ghost Savvy Studios built the brand, website and internal systems for Barbados Pharmaceutical Inc., a new state enterprise making medicines in Barbados.",
  },
  "project-amh-project-solutions": {
    description:
      "How Ghost Savvy Studios built a brand and resource platform for AMH Project Solutions: vetted local providers and practical guidance for building in Grenada.",
  },
  "project-brown-girl-cafe": {
    description:
      "How Ghost Savvy Studios built a brand for Brown Girl Café, a café in Grenada where people come to eat, study and work, with a twist of its own.",
  },
  "project-higher-level-accounting": {
    description:
      "How Ghost Savvy Studios built a brand and website for Higher Level Accounting, a Las Vegas practice ready to grow and as organised online as its books.",
  },
  "project-island-innovators": {
    description:
      "How Ghost Savvy Studios built Island Innovators’ member platform: a home online for the founders, technologists and creatives building the Caribbean.",
  },
  "project-nakeba-mason": {
    description:
      "How Ghost Savvy Studios built a personal brand and website for Nakeba Mason, an operations partner to creative founders, based in Barbados.",
  },
  "project-psychologists-for-racial-justice": {
    description:
      "How Ghost Savvy Studios built a website for Psychologists for Racial Justice: one home for PRJ’s mission, its conference and its continuing education.",
  },
  "project-trekker": {
    description:
      "Trekker, a Ghost Labs experiment from Ghost Savvy Studios: a travel and social app for people who live on the road, and how the product came together.",
  },

  "article-custom-inspection-app": {
    "seo.metaDescription":
      "We built a custom inspection app for a construction and industrial inspection company. Inspectors now finish reports on site in minutes, not hours at night.",
  },
  "article-marketplace-payment-integration": {
    "seo.metaTitle": "Marketplace Payment Integration: Rebuilt Payments & Payouts",
  },
};

/** A dotted key's value in a document. */
const read = (doc: Record<string, unknown>, key: string) =>
  key.split(".").reduce<unknown>((value, part) => (value as Record<string, unknown> | undefined)?.[part], doc);

async function main() {
  const ids = Object.keys(copy);
  const docs = await client.fetch<(Record<string, unknown> & { _id: string; _rev: string })[]>(
    `*[_id in $ids || _id in $drafts]`,
    { ids, drafts: ids.map((id) => `drafts.${id}`) },
  );

  const missing = ids.filter((id) => !docs.some((doc) => doc._id === id));
  if (missing.length) console.warn(`Not published, left alone: ${missing.join(", ")}\n`);

  const tx = client.transaction();
  let changes = 0;

  /* /brand's words, from code into the Studio, as the page says them today. */
  if (!(await client.fetch<boolean>(`defined(*[_id == "brandPage"][0]._id)`))) {
    console.log("brandPage: created with the page's title and description");
    tx.createIfNotExists({
      _id: "brandPage",
      _type: "brandPage",
      title: "Brand system",
      description:
        "The Ghost Savvy Studios brand system: the mark, the palette, the type scale, and the rules that keep them honest.",
    });
    changes++;
  }

  for (const doc of docs) {
    const fields = copy[doc._id.replace(/^drafts\./, "")];
    const set = Object.fromEntries(Object.entries(fields).filter(([key, value]) => read(doc, key) !== value));
    if (!Object.keys(set).length) continue;

    console.log(doc._id);
    for (const [key, value] of Object.entries(set)) {
      const before = read(doc, key);
      console.log(`  ${key} (${value.length})`);
      console.log(`    was: ${typeof before === "string" ? before : "(empty)"}`);
      console.log(`    now: ${value}`);
    }
    tx.patch(doc._id, (p) => p.ifRevisionId(doc._rev).set(set));
    changes++;
  }

  if (!changes) {
    console.log("Every title and description is already written. Nothing to do.");
    return;
  }
  if (dry) {
    console.log(`\n--dry: ${changes} documents would change.`);
    return;
  }
  await tx.commit();
  console.log(`\n${changes} documents updated.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
