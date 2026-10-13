import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { people, personas } from "./fixtures";
import { isRole, VIEW_COOKIE } from "./roles";
import type { Viewer } from "./types";

/**
 * Who is looking. In the prototype it is whoever the "View as" switch says,
 * kept in a cookie; a client by default, since the client's screens are the
 * ones the studio is judged by. With auth, this becomes verifySession(): the
 * signed-in person and their role, from Supabase.
 *
 * Reads a cookie, so whatever calls it renders at request time and belongs
 * inside a <Suspense> boundary.
 */
export const getViewer = cache(async (): Promise<Viewer> => {
  const value = (await cookies()).get(VIEW_COOKIE)?.value;
  const role = isRole(value) ? value : "client";
  const person = people.find((p) => p.id === personas[role])!;
  return { role, person };
});
