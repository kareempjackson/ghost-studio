"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/portal/types";
import { projectSections } from "./sections";
import { LABEL } from "./ui";

/**
 * A project's sections, in two shapes from one list.
 *
 * `rail`: the floating column of discs at the left of a wide screen, the
 * current one black. Each disc names itself on hover in a small black tag,
 * so the rail stays narrow without being a guessing game.
 *
 * `row`: on a phone the same sections as one capsule that scrolls sideways
 * under the project's title.
 */
export function ProjectNav({
  slug,
  role,
  variant,
}: {
  slug: string;
  role: Role;
  variant: "rail" | "row";
}) {
  const path = usePathname();
  const sections = projectSections(slug, role);
  const isActive = (href: string, exact?: boolean) =>
    exact ? path === href : path === href || path.startsWith(`${href}/`);

  if (variant === "row") {
    return (
      <nav aria-label="Project" className="gs-no-bar -mx-3 overflow-x-auto px-3 py-1 sm:-mx-4 sm:px-4 lg:hidden">
        <ul className="gs-card flex w-max gap-0.5 rounded-pill p-1">
          {sections.map(({ href, label, Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`gs-press inline-flex h-8 items-center gap-1.5 rounded-pill px-3 ${LABEL} ${active ? "gs-ink" : "text-ink-800"}`}
                >
                  <Icon aria-hidden className="size-3.5" strokeWidth={1.5} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label="Project" className="sticky top-[5rem] hidden self-start lg:block">
      <ul className="gs-card flex flex-col gap-1 rounded-pill p-1">
        {sections.map(({ href, label, Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <li key={href} className="group relative">
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={`gs-press grid size-10 place-items-center rounded-full ${active ? "gs-ink" : "text-ink-700 hover:bg-ink-950/[0.05] hover:text-primary"}`}
              >
                <Icon aria-hidden className="size-4" strokeWidth={1.5} />
              </Link>
              <span
                aria-hidden
                className={`pointer-events-none absolute top-1/2 left-[calc(100%+0.625rem)] z-10 -translate-x-1 -translate-y-1/2 rounded-pill bg-ink-950 px-2.5 py-1.5 whitespace-nowrap text-white opacity-0 transition duration-200 group-focus-within:translate-x-0 group-focus-within:opacity-100 group-hover:translate-x-0 group-hover:opacity-100 ${LABEL}`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
