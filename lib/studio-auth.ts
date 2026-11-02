import { NextResponse, type NextRequest } from "next/server";
import { apiVersion, projectId } from "@/sanity/env";

/**
 * Lets through only someone signed in to the Studio with more than read
 * access: the request carries their Sanity token, and Sanity says who it
 * belongs to and what they may do. Returns the refusal to send, or null.
 * `what` finishes the refusal a viewer is given: "Your role cannot …".
 */
export async function refuseUnlessEditor(request: NextRequest, what = "change this") {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return new NextResponse("Sign in to the Studio", { status: 401 });

  const me = await fetch(`https://${projectId}.api.sanity.io/v${apiVersion}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const user = me.ok ? ((await me.json()) as { id?: string; roles?: { name: string }[] }) : null;
  if (!user?.id) return new NextResponse("Sign in to the Studio", { status: 401 });
  if (!user.roles?.some((role) => role.name !== "viewer")) {
    return new NextResponse(`Your role cannot ${what}`, { status: 403 });
  }
  return null;
}
