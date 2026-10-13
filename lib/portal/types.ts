/**
 * The portal's records, shaped as the database will hold them. The prototype
 * reads them from fixtures.ts; the build swaps that for Supabase behind the
 * same getters in data.ts, so nothing that renders these needs to change.
 *
 * Dates are ISO strings and money is whole cents, as they will come back
 * from Postgres.
 */

export type Role = "studio" | "client" | "contractor";

export interface Person {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: Role;
  readonly title: string;
  /** A client contact's organisation. */
  readonly orgId?: string;
  readonly status: "invited" | "active" | "disabled";
  /** When they last opened the portal. */
  readonly lastSeenAt?: string;
  /** When their invitation went out. */
  readonly invitedAt?: string;
}

export interface Org {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  /** Inbound mail from these domains is matched to this client. */
  readonly domains: readonly string[];
  readonly colour: string;
  readonly website: string;
  /** When they became a client. */
  readonly since: string;
  /** The studio's own note on them. */
  readonly note: string;
}

export type ProjectStatus = "proposal" | "active" | "paused" | "complete";

export interface Project {
  readonly id: string;
  readonly orgId: string;
  readonly slug: string;
  readonly code: string;
  readonly name: string;
  readonly summary: string;
  readonly status: ProjectStatus;
  /** The plate behind the project: a soft ground, as on the site's cards. */
  readonly ground: string;
  /** The project's chip: the same hue, strong enough to read as a tag. */
  readonly chip: string;
  readonly startOn: string;
  readonly targetOn: string;
  readonly leadId: string;
  readonly members: readonly ProjectMember[];
}

export interface ProjectMember {
  readonly personId: string;
  readonly role: "lead" | "studio" | "client" | "contractor";
}

export type MilestoneStatus = "upcoming" | "in_progress" | "in_review" | "done";

export interface Milestone {
  readonly id: string;
  readonly projectId: string;
  readonly position: number;
  readonly title: string;
  readonly summary: string;
  readonly dueOn: string;
  readonly status: MilestoneStatus;
  readonly completedOn?: string;
}

/**
 * Where a piece of work stands. Contractor work starts at `internal_review`;
 * only from `client_review` on is it the client's to see.
 */
export type Stage =
  | "internal_review"
  | "internal_changes"
  | "client_review"
  | "changes_requested"
  | "approved"
  | "rejected";

export interface ReviewItem {
  readonly id: string;
  readonly projectId: string;
  readonly milestoneId?: string;
  readonly title: string;
  readonly summary: string;
  readonly kind: "image" | "video" | "document" | "link";
  readonly stage: Stage;
  readonly submittedBy: string;
  readonly dueOn?: string;
  readonly versions: readonly Version[];
}

export interface Version {
  readonly id: string;
  readonly number: number;
  readonly note: string;
  readonly createdBy: string;
  readonly createdAt: string;
  /** When it went to the client. Unset, the client never sees it. */
  readonly sharedAt?: string;
  readonly files: readonly FileRef[];
  readonly comments: readonly Comment[];
  readonly decisions: readonly Decision[];
}

export interface FileRef {
  readonly id: string;
  readonly name: string;
  readonly mime: string;
  readonly size: number;
  /** In the prototype, a path under public/. */
  readonly src: string;
  readonly width?: number;
  readonly height?: number;
}

export interface Comment {
  readonly id: string;
  readonly authorId: string;
  readonly body: string;
  readonly at: string;
  readonly visibility: "client" | "internal";
  /** A pin on the work, as fractions of its width and height. */
  readonly pin?: { readonly x: number; readonly y: number };
  readonly resolved?: boolean;
  readonly replies?: readonly Comment[];
}

export interface Decision {
  readonly id: string;
  readonly reviewerId: string;
  readonly stage: "internal" | "client";
  readonly decision: "approved" | "changes_requested" | "rejected";
  readonly reason?: string;
  readonly at: string;
}

export interface Thread {
  readonly id: string;
  readonly projectId: string;
  /** `client`: the studio and the client. `internal`: the studio and contractors. */
  readonly kind: "client" | "internal";
  readonly messages: readonly Message[];
}

export interface Message {
  readonly id: string;
  readonly authorId: string;
  readonly body: string;
  readonly at: string;
  readonly source: "portal" | "email";
  /** For mail that came in: what it was called in the inbox. */
  readonly subject?: string;
  readonly attachments?: readonly FileRef[];
}

export interface Invoice {
  readonly id: string;
  /** `receivable`: the studio bills a client. `payable`: a contractor bills the studio. */
  readonly direction: "receivable" | "payable";
  readonly number: string;
  readonly projectId: string;
  readonly orgId?: string;
  readonly contractorId?: string;
  readonly milestoneId?: string;
  readonly label: string;
  readonly amount: number;
  readonly currency: "USD";
  readonly issuedOn: string;
  readonly dueOn: string;
  readonly status: "draft" | "sent" | "partially_paid" | "paid" | "void";
  readonly payments: readonly Payment[];
}

export interface Payment {
  readonly id: string;
  readonly amount: number;
  readonly paidOn: string;
  readonly method: "wire" | "ach" | "check" | "card" | "other";
}

export interface Activity {
  readonly id: string;
  readonly projectId: string;
  readonly actorId: string;
  readonly verb: string;
  readonly object: string;
  readonly at: string;
  /** Who besides the studio sees it: money is never the contractors', internal work never the client's. */
  readonly audience: readonly Role[];
}

/** Something someone agreed to do in a meeting. */
export interface ActionItem {
  readonly id: string;
  readonly text: string;
  readonly assigneeId: string;
  readonly dueOn?: string;
  readonly done: boolean;
}

/**
 * Notes from a meeting. `shared` notes are the client's to read too;
 * `internal` notes stay with the studio and its contractors.
 */
export interface MeetingNote {
  readonly id: string;
  readonly projectId: string;
  readonly title: string;
  readonly metOn: string;
  readonly attendeeIds: readonly string[];
  /** People who were there but aren't in the portal. */
  readonly guests: readonly string[];
  /** Markdown: paragraphs, "## " headings and "- " lists. */
  readonly body: string;
  readonly visibility: "shared" | "internal";
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly actions: readonly ActionItem[];
}

/**
 * Mail that came in without a thread to land in: forwarded, BCC'd, or from
 * someone the portal doesn't know yet. The studio files it or lets it go.
 */
export interface InboundEmail {
  readonly id: string;
  readonly fromName: string;
  readonly fromEmail: string;
  readonly subject: string;
  readonly snippet: string;
  readonly at: string;
  /** The client the sender's domain points to, if any. */
  readonly guessOrgId?: string;
  readonly attachments?: number;
}

/** Who is looking: their role decides what every getter returns. */
export interface Viewer {
  readonly role: Role;
  readonly person: Person;
}
