import "server-only";
import * as db from "./fixtures";
import { TODAY, daysUntil, money, pad } from "./format";
import { CLIENT_STAGES, waitsOn } from "./stage";
import type {
  Activity,
  Comment,
  Invoice,
  MeetingNote,
  Message,
  Milestone,
  Org,
  Person,
  Project,
  ReviewItem,
  Stage,
  Thread,
  Version,
  Viewer,
} from "./types";

/**
 * Everything the portal's screens read, filtered by who is looking.
 *
 * The prototype answers from fixtures.ts. With the backend, each getter
 * becomes a Supabase query under row-level security, and the filters here
 * are what those policies have to enforce: a client sees their own projects
 * and only work that has been sent to them; a contractor sees the projects
 * they're on, never the client's thread or money; the studio sees it all.
 *
 * Async throughout, because the real thing will be.
 */

/* -------------------------------------------------------------------------- */
/*  Shapes the screens get                                                    */
/* -------------------------------------------------------------------------- */

export interface ProjectView {
  readonly project: Project;
  readonly org: Org;
  readonly lead: Person;
  readonly team: readonly { readonly person: Person; readonly role: Project["members"][number]["role"] }[];
  readonly milestones: readonly Milestone[];
}

export interface ProjectCard {
  readonly project: Project;
  readonly org: Org;
  readonly next?: Milestone;
  readonly milestoneCount: number;
  /** How many milestones are done. */
  readonly done: number;
  /** Work waiting on the viewer in this project. */
  readonly waiting: number;
}

/** A piece of work as a list shows it. */
export interface ItemCard {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly stage: Stage;
  readonly version: number;
  readonly thumb?: string;
  readonly dueOn?: string;
  readonly milestone?: string;
  readonly href: string;
  readonly project: Pick<Project, "code" | "name" | "slug" | "chip" | "ground">;
  readonly submittedBy: Person;
  /** The viewer submitted it: its revisions are theirs. */
  readonly mine: boolean;
  readonly openComments: number;
}

/** Who owes what next on a project. */
export interface Awaiting {
  readonly id: string;
  readonly who: string;
  readonly what: string;
  readonly kind: "Approval" | "Studio review" | "Revision" | "Payment";
  readonly href: string;
  readonly dueOn?: string;
  /** It's the viewer who owes it. */
  readonly you: boolean;
}

export interface MoneySummary {
  readonly total: number;
  readonly paid: number;
  readonly outstanding: number;
  readonly overdue: number;
  /** The next unpaid invoice, soonest due first. */
  readonly next?: Invoice & { readonly balance: number };
}

export interface ThreadSummary {
  readonly id: string;
  readonly kind: Thread["kind"];
  readonly project: Pick<Project, "code" | "name" | "slug" | "chip">;
  readonly org: string;
  readonly last: Message;
  readonly lastAuthor: Person;
  readonly unread: number;
}

/* -------------------------------------------------------------------------- */
/*  Lookups and rules                                                         */
/* -------------------------------------------------------------------------- */

const personById = new Map(db.people.map((p) => [p.id, p]));
export const person = (id: string) => personById.get(id)!;
const orgById = new Map(db.orgs.map((o) => [o.id, o]));

const isMember = (viewer: Viewer, project: Project) =>
  project.members.some((m) => m.personId === viewer.person.id);

const canSeeProject = (viewer: Viewer, project: Project) =>
  viewer.role === "studio" || isMember(viewer, project);

const canSeeItem = (viewer: Viewer, item: ReviewItem) =>
  viewer.role !== "client" || CLIENT_STAGES.includes(item.stage);

const canSeeThread = (viewer: Viewer, thread: Thread) =>
  viewer.role === "studio" ||
  (viewer.role === "client" ? thread.kind === "client" : thread.kind === "internal");

const canSeeInvoice = (viewer: Viewer, invoice: Invoice) => {
  if (viewer.role === "studio") return true;
  if (viewer.role === "client") return invoice.direction === "receivable" && invoice.orgId === viewer.person.orgId;
  return invoice.direction === "payable" && invoice.contractorId === viewer.person.id;
};

/** Internal notes never reach the client, replies included. */
function visibleComments(viewer: Viewer, comments: readonly Comment[]): Comment[] {
  return comments
    .filter((c) => viewer.role !== "client" || c.visibility === "client")
    .map((c) => (c.replies ? { ...c, replies: visibleComments(viewer, c.replies) } : c));
}

