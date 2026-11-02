/**
 * Ghost Savvy Studios — the advertising pixels: LinkedIn's Insight Tag and
 * the Meta Pixel, each on once its ID is in Site settings › Tracking.
 *
 * Started by app/(site)/_components/Tracking.tsx, and only once the visitor
 * allows tracking cookies (lib/consent.ts). Neither can be stopped once it
 * runs, so a page where the visitor then says no is reloaded without them.
 *
 * Meta counts page views itself, moves inside the site included; LinkedIn
 * counts the first, and is told of each move after (`adPageView`). The
 * conversions come from track() (lib/track.ts): to Meta as its standard
 * events where one fits, and to LinkedIn for each one given a conversion ID
 * in Site settings.
 */

import type { BrowserTrackers, LinkedinConversion } from "./analytics";
import type { EventName, Params } from "./track";

type Pixels = Pick<BrowserTrackers, "linkedin" | "meta">;
type PixelWindow = {
  fbq?: (command: "track" | "trackCustom", name: string, params?: Params) => void;
  lintrk?: (command: "track", data?: { conversion_id: number }) => void;
};

/** Meta's name for each conversion: a standard event where one fits. */
const META: Partial<Record<EventName, ["track" | "trackCustom", string]>> = {
  enquiry_sent: ["track", "Lead"],
  newsletter_signup: ["track", "CompleteRegistration"],
  case_study_view: ["track", "ViewContent"],
  booking_opened: ["trackCustom", "BookingOpened"],
  deck_download: ["trackCustom", "DeckDownload"],
};

/** The conversion in Site settings each event counts as, for LinkedIn. */
const LINKEDIN: Partial<Record<EventName, LinkedinConversion>> = {
  enquiry_sent: "enquiry",
  newsletter_signup: "newsletter",
  booking_opened: "booking",
  deck_download: "deck",
};

/** The pixels' own loaders, as their platforms give them. */
const metaLoader = (id: string) =>
  `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', ${JSON.stringify(id)});
fbq('track', 'PageView');`;

const linkedinLoader = (partnerId: string) => `window._linkedin_partner_id = ${JSON.stringify(partnerId)};
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(window._linkedin_partner_id);
(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName('script')[0];var b=document.createElement('script');b.type='text/javascript';b.async=true;b.src='https://snap.licdn.com/li.lms-analytics/insight.min.js';s.parentNode.insertBefore(b,s)})(window.lintrk);`;

let loaded: Pixels | null = null;
/** The page LinkedIn last counted. */
let page = "";
/** Conversions from before the pixels start, if they are going to. */
const held: [EventName, Params][] = [];

const pixels = () => window as PixelWindow;

function run(code: string) {
  const script = document.createElement("script");
  script.text = code;
  document.head.append(script);
}

/** Starts the pixels that have an ID. Once a page load. */
export function loadAds(given: Pixels) {
  if (loaded || (!given.linkedin && !given.meta)) return;
  loaded = given;
  page = location.pathname;
  if (given.meta) run(metaLoader(given.meta));
  if (given.linkedin) run(linkedinLoader(given.linkedin.partnerId));
  for (const [name, params] of held.splice(0)) adEvent(name, params);
}

export const adsLoaded = () => loaded !== null;

/** A move inside the site, for LinkedIn: Meta sees them itself. */
export function adPageView() {
  if (!loaded?.linkedin || location.pathname === page) return;
  page = location.pathname;
  pixels().lintrk?.("track");
}

/** A conversion, to whichever pixel counts it. */
export function adEvent(name: EventName, params: Params) {
  const meta = META[name];
  const linkedin = LINKEDIN[name];
  if (!meta && !linkedin) return;
  if (!loaded) {
    if (held.length < 20) held.push([name, params]);
    return;
  }
  if (loaded.meta && meta) {
    pixels().fbq?.(meta[0], meta[1], name === "case_study_view" ? { content_name: params.slug ?? "" } : {});
  }
  const conversion = linkedin && loaded.linkedin?.conversions[linkedin];
  if (conversion) pixels().lintrk?.("track", { conversion_id: Number(conversion) });
}
