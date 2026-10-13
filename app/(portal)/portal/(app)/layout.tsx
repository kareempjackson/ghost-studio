import { Suspense } from "react";
import { TopBar, TopBarFallback } from "../../_components/TopBar";
import { ViewAs } from "../../_components/ViewAs";
import { getViewer } from "@/lib/portal/viewer";

/**
 * Everything behind sign-in: the top bar, the page, and — while this is a
 * prototype — the "View as" switch. The bar and the switch read who is
 * looking, so each streams in behind its own boundary while the rest of the
 * frame is already on screen.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<TopBarFallback />}>
        <TopBar />
      </Suspense>
      <main className="mx-auto w-full max-w-[100rem] px-3 pt-2 pb-28 sm:px-4 lg:px-6">{children}</main>
      <Suspense>
        <Switcher />
      </Suspense>
    </>
  );
}

async function Switcher() {
  const { role } = await getViewer();
  return <ViewAs role={role} />;
}
