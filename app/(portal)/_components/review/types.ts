import type { Comment, Person, ReviewItem, Role } from "@/lib/portal/types";

/** What the review screen is handed by its page: plain data, filtered for the viewer. */
export interface ReviewProps {
  readonly viewer: { readonly role: Role; readonly personId: string };
  readonly project: { readonly slug: string; readonly code: string; readonly name: string; readonly chip: string; readonly ground: string };
  readonly org: string;
  /** The client contact the studio speaks of: "With Dana since 8 Oct". */
  readonly clientName: string;
  readonly item: ReviewItem;
  readonly milestone?: { readonly position: number; readonly title: string };
  readonly people: readonly Person[];
}

/** A comment as the screen keeps it: its pin's number worked out once. */
export interface PinnedComment extends Comment {
  readonly number?: number;
}