/** The client sees only versions that were sent to them. */
function visibleVersions(viewer: Viewer, item: ReviewItem): Version[] {
  return item.versions
    .filter((v) => viewer.role !== "client" || v.sharedAt)
    .map((v) => ({
      ...v,
      comments: visibleComments(viewer, v.comments),
      decisions: viewer.role === "client" ? v.decisions.filter((d) => d.stage === "client") : v.decisions,
    }));
}

const projectsFor = (viewer: Viewer) => db.projects.filter((p) => canSeeProject(viewer, p));

const milestonesOf = (projectId: string) =>
  db.milestones.filter((m) => m.projectId === projectId).sort((a, b) => a.position - b.position);

const balance = (invoice: Invoice) =>
  invoice.amount - invoice.payments.reduce((sum, p) => sum + p.amount, 0);

export const isOverdue = (invoice: Invoice) =>
  invoice.status !== "void" && invoice.status !== "draft" && balance(invoice) > 0 && daysUntil(invoice.dueOn) < 0;

function summarise(invoices: readonly Invoice[]): MoneySummary {
  const live = invoices.filter((i) => i.status !== "void" && i.status !== "draft");
  const unpaid = live
    .filter((i) => balance(i) > 0)
    .sort((a, b) => a.dueOn.localeCompare(b.dueOn));
  return {
    total: live.reduce((s, i) => s + i.amount, 0),
    paid: live.reduce((s, i) => s + i.amount - balance(i), 0),
    outstanding: unpaid.reduce((s, i) => s + balance(i), 0),
    overdue: unpaid.filter(isOverdue).reduce((s, i) => s + balance(i), 0),
    next: unpaid[0] ? { ...unpaid[0], balance: balance(unpaid[0]) } : undefined,
  };
}

function toCard(viewer: Viewer, item: ReviewItem): ItemCard | null {
  if (!canSeeItem(viewer, item)) return null;
  const versions = visibleVersions(viewer, item);
  const current = versions.at(-1);
  if (!current) return null;
  const project = db.projects.find((p) => p.id === item.projectId)!;
  const milestone = item.milestoneId ? db.milestones.find((m) => m.id === item.milestoneId) : undefined;
  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    stage: item.stage,
    version: current.number,
    thumb: current.files[0]?.src,
    dueOn: item.dueOn,
    milestone: milestone ? `${pad(milestone.position)} ${milestone.title}` : undefined,
    href: `/portal/projects/${project.slug}/reviews/${item.id}`,
    project: { code: project.code, name: project.name, slug: project.slug, chip: project.chip, ground: project.ground },
    submittedBy: person(item.submittedBy),
    mine: item.submittedBy === viewer.person.id,
    openComments: current.comments.filter((c) => !c.resolved).length,
  };
}

function unreadIn(viewer: Viewer, thread: Thread) {
  const since = db.reads[viewer.person.id]?.[thread.id] ?? "";
  return thread.messages.filter((m) => m.at > since && m.authorId !== viewer.person.id).length;
}

/* -------------------------------------------------------------------------- */
/*  Getters                                                                   */
/* -------------------------------------------------------------------------- */

export async function listProjects(viewer: Viewer): Promise<ProjectCard[]> {
  return projectsFor(viewer).map((project) => {
    const ms = milestonesOf(project.id);
    return {
      project,
      org: orgById.get(project.orgId)!,
      next: ms.find((m) => m.status !== "done"),
      milestoneCount: ms.length,
      done: ms.filter((m) => m.status === "done").length,
      waiting: db.reviewItems.filter(
        (i) => i.projectId === project.id && canSeeItem(viewer, i) && waitsOn(i.stage, viewer.role, i.submittedBy === viewer.person.id),
      ).length,
    };
  });
}

export async function getProject(slug: string, viewer: Viewer): Promise<ProjectView | null> {
  const project = db.projects.find((p) => p.slug === slug);
  if (!project || !canSeeProject(viewer, project)) return null;
  return {
    project,
    org: orgById.get(project.orgId)!,
    lead: person(project.leadId),
    team: project.members.map((m) => ({ person: person(m.personId), role: m.role })),
    milestones: milestonesOf(project.id),
  };
}

