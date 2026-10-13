import type { Metadata } from "next";
import { Suspense } from "react";
import { ClientHome } from "../../_components/home/ClientHome";
import { ContractorHome } from "../../_components/home/ContractorHome";
import { StudioHome } from "../../_components/home/StudioHome";
import { SkeletonCard } from "../../_components/ui";
import { getViewer } from "@/lib/portal/viewer";

export const metadata: Metadata = { title: "Home" };

/** Home is a different room for each role: the client's work, the studio's day, the contractor's queue. */
export default function HomePage() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <Home />
    </Suspense>
  );
}

async function Home() {
  const viewer = await getViewer();
  if (viewer.role === "client") return <ClientHome viewer={viewer} />;
  if (viewer.role === "studio") return <StudioHome viewer={viewer} />;
  return <ContractorHome viewer={viewer} />;
}

function HomeFallback() {
  return (
    <div className="grid gap-4 pt-10">
      <div className="h-20 w-2/3 animate-pulse rounded-[1.5rem] bg-ink-950/[0.04]" />
      <div className="grid gap-4 lg:grid-cols-12">
        <SkeletonCard className="h-[28rem] lg:col-span-7" />
        <SkeletonCard className="h-[28rem] lg:col-span-5" />
      </div>
    </div>
  );
}
