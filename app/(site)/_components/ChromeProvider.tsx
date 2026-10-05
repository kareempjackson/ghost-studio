"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Chrome } from "@/sanity/types";

const ChromeContext = createContext<Chrome | null>(null);

/**
 * What every page carries — the address, the navigation, the footer and the
 * chat — fetched once in the layout and handed down here, so the header,
 * menu, footer and chat read it without each page fetching it again.
 */
export function ChromeProvider({ chrome, children }: { chrome: Chrome; children: ReactNode }) {
  return <ChromeContext.Provider value={chrome}>{children}</ChromeContext.Provider>;
}

export function useChrome(): Chrome {
  const chrome = useContext(ChromeContext);
  if (!chrome) throw new Error("useChrome must be used inside <ChromeProvider>");
  return chrome;
}