export async function getOverview(slug: string, viewer: Viewer) {
  const view = await getProject(slug, viewer);
  if (!view) return null;
  const { project, org } = view;

  const items = db.reviewItems
    .filter((i) => i.projectId === project.id)
    .map((i) => toCard(viewer, i))
    .filter((i): i is ItemCard => i !== null);

  const awaiting: Awaiting[] = [];
  for (const item of items) {
    if (item.stage === "client_review") {
      awaiting.push({ id: item.id, who: viewer.role === "client" ? "You" : org.name, what: `${item.title} v${pad(item.version)}`, kind: "Approval", href: item.href, dueOn: item.dueOn, you: viewer.role === "client" });
    } else if (item.stage === "internal_review") {
      awaiting.push({ id: item.id, who: viewer.role === "studio" ? "You" : "Studio", what: `${item.title} v${pad(item.version)}`, kind: "Studio review", href: item.href, dueOn: item.dueOn, you: viewer.role === "studio" });
    } else if (item.stage === "internal_changes" || item.stage === "changes_requested") {
      const mine = item.submittedBy.id === viewer.person.id;
      awaiting.push({ id: item.id, who: mine ? "You" : viewer.role === "client" ? "Studio" : item.submittedBy.name, what: `${item.title} v${pad(item.version + 1)}`, kind: "Revision", href: item.href, dueOn: item.dueOn, you: mine });
    }
  }

  const invoices = db.invoices.filter((i) => i.projectId === project.id && i.direction === "receivable" && canSeeInvoice(viewer, i));
  const money = viewer.role === "contractor" ? null : summarise(invoices);
  if (money?.next) {
    awaiting.push({ id: money.next.id, who: viewer.role === "client" ? "You" : org.name, what: `${money.next.number} · ${money.next.label}`, kind: "Payment", href: `/portal/projects/${project.slug}/payments`, dueOn: money.next.dueOn, you: viewer.role === "client" });
  }

  const visibleThreads = db.threads.filter((t) => t.projectId === project.id && canSeeThread(viewer, t));
  const latest = visibleThreads
    .flatMap((t) => t.messages.map((m) => ({ message: m, kind: t.kind, author: person(m.authorId) })))
    .sort((a, b) => b.message.at.localeCompare(a.message.at))[0];

  const activity = db.activity
    .filter((a) => a.projectId === project.id && (viewer.role === "studio" || a.audience.includes(viewer.role)))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 6)
    .map((a): Activity & { actor: Person } => ({ ...a, actor: person(a.actorId) }));

  return { ...view, items, awaiting, money, latest, activity };
}

export async function getReview(slug: string, itemId: string, viewer: Viewer) {
  const view = await getProject(slug, viewer);
  if (!view) return null;
  const item = db.reviewItems.find((i) => i.projectId === view.project.id && i.id === itemId);
  if (!item || !canSeeItem(viewer, item)) return null;
  const versions = visibleVersions(viewer, item);
  if (!versions.length) return null;
  const ids = new Set<string>([item.submittedBy]);
  for (const v of versions) {
    ids.add(v.createdBy);
    v.decisions.forEach((d) => ids.add(d.reviewerId));
    const walk = (cs: readonly Comment[]) => cs.forEach((c) => (ids.add(c.authorId), c.replies && walk(c.replies)));
    walk(v.comments);
  }
  ids.add(viewer.person.id);
  const milestone = item.milestoneId ? db.milestones.find((m) => m.id === item.milestoneId) : undefined;
  return {
    ...view,
    item: { ...item, versions },
    milestone,
    people: [...ids].map(person),
  };
}

export async function listThreads(viewer: Viewer): Promise<ThreadSummary[]> {
  const visible = new Set(projectsFor(viewer).map((p) => p.id));
  return db.threads
    .filter((t) => visible.has(t.projectId) && canSeeThread(viewer, t))
    .map((t) => {
      const project = db.projects.find((p) => p.id === t.projectId)!;
      const last = t.messages.at(-1)!;
      return {
        id: t.id,
        kind: t.kind,
        project: { code: project.code, name: project.name, slug: project.slug, chip: project.chip },
        org: orgById.get(project.orgId)!.name,
        last,
        lastAuthor: person(last.authorId),
        unread: unreadIn(viewer, t),
      };
    })
    .sort((a, b) => b.last.at.localeCompare(a.last.at));
}

export async function getThread(slug: string, kind: Thread["kind"] | undefined, viewer: Viewer) {
  const view = await getProject(slug, viewer);
  if (!view) return null;
  const allowed = db.threads.filter((t) => t.projectId === view.project.id && canSeeThread(viewer, t));
  const thread = allowed.find((t) => t.kind === kind) ?? allowed.find((t) => t.kind === (viewer.role === "contractor" ? "internal" : "client")) ?? allowed[0];
  if (!thread) return null;
  const since = db.reads[viewer.person.id]?.[thread.id];
  const firstUnread = since ? thread.messages.find((m) => m.at > since && m.authorId !== viewer.person.id)?.id : undefined;
  const ids = new Set([...thread.messages.map((m) => m.authorId), viewer.person.id]);
  return {
    ...view,
    thread,
    kinds: allowed.map((t) => t.kind),
    firstUnread,
    people: [...ids].map(person),
  };
}

