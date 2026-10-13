import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectGrid } from "../../../_components/project/ProjectGrid";
import { toPlate } from "../../../_components/project/plates";
import { PageHead, Pill, SkeletonCard } from "../../../_components/ui";
import { listProjects } from "@/lib/portal/data";
import { pad } from "@/lib/portal/format";
import { getViewer } from "@/lib/portal/viewer";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      <Suspense fallback={<Fallback />}>
        <Projects />
      </Suspense>
    </div>
  );
}

async function Projects() {
  const viewer = await getViewer();
  const cards = await listProjects(viewer);
  return (
    <>
      <PageHead eyebrow={`${pad(cards.length)} projects`} title="Projects">
        {viewer.role === "studio" ? <Pill tone="ink">New project</Pill> : null}
      </PageHead>
      <ProjectGrid plates={cards.map(toPlate)} />
    </>
  );
}

function Fallback() {
  return (
    <div className="grid gap-4 pt-24 sm:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2].map((n) => (
        <SkeletonCard key={n} className="aspect-[5/4]" />
      ))}
    </div>
  );
}
