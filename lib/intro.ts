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
 */

/** Where the tab remembers that it has seen the intro. */
const KEY = "gs-intro-played";

export const introScript = `(function(){try{if(location.pathname!=="/")return;if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;if(sessionStorage.getItem(${JSON.stringify(KEY)}))return;sessionStorage.setItem(${JSON.stringify(KEY)},"1");document.documentElement.setAttribute("data-intro","pre")}catch(e){}})();`;
