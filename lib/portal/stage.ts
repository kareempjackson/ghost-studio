import type { Role, Stage } from "./types";

/**
 * How a review stage reads to whoever is looking. The same stage is a
 * request to one person and a wait to another: `client_review` is "Needs
 * your review" to the client and "With client" to the studio. `mine` says
 * the viewer submitted the work, so its revisions are theirs to make.
 *
 * Tone follows the portal's colour roles: signal for what needs this person,
 * acid for what is done, ink for a closed door, quiet for everything else.
 */
export type Tone = "quiet" | "outline" | "ink" | "acid" | "signal" | "signal-soft";

export function stageChip(stage: Stage, role: Role, mine = false): { label: string; tone: Tone } {
  switch (stage) {
    case "internal_review":
      return role === "studio"
        ? { label: "Needs studio review", tone: "signal" }
        : { label: "In studio review", tone: "quiet" };
    case "internal_changes":
      return role === "contractor" && mine
        ? { label: "Changes for you", tone: "signal" }
        : { label: "Revising", tone: "outline" };
    case "client_review":
      return role === "client"
        ? { label: "Needs your review", tone: "signal" }
        : { label: "With client", tone: "quiet" };
    case "changes_requested":
      return { label: "Changes requested", tone: "signal-soft" };
    case "approved":
      return { label: "Approved", tone: "acid" };
    case "rejected":
      return { label: "Rejected", tone: "ink" };
  }
}

/** The stages a client is ever shown. */
export const CLIENT_STAGES: readonly Stage[] = [
  "client_review",
  "changes_requested",
  "approved",
  "rejected",
];

/**
 * Whether the work is waiting on this person right now. A revision waits
 * only on the contractor who submitted it (`mine`), not on every contractor
 * on the project.
 */
export function waitsOn(stage: Stage, role: Role, mine = false) {
  return (
    (stage === "client_review" && role === "client") ||
    (stage === "internal_review" && role === "studio") ||
    (stage === "internal_changes" && role === "contractor" && mine)
  );
}
