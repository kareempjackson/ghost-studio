/**
 * Ghost Savvy Studios — Google Analytics.
 *
 * The Google tag (gtag.js), set in <head> of every page on the site by
 * app/(site)/layout.tsx. Moves inside the site don't reload the page, so only
 * the first view is reported here; GA4's enhanced measurement counts the rest
 * from the browser's history changes.
 *
 * Only production builds carry it, so `next dev` stays out of the reports.
 */

export const GA_ID = "G-BPMZV2P5TG";

export const gtagSrc = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;

export const gtagScript = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`;

export const loadsAnalytics = process.env.NODE_ENV === "production";
