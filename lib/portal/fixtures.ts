import type {
  Activity,
  Comment,
  FileRef,
  InboundEmail,
  Invoice,
  MeetingNote,
  Milestone,
  Org,
  Person,
  Project,
  ReviewItem,
  Thread,
} from "./types";

/**
 * The prototype's world: three clients, four projects, and enough history
 * on each that every screen has something true to show — work at every
 * stage, mail that came in, a balance that's late.
 *
 * Everything is dated around TODAY in format.ts (Saturday 10 October 2026).
 * None of these people or companies exist.
 */

/* -------------------------------------------------------------------------- */
/*  People                                                                    */
/* -------------------------------------------------------------------------- */

export const people: readonly Person[] = [
  { id: "p-kareem", name: "Kareem Jackson", email: "kareem@ghostsavvy.com", role: "studio", title: "Founder, creative director", status: "active", lastSeenAt: "2026-10-10T09:28:00Z" },
  { id: "p-ines", name: "Ines Duarte", email: "ines@ghostsavvy.com", role: "studio", title: "Design director", status: "active", lastSeenAt: "2026-10-09T18:40:00Z" },
  { id: "p-theo", name: "Theo Lindqvist", email: "theo@lindqvist.studio", role: "contractor", title: "Motion designer", status: "active", lastSeenAt: "2026-10-10T08:15:00Z", invitedAt: "2026-07-01T10:00:00Z" },
  { id: "p-priya", name: "Priya Raman", email: "priya@raman.dev", role: "contractor", title: "Front-end developer", status: "active", lastSeenAt: "2026-10-07T10:02:00Z", invitedAt: "2026-05-02T10:00:00Z" },
  { id: "p-dana", name: "Dana Whitfield", email: "dana@northwindcoffee.com", role: "client", title: "Head of brand", orgId: "org-northwind", status: "active", lastSeenAt: "2026-10-10T08:47:00Z", invitedAt: "2026-08-18T09:00:00Z" },
  { id: "p-marcus", name: "Marcus Bell", email: "marcus@northwindcoffee.com", role: "client", title: "Finance director", orgId: "org-northwind", status: "invited", invitedAt: "2026-10-06T11:05:00Z" },
  { id: "p-sofia", name: "Sofia Reyes", email: "sofia@halcyonhealth.com", role: "client", title: "VP, product", orgId: "org-halcyon", status: "active", lastSeenAt: "2026-10-08T19:31:00Z", invitedAt: "2026-07-06T09:00:00Z" },
  { id: "p-jon", name: "Jon Park", email: "jon@fieldwork.co", role: "client", title: "Founder", orgId: "org-fieldwork", status: "active", lastSeenAt: "2026-09-02T10:01:00Z", invitedAt: "2026-05-04T09:00:00Z" },
];

/** Who each role is when the prototype is viewed as it. */
export const personas = {
  studio: "p-kareem",
  client: "p-dana",
  contractor: "p-theo",
} as const;

/* -------------------------------------------------------------------------- */
/*  Clients and projects                                                      */
/* -------------------------------------------------------------------------- */

export const orgs: readonly Org[] = [
  {
    id: "org-northwind", name: "Northwind Coffee", slug: "northwind", domains: ["northwindcoffee.com"], colour: "#eedf4e",
    website: "northwindcoffee.com", since: "2026-08-18",
    note: "Forty-year-old roaster, six cafés. Dana runs brand; Marcus signs off spend. Packaging is next if the identity lands.",
  },
  {
    id: "org-halcyon", name: "Halcyon Health", slug: "halcyon", domains: ["halcyonhealth.com"], colour: "#8fa8f7",
    website: "halcyonhealth.com", since: "2026-07-06",
    note: "Clinic network, four sites. Every screen goes past their clinical team before Sofia signs.",
  },
  {
    id: "org-fieldwork", name: "Fieldwork", slug: "fieldwork", domains: ["fieldwork.co"], colour: "#63cdab",
    website: "fieldwork.co", since: "2026-05-04",
    note: "Outdoor gear start-up. Launch site shipped in August; Jon wants to talk about a second phase in the new year.",
  },
];

