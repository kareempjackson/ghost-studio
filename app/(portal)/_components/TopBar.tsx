import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { Mark } from "@/app/(site)/_components/Mark";
import { getNavCounts } from "@/lib/portal/data";
import { orgs } from "@/lib/portal/fixtures";
import { ROLE_LABEL } from "@/lib/portal/roles";
import { getViewer } from "@/lib/portal/viewer";
import { PillNav } from "./PillNav";
import { primaryNav } from "./sections";
import { Avatar, IconButton, LABEL } from "./ui";

const ROW = "mx-auto flex h-16 w-full max-w-[100rem] items-center gap-3 px-3 sm:px-4 lg:gap-6 lg:px-6";

/**
 * The portal's top bar, on the desk rather than a card: the mark, the
 * routes in one capsule, and at the right the two round tools and who is
 * signed in. On a phone the routes drop to their own row and scroll.
 *
 * Reads the viewer, so it streams; TopBarFallback holds its place.
 */
export async function TopBar() {
  const viewer = await getViewer();
  const counts = await getNavCounts(viewer);
  const items = primaryNav(viewer.role, counts);
  const org = viewer.person.orgId ? orgs.find((o) => o.id === viewer.person.orgId)?.name : undefined;

  return (
    <header className="sticky top-0 z-40 bg-canvas">
      <div className={ROW}>
        <Home />
        <div className="hidden lg:block">
          <PillNav items={items} id="wide" />
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <IconButton label="Search">
            <Search aria-hidden className="size-4" strokeWidth={1.5} />
          </IconButton>
          <IconButton label="Notifications" badge={counts.messages + counts.reviews > 0}>
            <Bell aria-hidden className="size-4" strokeWidth={1.5} />
          </IconButton>
          <Link
            href="/portal/settings"
            className="gs-press gs-card ml-1 flex h-9 items-center gap-2.5 rounded-pill p-1 hover:bg-ink-50 sm:pl-3.5"
          >
            <span className="hidden text-right sm:grid sm:gap-0.5">
              <span className="text-[0.75rem] leading-none font-medium tracking-[-0.01em]">{viewer.person.name}</span>
              <span className={`${LABEL} text-[0.5625rem] text-tertiary`}>{org ?? ROLE_LABEL[viewer.role]}</span>
            </span>
            <Avatar person={viewer.person} size="sm" />
          </Link>
        </div>
      </div>
      <div className="gs-no-bar overflow-x-auto px-3 pb-2.5 sm:px-4 lg:hidden">
        <div className="w-max">
          <PillNav items={items} id="narrow" />
        </div>
      </div>
    </header>
  );
}

function Home() {
  return (
    <Link href="/portal" className="flex h-16 shrink-0 items-center" aria-label="Ghost Savvy Studios portal — home">
      <Mark className="size-20 shrink-0" decorative />
    </Link>
  );
}

/** The bar's shape while the viewer is read: the mark, and the capsule without labels. */
export function TopBarFallback() {
  return (
    <header className="sticky top-0 z-40 bg-canvas">
      <div className={ROW}>
        <Home />
        <span aria-hidden className="gs-card hidden h-10 w-[30rem] animate-pulse rounded-pill lg:block" />
        <span aria-hidden className="gs-card ml-auto h-9 w-40 animate-pulse rounded-pill" />
      </div>
    </header>
  );
}
