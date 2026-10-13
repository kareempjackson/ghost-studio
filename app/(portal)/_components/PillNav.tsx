"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { LABEL } from "./ui";

export interface NavItem {
  readonly href: string;
  readonly label: string;
  /** Something waiting behind it: unread, or work to review. */
  readonly count?: number;
  /** Active only on this exact path, not below it (Home). */
  readonly exact?: boolean;
}

/**
 * The portal's top navigation: one white capsule holding the routes, the
 * current one in black. The black travels from route to route rather than
 * blinking between them, so the move reads as one place handing over to the
 * next.
 *
 * `id` keeps two copies apart (the phone row and the wide row) so each
 * black pill slides only within its own capsule.
 */
export function PillNav({ items, id }: { items: readonly NavItem[]; id: string }) {
  const path = usePathname();
  const isActive = (item: NavItem) =>
    item.exact ? path === item.href : path === item.href || path.startsWith(`${item.href}/`);

  return (
    <nav aria-label="Portal">
      <ul className="gs-card flex items-center gap-0.5 rounded-pill p-1">
        {items.map((item) => {
          const active = isActive(item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`gs-press relative inline-flex h-8 items-center gap-1.5 rounded-pill px-3.5 ${LABEL} text-[0.65625rem] ${active ? "" : "hover:bg-ink-950/[0.04]"}`}
              >
                {active ? (
                  <motion.span
                    layoutId={`${id}-active`}
                    aria-hidden
                    className="gs-ink absolute inset-0 rounded-pill"
                    transition={{ duration: 0.42, ease: [0.25, 1, 0.5, 1] }}
                  />
                ) : null}
                <span className={`relative transition-colors duration-[420ms] ${active ? "text-white" : "text-ink-800"}`}>
                  {item.label}
                </span>
                {item.count ? (
                  <span
                    className={`relative grid h-4 min-w-4 place-items-center rounded-full px-1 text-[0.5625rem] tracking-normal ${active ? "bg-white text-ink-950" : "bg-alert text-white"}`}
                  >
                    {item.count}
                    <span className="sr-only"> new</span>
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