export const projects: readonly Project[] = [
  {
    id: "pr-nw-rebrand",
    orgId: "org-northwind",
    slug: "northwind-rebrand",
    code: "GS-014",
    name: "Northwind rebrand",
    summary: "A new identity for a forty-year-old roaster: the mark, type, colour, and the guidelines that hold them together.",
    status: "active",
    ground: "#f1e3c8",
    chip: "#eedf4e",
    startOn: "2026-08-18",
    targetOn: "2026-12-12",
    leadId: "p-kareem",
    members: [
      { personId: "p-kareem", role: "lead" },
      { personId: "p-ines", role: "studio" },
      { personId: "p-theo", role: "contractor" },
      { personId: "p-dana", role: "client" },
      { personId: "p-marcus", role: "client" },
    ],
  },
  {
    id: "pr-nw-pack",
    orgId: "org-northwind",
    slug: "northwind-packaging",
    code: "GS-018",
    name: "Packaging system",
    summary: "Bags, cups and cartons in the new identity, built as a system the roastery can extend on its own.",
    status: "proposal",
    ground: "#f3d9c4",
    chip: "#f2875f",
    startOn: "2026-11-02",
    targetOn: "2027-02-26",
    leadId: "p-ines",
    members: [
      { personId: "p-ines", role: "lead" },
      { personId: "p-kareem", role: "studio" },
      { personId: "p-dana", role: "client" },
      { personId: "p-marcus", role: "client" },
    ],
  },
  {
    id: "pr-hal-app",
    orgId: "org-halcyon",
    slug: "halcyon-patient-app",
    code: "GS-017",
    name: "Patient app",
    summary: "A calmer way to book, prepare for and follow up on care, from first appointment to results.",
    status: "active",
    ground: "#dfe7f2",
    chip: "#8fa8f7",
    startOn: "2026-07-06",
    targetOn: "2026-11-20",
    leadId: "p-kareem",
    members: [
      { personId: "p-kareem", role: "lead" },
      { personId: "p-ines", role: "studio" },
      { personId: "p-theo", role: "contractor" },
      { personId: "p-priya", role: "contractor" },
      { personId: "p-sofia", role: "client" },
    ],
  },
  {
    id: "pr-fw-site",
    orgId: "org-fieldwork",
    slug: "fieldwork-launch",
    code: "GS-012",
    name: "Launch site",
    summary: "The site Fieldwork launched on: story, product and a waitlist that filled in a week.",
    status: "complete",
    ground: "#d3e6e2",
    chip: "#63cdab",
    startOn: "2026-05-04",
    targetOn: "2026-08-28",
    leadId: "p-ines",
    members: [
      { personId: "p-ines", role: "lead" },
      { personId: "p-kareem", role: "studio" },
      { personId: "p-priya", role: "contractor" },
      { personId: "p-jon", role: "client" },
    ],
  },
];

export const milestones: readonly Milestone[] = [
  { id: "m-nw-1", projectId: "pr-nw-rebrand", position: 1, title: "Discovery", summary: "Interviews, audit and the brief we agreed on.", dueOn: "2026-08-29", status: "done", completedOn: "2026-08-28" },
  { id: "m-nw-2", projectId: "pr-nw-rebrand", position: 2, title: "Identity system", summary: "Mark, wordmark, colour and type.", dueOn: "2026-10-24", status: "in_progress" },
  { id: "m-nw-3", projectId: "pr-nw-rebrand", position: 3, title: "Guidelines", summary: "The book: rules, templates and files.", dueOn: "2026-11-13", status: "upcoming" },
  { id: "m-nw-4", projectId: "pr-nw-rebrand", position: 4, title: "Signage & merch", summary: "The roastery, the cafés and the shop.", dueOn: "2026-11-27", status: "upcoming" },
  { id: "m-nw-5", projectId: "pr-nw-rebrand", position: 5, title: "Launch", summary: "Rollout, handover and the reveal.", dueOn: "2026-12-12", status: "upcoming" },

  { id: "m-np-1", projectId: "pr-nw-pack", position: 1, title: "Proposal", summary: "Scope, timeline and fee.", dueOn: "2026-10-17", status: "in_review" },
  { id: "m-np-2", projectId: "pr-nw-pack", position: 2, title: "System design", summary: "The grid, the labels and the range.", dueOn: "2026-12-18", status: "upcoming" },
  { id: "m-np-3", projectId: "pr-nw-pack", position: 3, title: "Production files", summary: "Print-ready, with the printer.", dueOn: "2027-02-26", status: "upcoming" },

  { id: "m-ha-1", projectId: "pr-hal-app", position: 1, title: "Research", summary: "Twelve patients, four clinics.", dueOn: "2026-07-24", status: "done", completedOn: "2026-07-24" },
  { id: "m-ha-2", projectId: "pr-hal-app", position: 2, title: "Flows", summary: "Booking, preparation and results.", dueOn: "2026-08-28", status: "done", completedOn: "2026-09-01" },
  { id: "m-ha-3", projectId: "pr-hal-app", position: 3, title: "Visual design", summary: "Every screen, in the new system.", dueOn: "2026-10-16", status: "in_progress" },
  { id: "m-ha-4", projectId: "pr-hal-app", position: 4, title: "Build", summary: "The app, against the real APIs.", dueOn: "2026-11-06", status: "upcoming" },
  { id: "m-ha-5", projectId: "pr-hal-app", position: 5, title: "Release", summary: "Store review and the first patients.", dueOn: "2026-11-20", status: "upcoming" },

  { id: "m-fw-1", projectId: "pr-fw-site", position: 1, title: "Story", summary: "What Fieldwork is, in a page.", dueOn: "2026-05-29", status: "done", completedOn: "2026-05-28" },
  { id: "m-fw-2", projectId: "pr-fw-site", position: 2, title: "Design", summary: "Home, product and waitlist.", dueOn: "2026-07-03", status: "done", completedOn: "2026-07-02" },
  { id: "m-fw-3", projectId: "pr-fw-site", position: 3, title: "Build & launch", summary: "Live, measured and handed over.", dueOn: "2026-08-28", status: "done", completedOn: "2026-08-27" },
];