export async function getClientHome(viewer: Viewer) {
  const cards = await listProjects(viewer);
  const ids = new Set(cards.map((c) => c.project.id));
  const items = db.reviewItems
    .filter((i) => ids.has(i.projectId))
    .map((i) => toCard(viewer, i))
    .filter((i): i is ItemCard => i !== null);
  const waiting = items.filter((i) => waitsOn(i.stage, viewer.role, i.mine));

  /* The milestone that matters now: the soonest one still open. */
  const open = cards
    .flatMap((c) => milestonesOf(c.project.id).filter((m) => m.status !== "done").map((m) => ({ m, card: c })))
    .sort((a, b) => a.m.dueOn.localeCompare(b.m.dueOn));
  const focus = open.find(({ card }) => card.project.status === "active") ?? open[0];
  const nextMilestone = focus
    ? {
        milestone: focus.m,
        project: focus.card.project,
        all: milestonesOf(focus.card.project.id),
        then: milestonesOf(focus.card.project.id).find((m) => m.position === focus.m.position + 1),
        items: items.filter((i) => db.reviewItems.find((r) => r.id === i.id)?.milestoneId === focus.m.id),
      }
    : null;

  const messages = (await listThreads(viewer)).slice(0, 3);
  const latest = db.threads
    .filter((t) => ids.has(t.projectId) && canSeeThread(viewer, t))
    .flatMap((t) => {
      const project = db.projects.find((p) => p.id === t.projectId)!;
      return t.messages.map((m) => ({ message: m, author: person(m.authorId), project: { code: project.code, slug: project.slug, chip: project.chip } }));
    })
    .sort((a, b) => b.message.at.localeCompare(a.message.at))
    .slice(0, 3);

  const money = summarise(db.invoices.filter((i) => canSeeInvoice(viewer, i)));

  return { cards, waiting, items, nextMilestone, threads: messages, latest, money };
}

/** The counts the top bar carries: unread messages, and work waiting on the viewer. */
export async function getNavCounts(viewer: Viewer) {
  const threads = await listThreads(viewer);
  const visible = new Set(projectsFor(viewer).map((p) => p.id));
  return {
    messages: threads.reduce((n, t) => n + t.unread, 0),
    reviews: db.reviewItems.filter(
      (i) => visible.has(i.projectId) && canSeeItem(viewer, i) && waitsOn(i.stage, viewer.role, i.submittedBy === viewer.person.id),
    ).length,
  };
}

/** Every piece of work the viewer can see, across their projects or in one, waiting-on-them first. */
export async function listReviews(viewer: Viewer, slug?: string): Promise<ItemCard[]> {
  const ids = new Set(projectsFor(viewer).filter((p) => !slug || p.slug === slug).map((p) => p.id));
  return db.reviewItems
    .filter((i) => ids.has(i.projectId))
    .map((i) => toCard(viewer, i))
    .filter((i): i is ItemCard => i !== null)
    .sort((a, b) => Number(waitsOn(b.stage, viewer.role, b.mine)) - Number(waitsOn(a.stage, viewer.role, a.mine)));
}

/* -------------------------------------------------------------------------- */
/*  The studio's side                                                         */
/* -------------------------------------------------------------------------- */

const DAY = 86_400_000;
const addDays = (iso: string, n: number) => new Date(Date.parse(iso) + n * DAY).toISOString();

/** Everything from here down is the studio's alone: anyone else gets nothing. */
const studioOnly = (viewer: Viewer) => viewer.role === "studio";

/** What waits on the studio, oldest promise first: work to review, versions to upload, money that's late, mail to file. */
export interface QueueRow {
  readonly id: string;
  readonly kind: "Studio review" | "Upload next version" | "Overdue" | "Unfiled email";
  readonly title: string;
  readonly detail: string;
  readonly href: string;
  readonly dueOn?: string;
  readonly thumb?: string;
  readonly project?: Pick<Project, "code" | "chip" | "ground">;
}

