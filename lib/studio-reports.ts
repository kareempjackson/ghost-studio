import "server-only";
import { stegaClean } from "next-sanity";
import { NextResponse, type NextRequest } from "next/server";
import { ANALYTICS_KEYS_ID, parseServiceAccount, type ServiceAccount } from "@/lib/analytics-keys";
import { SITE_URL } from "@/lib/site";
import { refuseUnlessEditor } from "@/lib/studio-auth";
import { client } from "@/sanity/lib/client";

/**
 * The Studio's Analytics tool (sanity/analytics.tsx) reads GA4, Search
 * Console and PageSpeed through app/api/analytics/*, which hand each request
 * to sanity-plugin-analytics's own handler. Its handlers answer anyone, so
 * these routes stand in front of them: only an editor signed in to the
 * Studio is let through, which property is read is set here from Site
 * settings rather than by the browser, the keys come from Analytics keys in
 * the Studio, and nothing is kept by a cache on the way back.
 */

type Handler = (request: Request) => Promise<Response>;

/**
 * How a dashboard reads an error: GA4's and Search Console's as
 * {error: "…"}, Lighthouse's as Google's own {error: {message}}.
 */
type Shape = "text" | "google";

const NO_STORE = { "Cache-Control": "private, no-store" };

export const fail = (status: number, message: string, shape: Shape) =>
  NextResponse.json({ error: shape === "google" ? { message } : message }, { status, headers: NO_STORE });

/** The refusal to send unless an editor is asking, in the words the dashboard shows. */
export async function refuseUnlessReader(request: NextRequest, shape: Shape) {
  const refusal = await refuseUnlessEditor(request, "see the site's analytics");
  return refusal && fail(refusal.status, await refusal.text(), shape);
}

/** Where the keys are entered, for the words of a refusal. */
export const KEYS_PLACE = "Analytics keys in the Studio, just under Site settings";

/* The keys in the environment, as deployed: used for whatever Analytics keys leaves empty. */
const DEPLOYED = {
  email: process.env.GA_SERVICE_ACCOUNT_EMAIL,
  privateKey: process.env.GA_PRIVATE_KEY,
  pagespeed: process.env.PAGESPEED_API_KEY,
};

export interface ReportSettings {
  readonly gaPropertyId: string | null;
  readonly searchConsoleProperty: string;
  readonly google: ServiceAccount | null;
  readonly pagespeedKey: string | null;
}

/**
 * Which GA4 and Search Console properties are read, from Site settings ›
 * Tracking, and what with, from Analytics keys. The keys sit at a private
 * id, so they are read with the server's token.
 */
export async function reportSettings(): Promise<ReportSettings> {
  const row = await client
    .withConfig({ token: process.env.SANITY_API_READ_TOKEN, useCdn: false, stega: false })
    .fetch<{
      site: { gaPropertyId?: string | null; searchConsoleProperty?: string | null } | null;
      keys: { googleServiceAccount?: string | null; pagespeedKey?: string | null } | null;
    }>(
      `{
        "site": *[_id == "siteSettings"][0]{gaPropertyId, searchConsoleProperty},
        "keys": *[_id == $keys][0]{googleServiceAccount, pagespeedKey}
      }`,
      { keys: ANALYTICS_KEYS_ID },
    );
  const clean = (value: string | null | undefined) => stegaClean(value)?.trim() || null;
  return {
    gaPropertyId: clean(row.site?.gaPropertyId),
    /* A URL-prefix property is the site's address with its slash. */
    searchConsoleProperty: clean(row.site?.searchConsoleProperty) ?? `${SITE_URL}/`,
    google:
      parseServiceAccount(row.keys?.googleServiceAccount) ??
      (DEPLOYED.email && DEPLOYED.privateKey ? { email: DEPLOYED.email, privateKey: DEPLOYED.privateKey } : null),
    pagespeedKey: clean(row.keys?.pagespeedKey) ?? DEPLOYED.pagespeed ?? null,
  };
}

/** The plugin's handlers read the service account from the environment: there for the call. */
export const googleEnv = ({ email, privateKey }: ServiceAccount) => ({
  GA_SERVICE_ACCOUNT_EMAIL: email,
  GA_PRIVATE_KEY: privateKey,
});

/**
 * Hands the request to the plugin's handler with `set` in its query, in
 * place of anything the browser sent under those names, and `env` in the
 * environment, where the handler reads its keys. Returns its answer uncached.
 */
export async function forward(
  request: NextRequest,
  handler: Handler,
  { set = {}, env = {} }: { set?: Record<string, string>; env?: Record<string, string> } = {},
) {
  const url = new URL(request.url);
  for (const [name, value] of Object.entries(set)) url.searchParams.set(name, value);
  Object.assign(process.env, env);
  const response = await handler(
    new Request(url, {
      method: request.method,
      /* Not the editor's token: the plugin has no use for it. */
      headers: { "Content-Type": request.headers.get("content-type") ?? "application/json" },
      body: request.method === "GET" ? undefined : await request.text(),
    }),
  );
  return new NextResponse(response.body, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json", ...NO_STORE },
  });
}
