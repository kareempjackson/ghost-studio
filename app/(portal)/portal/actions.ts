"use server";

import { cookies } from "next/headers";
import { isRole, VIEW_COOKIE } from "@/lib/portal/roles";

/**
 * The prototype's "View as" switch. Setting the cookie from an action
 * re-renders the page in the same response, so the screen changes hands
 * the moment the button is pressed. Replaced by the session at sign-in.
 */
export async function setViewAs(role: string) {
  if (!isRole(role)) return;
  (await cookies()).set(VIEW_COOKIE, role, {
    path: "/portal",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
}
