/**
 * Ghost Savvy Studios — the intro.
 *
 * It plays once per tab: the first time the home page loads in a tab, and not
 * again in that tab — a refresh goes straight to the page. A new tab plays it
 * again. That is `sessionStorage`, which lives exactly as long as the tab.
 * Moving around inside the site never replays it either.
 *
 * The decision is made by an inline script in <head>, before first paint, so
 * the finished page never flashes up first; it sets `data-intro="pre"` on
 * <html> and the intro layer takes it from there. Anyone who has asked for
 * reduced motion never gets it.
 *
 * `pre` is the layer held still: the mark waits below the screen and the pill
 * is shut, so there is nothing to see but an empty page. The clock starts at
 * `run`, which IntroOverlay sets as soon as the layer's drawings are ready —
 * the rise is then always seen from its foot, however long the page took to
 * arrive. The two timers below are this script's own, so neither the start
 * nor the hand-off waits on the bundle: if it is slow or never comes, the
 * intro still runs, and the page is still handed over.
 */

/** Where the tab remembers that it has seen the intro. */
const KEY = "gs-intro-played";

/** Longest the layer is held before it starts on its own. */
const START_BY = 2500;
/** Longest it is left up before the page is uncovered regardless. */
const HAND_OVER_BY = 9000;

const state = (root: string) =>
  `document.documentElement.setAttribute("data-intro",${JSON.stringify(root)})`;

export const introScript = `(function(){try{
if(location.pathname!=="/")return;
if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;
if(sessionStorage.getItem(${JSON.stringify(KEY)}))return;
sessionStorage.setItem(${JSON.stringify(KEY)},"1");
var r=document.documentElement;
r.setAttribute("data-intro","pre");
setTimeout(function(){if(r.getAttribute("data-intro")==="pre")${state("run")}},${START_BY});
setTimeout(function(){var s=r.getAttribute("data-intro");if(s==="pre"||s==="run"){${state("reveal")};setTimeout(function(){r.removeAttribute("data-intro")},1200)}},${HAND_OVER_BY});
}catch(e){}})();`
  .replace(/\n/g, "")
  .trim();
