import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ReviewWorkspace } from "../../../../../../_components/review/ReviewWorkspace";
import { SkeletonCard } from "../../../../../../_components/ui";
import { getReview } from "@/lib/portal/data";
import { getViewer } from "@/lib/portal/viewer";

export const metadata: Metadata = { title: "Review" };

export default function ReviewPage({ params }: PageProps<"/portal/projects/[project]/reviews/[item]">) {
  return (
    <Suspense fallback={<ReviewFallback />}>
      {params.then(({ project, item }) => (
        <Review slug={project} itemId={item} />
      ))}
    </Suspense>
  );
}

async function Review({ slug, itemId }: { slug: string; itemId: string }) {
  const viewer = await getViewer();
  const review = await getReview(slug, itemId, viewer);
  if (!review) notFound();
  const { project, org, item, milestone, people, team } = review;
  const client = team.find(({ role, person }) => role === "client" && person.status === "active")?.person;

  return (
    <ReviewWorkspace
      viewer={{ role: viewer.role, personId: viewer.person.id }}
      project={{ slug: project.slug, code: project.code, name: project.name, chip: project.chip, ground: project.ground }}
      org={org.name}
      clientName={client?.name.split(" ")[0] ?? org.name}
      item={item}
      milestone={milestone ? { position: milestone.position, title: milestone.title } : undefined}
      people={people}
    />
  );
}

function ReviewFallback() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <SkeletonCard className="h-[36rem]" lines={2} />
      <SkeletonCard className="h-[36rem]" lines={6} />
    </div>
  );
}
