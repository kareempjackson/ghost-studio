import type { Role } from "./types";

/** The prototype's "View as" switch is kept in this cookie. */
export const VIEW_COOKIE = "gs-portal-view";

export const ROLES: readonly Role[] = ["studio", "client", "contractor"];

export const isRole = (value: unknown): value is Role => ROLES.includes(value as Role);

export const ROLE_LABEL: Record<Role, string> = {
  studio: "Studio",
  client: "Client",
  contractor: "Contractor",
};