/* -------------------------------------------------------------------------- */
/*  Work in review                                                            */
/* -------------------------------------------------------------------------- */

const file = (id: string, name: string, src: string, size: number, mime = "image/svg+xml"): FileRef => ({
  id,
  name,
  src,
  size,
  mime,
  width: 1600,
  height: 1000,
});

const pin = (x: number, y: number) => ({ x, y });

const c = (
  id: string,
  authorId: string,
  at: string,
  body: string,
  extra: Partial<Omit<Comment, "id" | "authorId" | "at" | "body">> = {},
): Comment => ({ id, authorId, at, body, visibility: "client", ...extra });

export const reviewItems: readonly ReviewItem[] = [
  {
    id: "primary-logo",
    projectId: "pr-nw-rebrand",
    milestoneId: "m-nw-2",
    title: "Primary logo",
    summary: "The mark and wordmark, with a cut drawn for small sizes.",
    kind: "image",
    stage: "client_review",
    submittedBy: "p-ines",
    dueOn: "2026-10-14",
    versions: [
      {
        id: "v-logo-1",
        number: 1,
        note: "Three routes narrowed to one: a round mark with the N drawn from the roaster's drum.",
        createdBy: "p-ines",
        createdAt: "2026-09-12T15:00:00Z",
        sharedAt: "2026-09-15T09:00:00Z",
        files: [file("f-logo-1", "Primary lockup.svg", "/portal-demo/northwind-logo-v1.svg", 48_000)],
        comments: [
          c("c-l1-1", "p-dana", "2026-09-16T11:04:00Z", "It feels a little corporate. Could it be warmer?", { pin: pin(0.5, 0.42), resolved: true }),
        ],
        decisions: [
          { id: "d-l1-1", reviewerId: "p-kareem", stage: "internal", decision: "approved", at: "2026-09-14T17:00:00Z" },
          { id: "d-l1-2", reviewerId: "p-dana", stage: "client", decision: "changes_requested", reason: "Warmer, and less like a bank.", at: "2026-09-17T10:00:00Z" },
        ],
      },
      {
        id: "v-logo-2",
        number: 2,
        note: "Warmer: a filled mark, a softer N, and a lowercase wordmark.",
        createdBy: "p-ines",
        createdAt: "2026-09-26T14:00:00Z",
        sharedAt: "2026-09-29T09:00:00Z",
        files: [file("f-logo-2", "Primary lockup.svg", "/portal-demo/northwind-logo-v2.svg", 51_000)],
        comments: [
          c("c-l2-1", "p-dana", "2026-09-30T16:20:00Z", "Much closer. The N's counter closes up when it's small, though.", { pin: pin(0.256, 0.5), resolved: true }),
        ],
        decisions: [
          { id: "d-l2-1", reviewerId: "p-kareem", stage: "internal", decision: "approved", at: "2026-09-28T12:00:00Z" },
          { id: "d-l2-2", reviewerId: "p-dana", stage: "client", decision: "changes_requested", reason: "Open the N at small sizes.", at: "2026-10-01T09:30:00Z" },
        ],
      },
      {
        id: "v-logo-3",
        number: 3,
        note: "The N opened 8% with a shorter diagonal, and the bean set into the O. The second file is the cut for 24px and under.",
        createdBy: "p-ines",
        createdAt: "2026-10-07T16:00:00Z",
        sharedAt: "2026-10-08T09:00:00Z",
        files: [
          file("f-logo-3", "Primary lockup.svg", "/portal-demo/northwind-logo-v3.svg", 54_000),
          file("f-logo-3s", "Small sizes.svg", "/portal-demo/northwind-logo-v3-small.svg", 22_000),
        ],
        comments: [
          c("c-l3-1", "p-dana", "2026-10-09T10:12:00Z", "The counter reads at 16px now. Thank you.", {
            pin: pin(0.256, 0.5),
            replies: [
              c("c-l3-1r", "p-kareem", "2026-10-09T10:40:00Z", "Opened it 8% and shortened the diagonal. The small cut is the second file in this version."),
            ],
          }),
          c("c-l3-2", "p-dana", "2026-10-09T10:15:00Z", "Love the bean in the O. Keep it, whatever happens.", { pin: pin(0.484, 0.52) }),
          c("c-l3-3", "p-ines", "2026-10-08T16:02:00Z", "The w–i kern in the wordmark is still a hair tight. Fix before guidelines.", { pin: pin(0.7, 0.5), visibility: "internal" }),
        ],
        decisions: [
          { id: "d-l3-1", reviewerId: "p-kareem", stage: "internal", decision: "approved", at: "2026-10-08T08:40:00Z" },
        ],
      },
    ],
  },
  {
    id: "colour-and-type",
    projectId: "pr-nw-rebrand",
    milestoneId: "m-nw-2",
    title: "Colour & type",
    summary: "The palette, tested on cups and kraft, and the two typefaces.",
    kind: "image",
    stage: "changes_requested",
    submittedBy: "p-ines",
    dueOn: "2026-10-13",
    versions: [
      {
        id: "v-ct-1",
        number: 1,
        note: "Roast brown, crema, and a green from the original 1986 bags.",
        createdBy: "p-ines",
        createdAt: "2026-10-01T15:00:00Z",
        sharedAt: "2026-10-02T09:00:00Z",
        files: [
          file("f-ct-1", "Palette.svg", "/portal-demo/northwind-palette.svg", 31_000),
          file("f-ct-2", "Type.svg", "/portal-demo/northwind-type.svg", 44_000),
        ],
        comments: [
          c("c-ct-1", "p-dana", "2026-10-06T16:40:00Z", "Can the green go deeper? It looks minty on our cups.", { pin: pin(0.673, 0.5) }),
        ],
        decisions: [
          { id: "d-ct-1", reviewerId: "p-kareem", stage: "internal", decision: "approved", at: "2026-10-01T17:00:00Z" },
          { id: "d-ct-2", reviewerId: "p-dana", stage: "client", decision: "changes_requested", reason: "A deeper green, tested on kraft.", at: "2026-10-06T17:00:00Z" },
        ],
      },
    ],
  },
  {
    id: "logo-animation",
    projectId: "pr-nw-rebrand",
    milestoneId: "m-nw-2",
    title: "Logo animation",
    summary: "Six seconds: the bean drops, the mark turns, the wordmark arrives.",
    kind: "video",
    stage: "internal_review",
    submittedBy: "p-theo",
    dueOn: "2026-10-16",
    versions: [
      {
        id: "v-anim-1",
        number: 1,
        note: "6s at 24fps, with a sound-off cut. Storyboard frames attached.",
        createdBy: "p-theo",
        createdAt: "2026-10-09T12:10:00Z",
        files: [file("f-anim-1", "Storyboard.svg", "/portal-demo/northwind-motion.svg", 63_000)],
        comments: [
          c("c-an-1", "p-kareem", "2026-10-09T14:00:00Z", "Lovely ease on the bean. Slow the wordmark by about four frames and it's ready for Dana.", { pin: pin(0.85, 0.5), visibility: "internal" }),
        ],
        decisions: [],
      },
    ],
  },
  {
    id: "photography-direction",
    projectId: "pr-nw-rebrand",
    milestoneId: "m-nw-1",
    title: "Photography direction",
    summary: "Close, warm and honest: the roastery as it is at six in the morning.",
    kind: "image",
    stage: "approved",
    submittedBy: "p-ines",
    versions: [
      {
        id: "v-ph-1",
        number: 1,
        note: "Twelve references and three rules.",
        createdBy: "p-ines",
        createdAt: "2026-09-03T12:00:00Z",
        sharedAt: "2026-09-04T09:00:00Z",
        files: [file("f-ph-1", "Mood.svg", "/portal-demo/northwind-mood.svg", 38_000)],
        comments: [],
        decisions: [
          { id: "d-ph-1", reviewerId: "p-kareem", stage: "internal", decision: "approved", at: "2026-09-03T17:00:00Z" },
          { id: "d-ph-2", reviewerId: "p-dana", stage: "client", decision: "approved", at: "2026-09-08T10:00:00Z" },
        ],
      },
    ],
  },
  {
    id: "onboarding-flow",
    projectId: "pr-hal-app",
    milestoneId: "m-ha-3",
    title: "Onboarding flow",
    summary: "Welcome, consent and the first booking, in four screens.",
    kind: "image",
    stage: "client_review",
    submittedBy: "p-ines",
    dueOn: "2026-10-13",
    versions: [
      {
        id: "v-ob-1",
        number: 1,
        note: "Six screens.",
        createdBy: "p-ines",
        createdAt: "2026-09-21T12:00:00Z",
        sharedAt: "2026-09-22T09:00:00Z",
        files: [file("f-ob-1", "Onboarding.svg", "/portal-demo/halcyon-onboarding.svg", 72_000)],
        comments: [c("c-ob-1", "p-sofia", "2026-09-24T13:00:00Z", "Can consent be one screen, not two?", { pin: pin(0.384, 0.45), resolved: true })],
        decisions: [{ id: "d-ob-1", reviewerId: "p-sofia", stage: "client", decision: "changes_requested", reason: "Merge the consent screens.", at: "2026-09-25T09:00:00Z" }],
      },
      {
        id: "v-ob-2",
        number: 2,
        note: "Four screens: consent is one, and booking starts sooner.",
        createdBy: "p-ines",
        createdAt: "2026-10-05T16:00:00Z",
        sharedAt: "2026-10-06T09:00:00Z",
        files: [file("f-ob-2", "Onboarding.svg", "/portal-demo/halcyon-onboarding.svg", 70_000)],
        comments: [],
        decisions: [{ id: "d-ob-2", reviewerId: "p-kareem", stage: "internal", decision: "approved", at: "2026-10-05T18:00:00Z" }],
      },
    ],
  },
  {
    id: "design-tokens",
    projectId: "pr-hal-app",
    milestoneId: "m-ha-3",
    title: "Design tokens",
    summary: "Colour, type and spacing as code, for the build.",
    kind: "document",
    stage: "internal_changes",
    submittedBy: "p-priya",
    versions: [
      {
        id: "v-tk-1",
        number: 1,
        note: "First pass, exported from the library.",
        createdBy: "p-priya",
        createdAt: "2026-10-07T10:00:00Z",
        files: [file("f-tk-1", "Tokens.svg", "/portal-demo/halcyon-tokens.svg", 18_000)],
        comments: [c("c-tk-1", "p-ines", "2026-10-07T15:00:00Z", "The spacing scale skips 12. Add it back before the build starts.", { visibility: "internal" })],
        decisions: [{ id: "d-tk-1", reviewerId: "p-ines", stage: "internal", decision: "changes_requested", reason: "Spacing scale is missing 12.", at: "2026-10-07T15:05:00Z" }],
      },
    ],
  },
  {
    id: "homepage",
    projectId: "pr-fw-site",
    milestoneId: "m-fw-2",
    title: "Homepage",
    summary: "The page Fieldwork launched on.",
    kind: "image",
    stage: "approved",
    submittedBy: "p-ines",
    versions: [
      {
        id: "v-hp-1",
        number: 1,
        note: "Final.",
        createdBy: "p-ines",
        createdAt: "2026-06-30T12:00:00Z",
        sharedAt: "2026-06-30T15:00:00Z",
        files: [file("f-hp-1", "Homepage.svg", "/portal-demo/northwind-mood.svg", 40_000)],
        comments: [],
        decisions: [{ id: "d-hp-1", reviewerId: "p-jon", stage: "client", decision: "approved", at: "2026-07-02T10:00:00Z" }],
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  Conversations                                                             */
/* -------------------------------------------------------------------------- */

export const threads: readonly Thread[] = [
  {
    id: "t-nw-client",
    projectId: "pr-nw-rebrand",
    kind: "client",
    messages: [
      { id: "m1", authorId: "p-kareem", at: "2026-10-06T11:02:00Z", source: "portal", body: "Invoice INV-0142 for the identity milestone is up in Payments. Thank you both." },
      { id: "m2", authorId: "p-dana", at: "2026-10-06T16:44:00Z", source: "portal", body: "Left a note on Colour & type: the green reads minty on our cups. Otherwise we love where it's going." },
      { id: "m3", authorId: "p-kareem", at: "2026-10-07T17:20:00Z", source: "portal", body: "Primary logo v03 is up. We opened the N for small sizes and kept the bean. Two files in this version; the second is the small cut." },
      { id: "m4", authorId: "p-dana", at: "2026-10-08T08:05:00Z", source: "email", subject: "Re: Primary logo v03 is ready for review", body: "Thanks Kareem. Sharing it with Jen (our CEO) this morning. We should have a decision by Tuesday." },
      { id: "m5", authorId: "p-ines", at: "2026-10-08T08:31:00Z", source: "portal", body: "Perfect. If it helps, we're happy to walk Jen through it on a fifteen-minute call." },
      { id: "m6", authorId: "p-dana", at: "2026-10-09T10:20:00Z", source: "portal", body: "Left a couple of pins on v03. Jen loves the bean." },
      {
        id: "m7",
        authorId: "p-kareem",
        at: "2026-10-09T15:02:00Z",
        source: "portal",
        body: "Noted on both. Colour & type v02 lands Monday with the deeper green, tested on kraft. Early swatches attached.",
        attachments: [file("a-m7", "Kraft swatches.svg", "/portal-demo/northwind-palette.svg", 31_000)],
      },
      { id: "m8", authorId: "p-dana", at: "2026-10-10T08:47:00Z", source: "email", subject: "Re: Invoice INV-0142", body: "Marcus has the invoice. It's in Monday's payment run." },
    ],
  },
  {
    id: "t-nw-internal",
    projectId: "pr-nw-rebrand",
    kind: "internal",
    messages: [
      { id: "i1", authorId: "p-theo", at: "2026-10-09T12:10:00Z", source: "portal", body: "Logo animation v01 is in for review. 6s at 24fps, plus a sound-off cut." },
      { id: "i2", authorId: "p-kareem", at: "2026-10-09T14:00:00Z", source: "portal", body: "Lovely ease on the bean. Slow the wordmark reveal by about four frames and we'll send it to Dana." },
      { id: "i3", authorId: "p-ines", at: "2026-10-09T14:12:00Z", source: "portal", body: "Agree. The w–i kern fix is in the master files now, so pull from there." },
      { id: "i4", authorId: "p-theo", at: "2026-10-10T08:15:00Z", source: "portal", body: "On it. v02 by Monday lunch." },
    ],
  },
  {
    id: "t-hal-client",
    projectId: "pr-hal-app",
    kind: "client",
    messages: [
      { id: "h1", authorId: "p-kareem", at: "2026-10-06T09:10:00Z", source: "portal", body: "Onboarding v02 is ready: consent is one screen now, and booking starts sooner." },
      { id: "h2", authorId: "p-sofia", at: "2026-10-08T19:30:00Z", source: "email", subject: "Re: Onboarding v02 is ready for review", body: "Looks great on my phone. Taking it to clinical on Monday before we sign off." },
      { id: "h3", authorId: "p-kareem", at: "2026-10-09T09:00:00Z", source: "portal", body: "A gentle note that INV-0136 has a balance of $8,000 outstanding. No rush on the review." },
    ],
  },
  {
    id: "t-hal-internal",
    projectId: "pr-hal-app",
    kind: "internal",
    messages: [
      { id: "hi1", authorId: "p-priya", at: "2026-10-07T10:02:00Z", source: "portal", body: "Tokens v01 are in. Exported straight from the library." },
      { id: "hi2", authorId: "p-ines", at: "2026-10-07T15:06:00Z", source: "portal", body: "Close. The spacing scale skips 12; add it back and we're good." },
    ],
  },
  {
    id: "t-fw-client",
    projectId: "pr-fw-site",
    kind: "client",
    messages: [
      { id: "f1", authorId: "p-jon", at: "2026-09-02T10:00:00Z", source: "email", subject: "Waitlist", body: "We hit 4,000 on the waitlist this morning. Thank you all." },
      { id: "f2", authorId: "p-ines", at: "2026-09-02T10:30:00Z", source: "portal", body: "That's wonderful. Congratulations, Jon." },
    ],
  },
];

/** When each person last read each thread: what's after it is unread. */
export const reads: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  "p-dana": { "t-nw-client": "2026-10-09T10:20:00Z" },
  "p-kareem": { "t-nw-client": "2026-10-09T15:02:00Z", "t-nw-internal": "2026-10-09T14:12:00Z", "t-hal-client": "2026-10-08T12:00:00Z", "t-hal-internal": "2026-10-07T15:06:00Z", "t-fw-client": "2026-09-02T10:30:00Z" },
  "p-theo": { "t-nw-internal": "2026-10-09T14:00:00Z", "t-hal-internal": "2026-10-07T15:06:00Z" },
};

/* -------------------------------------------------------------------------- */
/*  Money                                                                     */
/* -------------------------------------------------------------------------- */

export const invoices: readonly Invoice[] = [
  {
    id: "inv-0138", direction: "receivable", number: "INV-0138", projectId: "pr-nw-rebrand", orgId: "org-northwind", milestoneId: "m-nw-1",
    label: "Deposit, 40%", amount: 1_200_000, currency: "USD", issuedOn: "2026-08-18", dueOn: "2026-09-01", status: "paid",
    payments: [{ id: "pay-1", amount: 1_200_000, paidOn: "2026-08-29", method: "wire" }],
  },
  {
    id: "inv-0142", direction: "receivable", number: "INV-0142", projectId: "pr-nw-rebrand", orgId: "org-northwind", milestoneId: "m-nw-2",
    label: "Identity system", amount: 950_000, currency: "USD", issuedOn: "2026-10-06", dueOn: "2026-10-20", status: "sent", payments: [],
  },
  {
    id: "inv-0136", direction: "receivable", number: "INV-0136", projectId: "pr-hal-app", orgId: "org-halcyon", milestoneId: "m-ha-2",
    label: "Flows", amount: 1_800_000, currency: "USD", issuedOn: "2026-09-01", dueOn: "2026-10-01", status: "partially_paid",
    payments: [{ id: "pay-2", amount: 1_000_000, paidOn: "2026-09-30", method: "ach" }],
  },
  {
    id: "inv-0131", direction: "receivable", number: "INV-0131", projectId: "pr-fw-site", orgId: "org-fieldwork", milestoneId: "m-fw-3",
    label: "Final, 30%", amount: 840_000, currency: "USD", issuedOn: "2026-08-28", dueOn: "2026-09-11", status: "paid",
    payments: [{ id: "pay-3", amount: 840_000, paidOn: "2026-09-08", method: "wire" }],
  },
  {
    id: "inv-tl-022", direction: "payable", number: "TL-022", projectId: "pr-nw-rebrand", contractorId: "p-theo",
    label: "Logo animation", amount: 320_000, currency: "USD", issuedOn: "2026-10-09", dueOn: "2026-10-23", status: "sent", payments: [],
  },
  {
    id: "inv-pr-009", direction: "payable", number: "PR-009", projectId: "pr-fw-site", contractorId: "p-priya",
    label: "Launch build", amount: 480_000, currency: "USD", issuedOn: "2026-08-29", dueOn: "2026-09-12", status: "paid",
    payments: [{ id: "pay-4", amount: 480_000, paidOn: "2026-09-10", method: "ach" }],
  },
];

/* -------------------------------------------------------------------------- */
/*  What happened                                                             */
/* -------------------------------------------------------------------------- */

const everyone = ["client", "contractor"] as const;
const team = ["contractor"] as const;
const clientOnly = ["client"] as const;

export const activity: readonly Activity[] = [
  { id: "a1", projectId: "pr-nw-rebrand", actorId: "p-dana", verb: "replied by email to", object: "Invoice INV-0142", at: "2026-10-10T08:47:00Z", audience: clientOnly },
  { id: "a2", projectId: "pr-nw-rebrand", actorId: "p-theo", verb: "submitted", object: "Logo animation v01", at: "2026-10-09T12:10:00Z", audience: team },
  { id: "a3", projectId: "pr-nw-rebrand", actorId: "p-dana", verb: "pinned two comments on", object: "Primary logo v03", at: "2026-10-09T10:15:00Z", audience: everyone },
  { id: "a4", projectId: "pr-nw-rebrand", actorId: "p-kareem", verb: "sent", object: "Primary logo v03", at: "2026-10-08T09:00:00Z", audience: everyone },
  { id: "a5", projectId: "pr-nw-rebrand", actorId: "p-dana", verb: "requested changes on", object: "Colour & type v01", at: "2026-10-06T17:00:00Z", audience: everyone },
  { id: "a6", projectId: "pr-nw-rebrand", actorId: "p-kareem", verb: "issued", object: "Invoice INV-0142", at: "2026-10-06T11:00:00Z", audience: clientOnly },
  { id: "a7", projectId: "pr-nw-rebrand", actorId: "p-kareem", verb: "completed", object: "Milestone 01, Discovery", at: "2026-08-28T16:00:00Z", audience: everyone },
  { id: "a8", projectId: "pr-hal-app", actorId: "p-sofia", verb: "replied by email about", object: "Onboarding v02", at: "2026-10-08T19:30:00Z", audience: clientOnly },
  { id: "a9", projectId: "pr-hal-app", actorId: "p-ines", verb: "requested changes on", object: "Design tokens v01", at: "2026-10-07T15:05:00Z", audience: team },
  { id: "a10", projectId: "pr-hal-app", actorId: "p-kareem", verb: "sent", object: "Onboarding v02", at: "2026-10-06T09:00:00Z", audience: everyone },
  { id: "a11", projectId: "pr-fw-site", actorId: "p-jon", verb: "approved", object: "Homepage v01", at: "2026-07-02T10:00:00Z", audience: everyone },
];

/* -------------------------------------------------------------------------- */
/*  Mail without a home                                                       */
/* -------------------------------------------------------------------------- */

export const inbox: readonly InboundEmail[] = [
  {
    id: "e1", fromName: "Jen Alvarez", fromEmail: "jen@northwindcoffee.com", subject: "Logo — one thought before Tuesday",
    snippet: "Dana forwarded v03. I love it. One question about how the mark sits on the cups…", at: "2026-10-10T07:52:00Z", guessOrgId: "org-northwind",
  },
  {
    id: "e2", fromName: "Halcyon Accounts", fromEmail: "accounts@halcyonhealth.com", subject: "Remittance advice — INV-0136",
    snippet: "Please find attached remittance for the balance of $8,000, scheduled for 14 October.", at: "2026-10-09T16:20:00Z", guessOrgId: "org-halcyon", attachments: 1,
  },
  {
    id: "e3", fromName: "Ama Owusu", fromEmail: "ama@kinfolkbakery.com", subject: "Website and packaging for a new bakery",
    snippet: "We're opening our second location in March and would love to talk about a refresh.", at: "2026-10-08T12:04:00Z",
  },
];

/* -------------------------------------------------------------------------- */
/*  Meeting notes                                                             */
/* -------------------------------------------------------------------------- */

export const notes: readonly MeetingNote[] = [
  {
    id: "identity-review-with-jen",
    projectId: "pr-nw-rebrand",
    title: "Identity review with Jen",
    metOn: "2026-10-08",
    attendeeIds: ["p-kareem", "p-ines", "p-dana"],
    guests: ["Jen Alvarez, CEO"],
    visibility: "shared",
    createdBy: "p-ines",
    updatedAt: "2026-10-08T17:10:00Z",
    body: `Jen saw the identity for the first time. Forty minutes, mostly on the mark.

## What we agreed
- The bean in the O stays. Jen called it "the first thing that felt like us".
- The N opens up for small sizes; v03 already does this.
- The green goes deeper. We'll test it on kraft before anyone signs off.

## Still open
- Whether the wordmark is ever used without the mark. Jen leans no; Dana wants it for the cups.
- Timing for packaging. Marcus to confirm budget before we quote.`,
    actions: [
      { id: "a1", text: "Open the N's counter for 24px and under", assigneeId: "p-ines", done: true },
      { id: "a2", text: "Test the deeper green on kraft and cups", assigneeId: "p-ines", dueOn: "2026-10-12", done: false },
      { id: "a3", text: "Share v03 with Jen and collect her notes", assigneeId: "p-dana", done: true },
      { id: "a4", text: "Confirm packaging budget with Marcus", assigneeId: "p-dana", dueOn: "2026-10-16", done: false },
      { id: "a5", text: "Book the packaging kickoff", assigneeId: "p-kareem", dueOn: "2026-10-20", done: false },
    ],
  },
  {
    id: "packaging-fee",
    projectId: "pr-nw-rebrand",
    title: "Packaging fee and staffing",
    metOn: "2026-10-07",
    attendeeIds: ["p-kareem", "p-ines"],
    guests: [],
    visibility: "internal",
    createdBy: "p-kareem",
    updatedAt: "2026-10-07T12:30:00Z",
    body: `How we'd staff and price the packaging system if Northwind says yes.

## Shape
- Ines leads; Theo on the motion for the shelf screens.
- Twelve weeks, three milestones: system, range, production files.

## Fee
- Quote $38k, with the printer's proofs billed at cost.
- Hold the identity rate; don't discount the system work.`,
    actions: [
      { id: "b1", text: "Draft the packaging proposal", assigneeId: "p-ines", dueOn: "2026-10-15", done: false },
      { id: "b2", text: "Check Theo's availability for December", assigneeId: "p-kareem", done: true },
    ],
  },
  {
    id: "kickoff-workshop",
    projectId: "pr-nw-rebrand",
    title: "Kickoff workshop",
    metOn: "2026-08-20",
    attendeeIds: ["p-kareem", "p-ines", "p-dana", "p-marcus"],
    guests: [],
    visibility: "shared",
    createdBy: "p-kareem",
    updatedAt: "2026-08-21T09:00:00Z",
    body: `Half a day at the roastery. We walked the floor at six, then sat down with coffee and the old bags.

## What Northwind is
- Forty years of roasting, six cafés, a wholesale list that's grown faster than the brand.
- The 1986 bags are loved; nothing since has been.

## What success looks like
- A mark that works on a cup lid and a delivery van.
- Guidelines the café managers will actually open.`,
    actions: [
      { id: "c1", text: "Send interview notes", assigneeId: "p-ines", done: true },
      { id: "c2", text: "Share the brand audit", assigneeId: "p-kareem", done: true },
    ],
  },
  {
    id: "clinical-review-prep",
    projectId: "pr-hal-app",
    title: "Clinical review prep",
    metOn: "2026-10-02",
    attendeeIds: ["p-kareem", "p-sofia"],
    guests: ["Dr. Amir Haddad"],
    visibility: "shared",
    createdBy: "p-kareem",
    updatedAt: "2026-10-02T16:00:00Z",
    body: `What clinical will look for when they see onboarding v02.

## Their questions
- Is consent clear enough to stand on its own?
- Can a patient back out of booking without losing what they entered?`,
    actions: [
      { id: "d1", text: "Merge the consent screens", assigneeId: "p-ines", done: true },
      { id: "d2", text: "Take v02 to clinical", assigneeId: "p-sofia", dueOn: "2026-10-12", done: false },
    ],
  },
  {
    id: "build-plan",
    projectId: "pr-hal-app",
    title: "Build plan with Priya",
    metOn: "2026-10-05",
    attendeeIds: ["p-kareem", "p-ines", "p-priya"],
    guests: [],
    visibility: "internal",
    createdBy: "p-ines",
    updatedAt: "2026-10-05T15:00:00Z",
    body: `Getting from design to a build that clinical can test in November.

## Order
- Tokens first, then booking, then results.
- Weekly builds on Thursdays.`,
    actions: [
      { id: "e1", text: "Ship tokens v02 with the 12 step", assigneeId: "p-priya", dueOn: "2026-10-13", done: false },
      { id: "e2", text: "Set up the Thursday build", assigneeId: "p-priya", done: false },
    ],
  },
];