export async function getStudioHome(viewer: Viewer) {
  if (!studioOnly(viewer)) return null;

  const cards = db.reviewItems.map((i) => toCard(viewer, i)).filter((i): i is ItemCard => i !== null);
  const review = cards.filter((i) => i.stage === "internal_review");
  const upload = cards.filter((i) => i.stage === "changes_requested");
  const overdue = db.invoices.filter((i) => i.direction === "receivable" && isOverdue(i));

  const queue: QueueRow[] = [
    ...review.map((i): QueueRow => ({
      id: i.id, kind: "Studio review", title: `${i.title} v${pad(i.version)}`, detail: `${i.submittedBy.name.split(" ")[0]} sent it · ${i.project.code}`,
      href: i.href, dueOn: i.dueOn, thumb: i.thumb, project: i.project,
    })),
    ...upload.map((i): QueueRow => ({
      id: i.id, kind: "Upload next version", title: `${i.title} v${pad(i.version + 1)}`, detail: `Client asked for changes · ${i.project.code}`,
      href: i.href, dueOn: i.dueOn, thumb: i.thumb, project: i.project,
    })),
    ...overdue.map((inv): QueueRow => {
      const project = db.projects.find((p) => p.id === inv.projectId)!;
      return {
        id: inv.id, kind: "Overdue", title: `${inv.number} · ${money(balance(inv))} left`, detail: `${orgById.get(project.orgId)!.name} · ${inv.label}`,
        href: `/portal/projects/${project.slug}/payments`, dueOn: inv.dueOn, project: { code: project.code, chip: project.chip, ground: project.ground },
      };
    }),
    ...db.inbox.map((e): QueueRow => ({
      id: e.id, kind: "Unfiled email", title: e.subject, detail: `${e.fromName} · ${e.guessOrgId ? `Looks like ${orgById.get(e.guessOrgId)!.name}` : "No client yet"}`,
      href: "/portal/messages",
    })),
  ].sort((a, b) => (a.dueOn ?? "9999").localeCompare(b.dueOn ?? "9999"));

  /* The next fourteen days, today first, with the milestones that fall in them. */
  const due = db.milestones
    .filter((m) => m.status !== "done" && daysUntil(m.dueOn) >= 0 && daysUntil(m.dueOn) < 14)
    .map((m) => {
      const project = db.projects.find((p) => p.id === m.projectId)!;
      return { milestone: m, project: { code: project.code, name: project.name, slug: project.slug, chip: project.chip } };
    })
    .sort((a, b) => a.milestone.dueOn.localeCompare(b.milestone.dueOn));
  const days = Array.from({ length: 14 }, (_, n) => {
    const iso = addDays(TODAY, n);
    return { iso, marks: due.filter((d) => daysUntil(d.milestone.dueOn) === n).map((d) => d.project.chip) };
  });

  /* What clients decided lately. */
  const decisions = db.reviewItems
    .flatMap((item) => {
      const project = db.projects.find((p) => p.id === item.projectId)!;
      return item.versions.flatMap((v) =>
        v.decisions
          .filter((d) => d.stage === "client")
          .map((d) => ({
            ...d,
            reviewer: person(d.reviewerId),
            item: `${item.title} v${pad(v.number)}`,
            href: `/portal/projects/${project.slug}/reviews/${item.id}`,
            project: { code: project.code, chip: project.chip },
          })),
      );
    })
    .sort((a, b) => b.at.localeCompare(a.at));
  const thisWeek = decisions.filter((d) => daysUntil(d.at) > -7);

  const threads = await listThreads(viewer);
  const receivables = summarise(db.invoices.filter((i) => i.direction === "receivable"));
  const payables = summarise(db.invoices.filter((i) => i.direction === "payable"));
  const overdueInvoice = overdue[0];

  return {
    stats: {
      review: review.length,
      reviewNext: review[0],
      decisions: thisWeek.length,
      decisionsChanges: thisWeek.filter((d) => d.decision !== "approved").length,
      unread: threads.reduce((n, t) => n + t.unread, 0),
      unreadThreads: threads.filter((t) => t.unread).length,
      overdue: receivables.overdue,
      overdueInvoice: overdueInvoice
        ? { number: overdueInvoice.number, org: orgById.get(db.projects.find((p) => p.id === overdueInvoice.projectId)!.orgId)!.name, late: -daysUntil(overdueInvoice.dueOn) }
        : undefined,
    },
    queue,
    days,
    due,
    decisions: decisions.slice(0, 4),
    inbox: db.inbox.map((e) => ({ ...e, guess: e.guessOrgId ? orgById.get(e.guessOrgId) : undefined })),
    receivables,
    payables,
  };
}

