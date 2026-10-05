"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * The footer, lying underneath the page.
 *
 * The footer stays put at the bottom of the screen, behind everything, and the
 * page scrolls up off it: the last band's bottom edge rises and the footer is
 * uncovered where it has been lying the whole time. Nothing about the footer
 * moves or fades — the page is the thing in motion, which is the point.
 *
 * Two notes on the build:
 *
 * 1. It is `position: sticky` at `bottom: 0`, not `fixed` with a spacer. The
 *    footer stays in the document, so the page is exactly as long as it was,
 *    the scrollbar is honest, and there is no second copy of the footer's
 *    height to keep in step with the real one. `main` sits one layer above it
 *    with its own ground, which is what does the covering.
 * 2. It only lies underneath when it fits on the screen. A sticky box taller
 *    than the viewport pins its bottom edge and pushes its top up under the
 *    page, where the reader could never reach it — so on a short window the
 *    footer is measured, found too tall, and simply scrolls in like any band.
 */
export function FooterReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [fits, setFits] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () => setFits(node.offsetHeight <= window.innerHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-reveal={fits ? "true" : "false"}
      data-page-behind
      className="data-[reveal=true]:sticky data-[reveal=true]:bottom-0 data-[reveal=true]:z-0"
    >
      {children}
    </div>
  );
}
