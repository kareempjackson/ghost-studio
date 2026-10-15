/**
 * Ghost Savvy Studios — sub-portfolios: one part of a larger project, told
 * in full as a case study of its own. Each keeps its own card on /work and
 * its own page, and is linked to the project it is part of.
 *
 * Seeded as drafts by `npm run seed:drafts` (sanity/seed/drafts.ts), for an
 * editor to finish and publish. Everything written here is taken from what
 * the larger project's case study already says. What only the team knows —
 * counts, systems, dates, outcomes, a quote — is left in square brackets,
 * beginning "Add:". Fill each one in, or cut it, before publishing.
 */

import type { CaseStudySeed, PlateSeed, Project } from "./work";

export interface SubPortfolioSeed
  extends Omit<Project, "image">,
    Omit<CaseStudySeed, "chapters" | "testimonial"> {
  /** The slug of the project this is one part of. */
  readonly parent: string;
  readonly description: string;
  /** A case study's parts, each able to name its own list. */
  readonly chapters: readonly (CaseStudySeed["chapters"][number] & { readonly listHeading?: string })[];
}

const plate = (ground: string, aspect: PlateSeed["aspect"] = "landscape"): PlateSeed => ({
  ground,
  aspect,
});

/** BPI's own colours, as its case study sets them. */
const BPI = { deep: "#013330", forest: "#132a28", mist: "#e4e4e4", stone: "#d8d4cf", pale: "#dfe7e5" };

