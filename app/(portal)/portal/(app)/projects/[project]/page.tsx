import type { Metadata } from "next";
import { Suspense } from "react";
import { Overview } from "../../../../_components/project/Overview";
import { SkeletonCard } from "../../../../_components/ui";

export const metadata: Metadata = { title: "Project" };

export default function ProjectPage({ params }: PageProps<"/portal/projects/[project]">) {
  return (
    <Suspense fallback={<OverviewFallback />}>
      {params.then(({ project }) => (
        <Overview slug={project} />
      ))}
    </Suspense>
  );
}

function OverviewFallback() {
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <SkeletonCard className="h-72 lg:col-span-8" />
      <SkeletonCard className="h-72 lg:col-span-4" />
      <SkeletonCard className="h-80 lg:col-span-7" />
      <SkeletonCard className="h-80 lg:col-span-5" />
    </div>
  );
}