/** A client as the list shows them. */
export interface ClientRow {
  readonly org: Org;
  readonly projects: readonly Project[];
  readonly contacts: readonly Person[];
  readonly invited: number;
  readonly money: MoneySummary;
  readonly last?: Activity & { readonly actor: Person };
  readonly current: boolean;
}

function clientRow(org: Org): ClientRow {
  const projects = db.projects.filter((p) => p.orgId === org.id);
  const contacts = db.people.filter((p) => p.orgId === org.id);
  const ids = new Set(projects.map((p) => p.id));
  const last = db.activity.filter((a) => ids.has(a.projectId)).sort((a, b) => b.at.localeCompare(a.at))[0];
  return {
    org,
    projects,
    contacts,
    invited: contacts.filter((c) => c.status === "invited").length,
    money: summarise(db.invoices.filter((i) => i.direction === "receivable" && i.orgId === org.id)),
    last: last ? { ...last, actor: person(last.actorId) } : undefined,
    current: projects.some((p) => p.status === "active" || p.status === "proposal"),
  };
}

export async function listClients(viewer: Viewer): Promise<ClientRow[] | null> {
  if (!studioOnly(viewer)) return null;
  return db.orgs.map(clientRow).sort((a, b) => Number(b.current) - Number(a.current) || (b.last?.at ?? "").localeCompare(a.last?.at ?? ""));
}

export async function getClient(slug: string, viewer: Viewer) {
  if (!studioOnly(viewer)) return null;
  const org = db.orgs.find((o) => o.slug === slug);
  if (!org) return null;
  const row = clientRow(org);
  const cards = (await listProjects(viewer)).filter((c) => c.org.id === org.id);
  const invoices = db.invoices
    .filter((i) => i.direction === "receivable" && i.orgId === org.id)
    .map((i) => ({ ...i, balance: balance(i), overdue: isOverdue(i), project: db.projects.find((p) => p.id === i.projectId)! }))
    .sort((a, b) => b.issuedOn.localeCompare(a.issuedOn));
  const ids = new Set(row.projects.map((p) => p.id));
  const activity = db.activity
    .filter((a) => ids.has(a.projectId))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 5)
    .map((a) => ({ ...a, actor: person(a.actorId) }));
  const lifetime = db.invoices.filter((i) => i.direction === "receivable" && i.orgId === org.id).reduce((s, i) => s + i.amount, 0);
  return { ...row, cards, invoices, activity, lifetime };
}

/** The studio and the people it works with. */
export async function listTeam(viewer: Viewer) {
  if (!studioOnly(viewer)) return null;
  const row = (p: Person) => {
    const projects = db.projects.filter((pr) => pr.members.some((m) => m.personId === p.id));
    const payables = db.invoices.filter((i) => i.direction === "payable" && i.contractorId === p.id);
    return {
      person: p,
      projects: projects.map((pr) => ({ code: pr.code, name: pr.name, slug: pr.slug, chip: pr.chip, lead: pr.leadId === p.id })),
      inReview: db.reviewItems.filter((i) => i.submittedBy === p.id && (i.stage === "internal_review" || i.stage === "internal_changes")).length,
      payables: summarise(payables),
      lastInvoice: payables.sort((a, b) => b.issuedOn.localeCompare(a.issuedOn))[0],
    };
  };
  return {
    studio: db.people.filter((p) => p.role === "studio").map(row),
    contractors: db.people.filter((p) => p.role === "contractor").map(row),
  };
}

/** The studio's people, for pickers: who can lead a project. */
export async function listStudio(viewer: Viewer) {
  if (!studioOnly(viewer)) return null;
  return db.people.filter((p) => p.role === "studio");
}

/* -------------------------------------------------------------------------- */
/*  Notes, milestones, files, money                                           */
/* -------------------------------------------------------------------------- */

/** The client reads shared notes; contractors read the internal ones; the studio reads both. */
const canSeeNote = (viewer: Viewer, note: MeetingNote) =>
  viewer.role === "studio" || (viewer.role === "client" ? note.visibility === "shared" : note.visibility === "internal");

export async function listNotes(slug: string, viewer: Viewer) {
  const view = await getProject(slug, viewer);
  if (!view) return null;
  const notes = db.notes
    .filter((n) => n.projectId === view.project.id && canSeeNote(viewer, n))
    .sort((a, b) => b.metOn.localeCompare(a.metOn))
    .map((n) => ({
      ...n,
      author: person(n.createdBy),
      attendees: n.attendeeIds.map(person),
      open: n.actions.filter((a) => !a.done).length,
    }));
  return { ...view, notes };
}

