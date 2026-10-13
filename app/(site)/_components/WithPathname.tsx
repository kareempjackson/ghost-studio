"use client";

import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";

function Read({ children }: { children: (pathname: string) => ReactNode }) {
  return children(usePathname());
}

/**
 * Hands its children the address being read, so the navigation can mark
 * where the reader is.
 *
 * Under Cache Components a page prerendered without its params — a project
 * published after the build, say — does not know its address until the
 * request, and usePathname suspends there. Inside this boundary that holds
 * back only these children, which render meanwhile as if nowhere were
 * current, and the rest of the page is prerendered as before.
 */
export function WithPathname({
  children,
}: {
  children: (pathname: string | null) => ReactNode;
}) {
  return (
    <Suspense fallback={children(null)}>
      <Read>{children}</Read>
    </Suspense>
  );
}