export const subPortfolios: readonly SubPortfolioSeed[] = [
  {
    parent: "barbados-pharmaceutical",
    slug: "bpi-infrastructure",
    name: "BPI: Infrastructure and security",
    scope: "IT and security",
    tagline: "A shared working environment behind the public presence.",
    location: "Barbados",
    sector: "Pharmaceuticals",
    disciplines: ["Systems"],
    ground: BPI.pale,
    description:
      "How Ghost Savvy Studios built Barbados Pharmaceutical Inc.’s Microsoft 365 environment: the tenant, the email migration, identity and access, document structure and connected project tracking.",

    hero: plate(BPI.deep, "wide"),
    headline: "One secure working environment for a business that operates across three continents.",
    facts: [
      { label: "Client", value: "Barbados Pharmaceutical Inc." },
      { label: "Location", value: "Bridgetown, Barbados" },
      { label: "Partnership", value: "Integrate, within BPI’s wider Engage + Integrate engagement" },
      { label: "Platforms", value: "Microsoft 365, Exchange Online, Entra ID, SharePoint and Monday.com" },
      {
        label: "Scope",
        value:
          "Tenant setup, email migration, identity and access, information architecture, workflow integration and email signatures",
      },
      { label: "People", value: "[Add: how many staff and mailboxes the environment serves]" },
      { label: "Timeline", value: "[Add: when the work ran, e.g. March–June 2026]" },
    ],
    tags: ["Microsoft 365", "Security", "Integration"],
    overview: [
      "BPI manufactures and distributes essential medicines from Barbados into the Caribbean, Latin America and Africa. As its brand and website were rebuilt for that international role, the systems its team worked in every day needed the same attention.",
      "The organisation had no unified Microsoft 365 environment, no clear structure for its business documents and no established controls over who could reach what, or from where. [Add: what that meant day to day — where documents lived, how email was run, what the team worked around.]",
      "Within the wider BPI engagement, we built the environment from the ground up: a new tenant, mail moved across without interrupting the business, access policies suited to a team that travels, a document structure people could find their way around, and project tracking connected to the way the team already worked.",
    ],
    feature: plate(BPI.forest),
    chapters: [
      {
        label: "Starting point",
        heading: "A growing business, working without a shared foundation.",
        body: [
          "BPI’s distribution partnerships and regulatory relationships were expanding across three continents. Its public presence was being rebuilt to match. Behind it, the team was working without a common environment for email, documents or access.",
          "Before changing anything, we mapped how the business actually worked: who needed what, where information lived, and where the risks were. [Add: anything the audit turned up — shared accounts, personal mailboxes, devices, licences.]",
        ],
        listHeading: "What we found",
        items: [
          { text: "No single Microsoft 365 environment for the organisation." },
          { text: "Business documents without a shared structure or clear ownership." },
          { text: "No established access controls or multi-factor authentication." },
          { text: "[Add: any other finding from the audit, or cut this line.]" },
        ],
        media: [[plate(BPI.mist, "wide")]],
      },
      {
        label: "Tenant and email",
        heading: "A new home for the business, and its mail moved in without a gap.",
        body: [
          "We provisioned a new Microsoft 365 tenant and set up the organisation’s working environment inside it, then moved the team’s mailboxes across while mail kept flowing.",
          "[Add: the system the mail came from, how many mailboxes moved, and how the cutover was run — e.g. staged over a weekend, with mail routing switched last.]",
          "The leadership team’s email was given the same care as the rest of the brand: adaptive HTML signatures that hold up in light and dark mail clients.",
        ],
        listHeading: "What we set up",
        items: [
          { lead: "Microsoft 365 tenant", text: "Provisioned and configured for the organisation. [Add: domains, licences and admin roles.]" },
          { lead: "Email migration", text: "Moved mailboxes into the new tenant while maintaining continuity through the transition." },
          { lead: "Email identity", text: "Adaptive HTML signatures across the leadership team, supporting light and dark modes." },
        ],
        media: [[plate(BPI.forest, "portrait"), plate(BPI.stone, "portrait")]],
      },
      {
        label: "Identity and access",
        heading: "Secure by default, for a team that travels.",
        body: [
          "A business working with regulators and distribution partners across three continents needs its people to reach their work from anywhere, and nobody else to reach it at all. We built access around identity rather than location, with rules for the travel BPI’s work involves.",
          "[Add: how the policies were rolled out and how staff were brought onto multi-factor authentication.]",
        ],
        listHeading: "What we configured",
        items: [
          { lead: "Conditional Access", text: "Policies that decide access by who is signing in, from what, and from where." },
          { lead: "Travel access", text: "Rules that let staff work securely while abroad, without opening the door to everyone else." },
          { lead: "Multi-factor authentication", text: "Configured for the organisation’s accounts. [Add: who it covers, and the method used, e.g. Microsoft Authenticator.]" },
          { lead: "Identity rules", text: "[Add: what the identity rules govern, e.g. account types, roles or guest access.]" },
        ],
        media: [[plate(BPI.deep, "wide")]],
      },
      {
        label: "Documents",
        heading: "A place for every document, and a way to find it.",
        body: [
          "We built a SharePoint information architecture around how BPI’s business is organised, so its documents have a clear place and people can find them. [Add: how ownership and permissions were set.]",
          "[Add: the sites or libraries created, e.g. by department, and how existing files were moved in.]",
        ],
        listHeading: "What we built",
        items: [
          { lead: "Information architecture", text: "A SharePoint structure that gives business documents a clear place." },
          { lead: "Permissions", text: "[Add: how access to documents was set, e.g. by team and role, and any confidential areas such as regulatory files.]" },
          { lead: "[Add: migration]", text: "[Add: how existing documents were brought in, or cut this line.]" },
        ],
        media: [[plate(BPI.mist), plate(BPI.pale)]],
      },
      {
        label: "Workflows",
        heading: "Project tracking that follows the way the team works.",
        body: [
          "Rather than ask the team to change how it worked, we connected Monday.com to the way the business already ran, so projects are tracked where the work happens.",
          "[Add: what Monday.com was connected to — e.g. Microsoft 365 sign-in, email or SharePoint — and any automations that removed manual steps.]",
        ],
        listHeading: "What we connected",
        items: [
          { lead: "Project tracking", text: "Monday.com integrated with the way the business worked." },
          { lead: "[Add: automation]", text: "[Add: a repetitive task the integration took off the team’s hands, or cut this line.]" },
        ],
        media: [[plate(BPI.stone, "wide")]],
      },
      {
        label: "Outcome",
        heading: "A foundation the team can run, and build on.",
        body: [
          "BPI now works in one environment: email, documents and access managed together, secured for a team that operates across borders, and connected to the tools it uses every day. The internal systems match the public presence they sit behind.",
          "[Add: what changed in practice — time saved, incidents avoided, how the team describes working now — and any ongoing support, e.g. Ghost Savvy managed services.]",
        ],
        listHeading: "What BPI has now",
        items: [
          { text: "A new Microsoft 365 environment with email, document management and access controls." },
          { text: "Conditional Access policies and multi-factor authentication in place." },
          { text: "A document structure that gives business documents a clear place." },
          { text: "Project tracking connected to the way the team works." },
          { text: "Consistent leadership email signatures in light and dark modes." },
        ],
        media: [],
      },
    ],
  },
];