export async function getNote(slug: string, noteId: string, viewer: Viewer) {
  const view = await getProject(slug, viewer);
  if (!view) return null;
  const note = db.notes.find((n) => n.projectId === view.project.id && n.id === noteId);
  if (!note || !canSeeNote(viewer, note)) return null;
  /* Everyone on the note, plus the team to assign actions to — but a client
     never receives the studio's contractors unless they're on the note. */
  const team = view.team.filter((t) => viewer.role !== "client" || t.role !== "contractor").map((t) => t.person.id);
  const ids = new Set([...note.attendeeIds, note.createdBy, ...note.actions.map((a) => a.assigneeId), ...team]);
  return { ...view, note, author: person(note.createdBy), people: [...ids].map(person) };
}

export async function getMilestones(slug: string, viewer: Viewer) {
  const view = await getProject(slug, viewer);
  if (!view) return null;
  const items = db.reviewItems.filter((i) => i.projectId === view.project.id).map((i) => toCard(viewer, i)).filter((i): i is ItemCard => i !== null);
  const milestones = view.milestones.map((m) => {
    const invoice = viewer.role === "contractor" ? undefined : db.invoices.find((i) => i.milestoneId === m.id && i.direction === "receivable" && canSeeInvoice(viewer, i));
    return {
      milestone: m,
      items: items.filter((i) => db.reviewItems.find((r) => r.id === i.id)?.milestoneId === m.id),
      invoice: invoice ? { ...invoice, balance: balance(invoice), overdue: isOverdue(invoice) } : undefined,
    };
  });
  return { ...view, rows: milestones };
}

export interface FileRow {
  readonly id: string;
  readonly name: string;
  readonly mime: string;
  readonly size: number;
  readonly src: string;
  readonly from: "Review" | "Message";
  readonly context: string;
  readonly at: string;
  readonly href: string;
  readonly by: Person;
}

/** Every file the viewer can open in a project: from the work in review, and from the conversation. */
export async function listFiles(slug: string, viewer: Viewer) {
  const view = await getProject(slug, viewer);
  if (!view) return null;
  const rows: FileRow[] = [];
  for (const item of db.reviewItems.filter((i) => i.projectId === view.project.id && canSeeItem(viewer, i))) {
    for (const v of visibleVersions(viewer, item)) {
      for (const f of v.files) {
        rows.push({
          ...f,
          from: "Review",
          context: `${item.title} v${pad(v.number)}`,
          at: v.sharedAt && viewer.role === "client" ? v.sharedAt : v.createdAt,
          href: `/portal/projects/${slug}/reviews/${item.id}`,
          by: person(v.createdBy),
        });
      }
    }
  }
  for (const t of db.threads.filter((t) => t.projectId === view.project.id && canSeeThread(viewer, t))) {
    for (const m of t.messages) {
      for (const f of m.attachments ?? []) {
        rows.push({ ...f, from: "Message", context: t.kind === "internal" ? "Internal thread" : "Client thread", at: m.at, href: `/portal/projects/${slug}/messages`, by: person(m.authorId) });
      }
    }
  }
  return { ...view, files: rows.sort((a, b) => b.at.localeCompare(a.at)) };
}

export interface InvoiceRow extends Invoice {
  readonly balance: number;
  readonly overdue: boolean;
  readonly paid: number;
  readonly project: Pick<Project, "code" | "name" | "slug" | "chip">;
  readonly org: Org;
  readonly contractor?: Person;
}

/**
 * Invoices as a ledger. The studio sees both directions; a client sees what
 * the studio has billed them; a contractor sees only what they've billed the
 * studio.
 */
export async function listInvoices(viewer: Viewer, opts: { slug?: string; direction?: Invoice["direction"] } = {}) {
  const project = opts.slug ? db.projects.find((p) => p.slug === opts.slug) : undefined;
  if (opts.slug && (!project || !canSeeProject(viewer, project))) return null;
  const direction = viewer.role === "contractor" ? "payable" : viewer.role === "client" ? "receivable" : (opts.direction ?? "receivable");
  const rows: InvoiceRow[] = db.invoices
    .filter((i) => i.direction === direction && canSeeInvoice(viewer, i) && (!project || i.projectId === project.id))
    .map((i) => {
      const p = db.projects.find((x) => x.id === i.projectId)!;
      return {
        ...i,
        balance: balance(i),
        overdue: isOverdue(i),
        paid: i.amount - balance(i),
        project: { code: p.code, name: p.name, slug: p.slug, chip: p.chip },
        org: orgById.get(p.orgId)!,
        contractor: i.contractorId ? person(i.contractorId) : undefined,
      };
    })
    .sort((a, b) => Number(b.balance > 0) - Number(a.balance > 0) || b.issuedOn.localeCompare(a.issuedOn));
  const paidThisYear = rows.flatMap((r) => r.payments).filter((p) => p.paidOn.startsWith(TODAY.slice(0, 4))).reduce((s, p) => s + p.amount, 0);
  return { direction, rows, summary: summarise(rows), paidThisYear };
}

