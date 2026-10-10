/**
 * Puts the site's content into Sanity, as it stood before Sanity ran it.
 *
 *   npm run seed
 *
 * Reads the typed content in sanity/seed/content/ (the files that used to be
 * lib/*.ts), uploads the pictures from public/ to Sanity and the reel to R2,
 * and writes one document per page and band at a fixed id. Every write is createOrReplace,
 * so running it again resets those documents to this content: run it once
 * to start, not after editors have begun.
 *
 * Needs NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET and an
 * Editor token in SANITY_API_WRITE_TOKEN, and the R2_ values, read from
 * .env.local.
 */

import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { createClient } from "next-sanity";
import { positioning } from "../../lib/brand/voice";
import { put, videoKey } from "../../lib/r2";
import { richify } from "../lib/rich";
import { caseStudy, keyed, story, storyId, topicId } from "./shape";
import { schemaTypes } from "../schemaTypes";
import { audienceSlug } from "../../lib/links";
import { aboutPage } from "./content/about";
import { approachPage, phases as approachPhases } from "./content/approach";
import { buildPage } from "./content/build";
import { contact } from "./content/contact";
import { engagePage } from "./content/engage";
import { engagement } from "./content/engagement";
import { ghostUPage, givesPage, labsPage, type FamilyPageData } from "./content/family-pages";
import { stories } from "./content/family-stories";
import { contactBand, email, footer, social } from "./content/footer";
import { articles, insightsPage, topics } from "./content/insights";
import { integratePage } from "./content/integrate";
import { journal } from "./content/journal";
import { legalDocuments } from "./content/legal";
import { menuContact, menuFeatureLabel, siteNavigation, ventureNavigation } from "./content/navigation";
import { pointOfView } from "./content/point-of-view";
import { process as processSteps } from "./content/process";
import { sectors } from "./content/sectors";
import { services, servicesPage } from "./content/services";
import { studioStrip } from "./content/studio-strip";
import { testimonials } from "./content/testimonials";
import type { TrackPageData } from "./content/track-page";
import { audiencePages, whoWeServePage } from "./content/who-we-serve";
import {
  caseStudies,
  caseStudyLabels,
  projects,
  selectedWork,
  workAction,
  workPage,
} from "./content/work";

/** `npm run seed -- --dry` prints the documents instead of writing them. */
const dry = process.argv.includes("--dry");

const token = process.env.SANITY_API_WRITE_TOKEN;
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || (dry ? "dry" : "");
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || (dry ? "dry" : "");
if (!dry && (!token || !projectId || !dataset)) {
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
});

/* ---- Helpers --------------------------------------------------------------- */

const uploads = new Map<string, Promise<string>>();

