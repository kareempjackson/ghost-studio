/**
 * Ghost Savvy Studios — tracking: Google Analytics, PostHog, and the
 * LinkedIn and Meta pixels.
 *
 * All of it is set in the Studio, under Site settings › Tracking: each tool
 * is on once its ID is given, and who is asked about cookies is chosen
 * there too. Only production builds carry them, so `next dev` stays out of
 * the reports.
 *
 * The Google tag (gtag.js) is set in <head> of every page by
 * app/(site)/layout.tsx. Moves inside the site don't reload the page, so only
 * the first view is reported here; GA4's enhanced measurement counts the rest
 * from the browser's history changes. PostHog and the pixels are started in
 * the browser by app/(site)/_components/Tracking.tsx, once the visitor's
 * consent is known.
 *
 * Visitors in the EEA, the UK and Switzerland (or everyone, if Site settings
 * says so) are asked before anything sets a cookie (lib/consent.ts). Until
 * then Google's consent mode keeps its cookies off for them, and the tag
 * sends only cookieless pings; everyone else is counted with cookies from
 * the first page. Google's advertising storage stays off everywhere: the
 * site runs no Google ads.
 */

import { stegaClean } from "next-sanity";
import type { SiteSettings } from "@/sanity/types";

/** What a GA4 measurement ID, a PostHog project key and an ad pixel's ID look like. */
export const GA_ID = /^G-[A-Z0-9]+$/;
export const POSTHOG_KEY = /^phc_[A-Za-z0-9]+$/;
export const AD_ID = /^\d+$/;

/**
 * Where a visitor must agree before analytics cookies are set: the EEA, the
 * UK and Switzerland, as ISO country codes. Google's consent default reads
 * it, and so does /api/region, which tells the banner whether to ask.
 */
export const CONSENT_COUNTRIES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE",
  "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  "IS", "LI", "NO",
  "GB", "CH",
] as const;

export const loadsAnalytics = process.env.NODE_ENV === "production";

/**
 * An ID from the Studio, ready for a script: without the draft-mode
 * markers, and only if it has the shape it should. Anything else is off.
 */
const valid = (value: string | null | undefined, shape: RegExp) => {
  const id = value ? stegaClean(value).trim() : "";
  return shape.test(id) ? id : null;
};

/** The site's conversions LinkedIn can count, as Site settings names them. */
export const LINKEDIN_CONVERSIONS = ["enquiry", "newsletter", "booking", "deck"] as const;
export type LinkedinConversion = (typeof LINKEDIN_CONVERSIONS)[number];

/** What app/(site)/_components/Tracking.tsx starts in the browser: null is off. */
export interface BrowserTrackers {
  readonly posthog: { readonly key: string; readonly region: "us" | "eu"; readonly replays: boolean } | null;
  readonly linkedin: {
    readonly partnerId: string;
    readonly conversions: Partial<Record<LinkedinConversion, string>>;
  } | null;
  readonly meta: string | null;
  /** Every visitor is asked about cookies, not only those in the EEA, the UK and Switzerland. */
  readonly askEveryone: boolean;
}

/**
 * The tools this build runs, from Site settings: the Google tag's ID (null
 * is off), what starts in the browser, and whether anything is on at all,
 * which is when the cookie banner and Cookie settings are shown.
 */
export function trackers(settings: SiteSettings) {
  const id = (value: string | null | undefined, shape: RegExp) => (loadsAnalytics ? valid(value, shape) : null);
  const ga = id(settings.gaMeasurementId, GA_ID);
  const posthogKey = id(settings.posthogKey, POSTHOG_KEY);
  const partnerId = id(settings.linkedinPartnerId, AD_ID);
  const browser: BrowserTrackers = {
    posthog: posthogKey
      ? {
          key: posthogKey,
          region: stegaClean(settings.posthogRegion) === "eu" ? "eu" : "us",
          replays: settings.sessionReplays !== false,
        }
      : null,
    linkedin: partnerId
      ? {
          partnerId,
          conversions: Object.fromEntries(
            LINKEDIN_CONVERSIONS.flatMap((name) => {
              const conversion = valid(settings.linkedinConversions?.[name], AD_ID);
              return conversion ? [[name, conversion]] : [];
            }),
          ),
        }
      : null,
    meta: id(settings.metaPixelId, AD_ID),
    askEveryone: stegaClean(settings.consentScope) === "everyone",
  };
  return { ga, browser, on: Boolean(ga || browser.posthog || browser.linkedin || browser.meta) };
}

export const gtagSrc = (id: string) => `https://www.googletagmanager.com/gtag/js?id=${id}`;

/**
 * The Google tag's setup. Consent first: analytics storage off where the
 * visitor must be asked (everywhere, with `askEveryone`), on elsewhere, and
 * advertising storage off everywhere. Then any choice the visitor has
 * already made, from the `gs_consent` cookie, before the tag is configured.
 */
export const gtagScript = (id: string, askEveryone: boolean) => `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {analytics_storage: '${askEveryone ? "denied" : "granted"}', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
${askEveryone ? "" : `gtag('consent', 'default', {analytics_storage: 'denied', region: ${JSON.stringify(CONSENT_COUNTRIES)}});\n`}var gsConsent = document.cookie.match(/(?:^|; )gs_consent=(granted|denied)/);
if (gsConsent) gtag('consent', 'update', {analytics_storage: gsConsent[1]});
gtag('js', new Date());
gtag('config', ${JSON.stringify(id)});`;