/** What a contractor opens to: their work and where it stands, their thread, what the studio owes them. */
export async function getContractorHome(viewer: Viewer) {
  if (viewer.role !== "contractor") return null;
  const cards = await listProjects(viewer);
  const ids = new Set(cards.map((c) => c.project.id));
  const items = db.reviewItems
    .filter((i) => ids.has(i.projectId))
    .map((i) => toCard(viewer, i))
    .filter((i): i is ItemCard => i !== null);
  const mine = items
    .filter((i) => i.mine)
    .sort((a, b) => Number(waitsOn(b.stage, viewer.role, b.mine)) - Number(waitsOn(a.stage, viewer.role, a.mine)));
  const threads = await listThreads(viewer);
  const invoices = await listInvoices(viewer);
  const actions = db.notes
    .filter((n) => ids.has(n.projectId) && canSeeNote(viewer, n))
    .flatMap((n) => n.actions.filter((a) => a.assigneeId === viewer.person.id && !a.done).map((a) => ({ ...a, note: n.title, href: `/portal/projects/${db.projects.find((p) => p.id === n.projectId)!.slug}/notes/${n.id}` })));
  return { cards, mine, others: items.filter((i) => !i.mine), threads, invoices: invoices!, actions };
}

/** Mail without a thread, with where it probably belongs. The studio's alone. */
export async function getTriage(viewer: Viewer) {
  if (!studioOnly(viewer)) return null;
  return db.inbox.map((e) => {
    const guess = e.guessOrgId ? orgById.get(e.guessOrgId) : undefined;
    const candidates = db.projects
      .filter((p) => p.status !== "complete")
      .sort((a, b) => Number(b.orgId === e.guessOrgId) - Number(a.orgId === e.guessOrgId))
      .map((p) => ({ slug: p.slug, code: p.code, name: p.name, chip: p.chip, org: orgById.get(p.orgId)!.name, likely: p.orgId === e.guessOrgId }));
    return { ...e, guess, candidates };
  });
}

/** Where the viewer can put work up for review: running projects they're on. Clients submit nothing. */
export async function submitTargets(viewer: Viewer, slug?: string) {
  if (viewer.role === "client") return [];
  return projectsFor(viewer)
    .filter((p) => p.status !== "complete" && (!slug || p.slug === slug))
    .map((p) => {
      const contact = p.members.map((m) => person(m.personId)).find((x) => x.role === "client" && x.status === "active");
      return {
        slug: p.slug,
        code: p.code,
        name: p.name,
        chip: p.chip,
        client: contact ? contact.name.split(" ")[0] : orgById.get(p.orgId)!.name,
        milestones: milestonesOf(p.id)
          .filter((m) => m.status !== "done")
          .map((m) => ({ id: m.id, position: m.position, title: m.title })),
      };
    });
}

/** Where a new invoice can be for: the studio bills any running project; a contractor bills the ones they're on. */
export async function invoiceTargets(viewer: Viewer, slug?: string) {
  if (viewer.role === "client") return { projects: [], nextNumber: "" };
  const projects = projectsFor(viewer)
    .filter((p) => (viewer.role === "contractor" || p.status !== "complete") && (!slug || p.slug === slug))
    .map((p) => ({ slug: p.slug, code: p.code, name: p.name, chip: p.chip, org: orgById.get(p.orgId)!.name }));
  const last = Math.max(...db.invoices.filter((i) => i.number.startsWith("INV-")).map((i) => Number(i.number.slice(4))));
  return { projects, nextNumber: viewer.role === "studio" ? `INV-${String(last + 1).padStart(4, "0")}` : "" };
}

/** A project's settings, for the studio: everyone who could be added — the studio, contractors, the client's own people. */
export async function getProjectSettings(slug: string, viewer: Viewer) {
  if (!studioOnly(viewer)) return null;
  const view = await getProject(slug, viewer);
  if (!view) return null;
  const others = db.people.filter((p) => p.role !== "client" || p.orgId === view.project.orgId);
  return { ...view, others };
}