/** Uploads a picture from public/ once, however many documents use it. */
function upload(src: string) {
  const path = src.replace(/^\//, "");
  if (dry) return Promise.resolve(`image-dry-${path}`);
  if (!uploads.has(path)) {
    uploads.set(
      path,
      client.assets
        .upload("image", createReadStream(join("public", path)), { filename: basename(path) })
        .then((asset) => {
          console.log(`  uploaded ${path}`);
          return asset._id;
        }),
    );
  }
  return uploads.get(path)!;
}

/** A film field: the MP4 from public/, put on R2. */
async function film(src: string) {
  const path = src.replace(/^\//, "");
  const filename = basename(path);
  const key = videoKey(filename);
  const body = await readFile(join("public", path));
  const url = dry ? `r2-dry/${key}` : await put(key, body, "video/mp4");
  if (!dry) console.log(`  uploaded ${path} to R2`);
  return { _type: "r2Video", url, key, filename, mimeType: "video/mp4", size: body.byteLength };
}

/** A picture field: the upload if there is one, and the alt text either way. */
async function image(src: string | null | undefined, alt = "") {
  return {
    _type: "image",
    ...(src ? { asset: { _type: "reference", _ref: await upload(src) } } : {}),
    alt,
  };
}

const ref = (id: string) => ({ _type: "reference", _ref: id, _key: id });

const projectId_ = (slug: string) => `project-${slug}`;
const articleId = (slug: string) => `article-${slug}`;

/* ---- Documents ------------------------------------------------------------- */

async function documents() {
  const docs: Record<string, unknown>[] = [];
  /* The copy is written below as plain strings; the rich text fields get
     it as blocks, one per paragraph. */
  const add = (_id: string, _type: string, fields: Record<string, unknown>) =>
    docs.push(richify({ _id, _type, ...(keyed(fields) as object) }, schemaTypes as never));

  /* Site */
  add("siteSettings", "siteSettings", {
    title: "Ghost Savvy Studios",
    description:
      "We build public-facing digital systems for institutions that cannot afford to get them wrong.",
    email,
    social,
    headerAction: { label: "Let’s talk", href: "/contact" },
  });

  add("navigation", "navigation", {
    items: siteNavigation.map(({ children, ...item }) =>
      item.href === "/who-we-serve"
        ? { ...item, audiences: true }
        : { ...item, ...(children ? { children } : {}) },
    ),
    ventures: ventureNavigation,
    contactLabel: menuContact.label,
    featureLabel: menuFeatureLabel,
    openLabel: "Open menu",
  });

  add("footer", "footer", {
    contactBand,
    ...footer,
    newsletter: { ...footer.newsletter, inputLabel: "Email address" },
  });

  /* Lifted out of ChatPanel and ChatLauncher, where it was set inline. */
  add("chat", "chat", {
    launcher: { open: "Let’s talk", close: "Close", label: "Chat with Ghost Savvy" },
    heading: "A good conversation starts here",
    status: "Chat preview · Connected",
    intro:
      "Tell us what you’re thinking. A new idea, a tricky problem, or a question about working together.",
    topics: ["A project", "Your services", "Something else"],
    topicsLabel: "What is it about?",
    name: { label: "Your name", placeholder: "Name" },
    email: { label: "Email", placeholder: "you@company.com" },
    message: { label: "Your message", placeholder: "What’s on your mind" },
    preview: "Preview message",
    ready: {
      label: "Your message, ready to send",
      about: "About",
      from: "From",
      message: "Message",
      empty: "(nothing yet)",
      send: "Send it as an email",
      edit: "Edit the message",
    },
    note: "Demo only. This form doesn’t send or store your details.",
    contact: "Contact",
    closeLabel: "Close chat",
  });

  /* Projects and articles */
  for (const project of projects) {
    const { slug, image: src, ...fields } = project;
    add(projectId_(slug), "project", {
      ...fields,
      slug: { _type: "slug", current: slug },
      image: await image(src, ""),
      ...caseStudy(caseStudies[slug]),
    });
  }

  /* The topics, in the order the filter had them. */
  for (const [order, title] of topics.entries()) {
    add(topicId(title), "insightTopic", { title, order });
  }

  /* The journal (home) and the insights index wrote the same three pieces
     twice. One article each now: the home page's line breaks and covers,
     the index's excerpts. */
  const journalPieces = [journal.featured, ...journal.entries];
  for (const [i, article] of articles.entries()) {
    const piece = journalPieces.find((p) => p.slug === article.slug);
    const cover = piece && "cover" in piece ? piece.cover : null;
    add(articleId(article.slug), "article", {
      title: piece?.title ?? [article.title],
      slug: { _type: "slug", current: article.slug },
      topic: { _type: "reference", _ref: topicId(article.topic) },
      /* Newest first on /insights, in the order the index had them. */
      publishedAt: new Date(Date.UTC(2026, 8, 1 - i)).toISOString(),
      excerpt: article.excerpt,
      cover: {
        image: await image(cover?.src, cover?.alt ?? ""),
        ground: cover?.ground ?? "#e7e6e1",
      },
    });
  }

  /* Bands */
  add("homePage", "homePage", {
    hero: {
      video: await film("media/hero.mp4"),
      poster: await image("media/hero-poster.jpg", ""),
      showreelLabel: "Play showreel",
      showreelMark: "Ghostsavvy / Showreel",
    },
    claim: { cover: positioning.cover, motto: positioning.motto },
    methodology: { heading: "Methodology", difference: positioning.difference },
    selectedWork: {
      tag: selectedWork.tag,
      projects: selectedWork.items.map((p) => ref(projectId_(p.slug))),
      action: workAction,
    },
    journal: {
      eyebrow: journal.eyebrow,
      heading: journal.heading,
      featured: {
        article: { _type: "reference", _ref: articleId(journal.featured.slug) },
        label: journal.featured.label,
        action: journal.featured.action,
        image: await image(journal.featured.image.src, journal.featured.image.alt),
      },
      entries: journal.entries.map((e) => ref(articleId(e.slug))),
    },
  });

  add("pointOfView", "pointOfView", pointOfView);
  add("process", "process", processSteps);
  add("services", "services", services);

  add("engagement", "engagement", {
    ...engagement,
    image: await image(engagement.image.src, engagement.image.alt),
  });

  add("sectors", "sectors", {
    eyebrow: sectors.eyebrow,
    items: await Promise.all(
      sectors.items.map(async ({ image: src, ...item }) => ({
        ...item,
        image: await image(src, ""),
      })),
    ),
  });

  add("testimonials", "testimonials", {
    ...testimonials,
    controls: {
      previous: "Prev",
      next: "Next",
      previousLabel: "Previous quote",
      nextLabel: "Next quote",
    },
  });

  add("studioStrip", "studioStrip", {
    label: studioStrip.label,
    tee: await image(studioStrip.tee.src, studioStrip.tee.alt),
    principle: studioStrip.principle,
    tote: await image(studioStrip.tote.src, studioStrip.tote.alt),
  });

  /* Pages */
  add("aboutPage", "aboutPage", {
    ...aboutPage,
    team: {
      ...aboutPage.team,
      members: await Promise.all(
        aboutPage.team.members.map(async ({ portrait, ...m }) => ({
          ...m,
          portrait: await image(portrait, ""),
        })),
      ),
    },
  });

  add("servicesPage", "servicesPage", servicesPage);

  /* Each audience is its own document: its card on /who-we-serve, and its
     page at /who-we-serve/[slug] where it has one. */
  for (const item of whoWeServePage.audiences.items) {
    const slug = audienceSlug(item);
    add(`audience-${slug}`, "audience", {
      ...item,
      slug: { _type: "slug", current: slug },
      ...(audiencePages[slug] ?? {}),
    });
  }
  add("whoWeServePage", "whoWeServePage", {
    ...whoWeServePage,
    audiences: {
      ...whoWeServePage.audiences,
      items: whoWeServePage.audiences.items.map((item) => ref(`audience-${audienceSlug(item)}`)),
    },
  });

  add("workPage", "workPage", {
    ...workPage,
    caseStudy: caseStudyLabels,
    projects: projects.map((p) => ref(projectId_(p.slug))),
  });

  add("insightsPage", "insightsPage", insightsPage);

  add("contactPage", "contactPage", {
    title: "Contact",
    description:
      "A clear brief, a rough idea or a problem that needs a name. Tell Ghost Savvy Studios what you are trying to solve.",
    ...contact,
    /* The address is the site's, in Site settings. */
    start: { label: contact.start.label, copy: contact.start.copy, copied: contact.start.copied },
  });

  const tracks: TrackPageData[] = [
    { ...buildPage, slug: "build", plate: { ...buildPage.plate, ground: "" } },
    engagePage,
    integratePage,
  ];
  for (const { plate, ...track } of tracks) {
    add(`trackPage-${track.slug}`, "trackPage", {
      ...track,
      plate: {
        image: await image(plate.src, plate.alt),
        ...(plate.ground ? { ground: plate.ground } : {}),
      },
    });
  }

  const family: FamilyPageData[] = [labsPage, ghostUPage, givesPage];
  for (const { href, cover, ...page } of family) {
    const slug = href.slice(1);
    add(`familyPage-${slug}`, "familyPage", {
      slug,
      ...page,
      cover: { ...cover, card: await image(cover.card.src, cover.card.alt) },
    });
  }

  /* Each family's stories: its archive's first cards, and their pages at
     /[family]/[slug]. No pictures yet: each plate is its colour. */
  for (const seed of stories) {
    add(storyId(seed), "familyStory", story(seed));
  }

  for (const document of Object.values(legalDocuments)) {
    add(`legalPage-${document.slug}`, "legalPage", {
      ...document,
      eyebrow: "Legal",
      updatedLabel: "Last updated",
      contentsLabel: "Contents",
    });
  }

  for (const { slug, ...phase } of approachPhases) {
    add(`phase-${slug}`, "phase", {
      ...phase,
      slug: { _type: "slug", current: slug },
      image: await image(null, ""),
    });
  }

  const { plate, phases, ...approach } = approachPage;
  add("approachPage", "approachPage", {
    ...approach,
    plate: { image: await image(plate.src, plate.alt), ground: plate.ground },
    phases: {
      ...phases,
      items: approachPhases.map((phase) => ref(`phase-${phase.slug}`)),
    },
  });

  return docs;
}

async function main() {
  console.log(`Seeding ${projectId}/${dataset}…`);
  const docs = await documents();
  if (dry) {
    console.log(JSON.stringify(docs, null, 2));
    return;
  }
  const tx = client.transaction();
  for (const doc of docs) tx.createOrReplace(doc as never);
  await tx.commit();
  console.log(`Wrote ${docs.length} documents.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
