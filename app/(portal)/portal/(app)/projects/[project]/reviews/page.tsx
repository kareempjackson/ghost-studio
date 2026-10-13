import type { Metadata } from "next";
import { Suspense } from "react";
import { ReviewBoard } from "../../../../../_components/review/ReviewBoard";
import { SkeletonCard } from "../../../../../_components/ui";
import { listReviews, submitTargets } from "@/lib/portal/data";
import { getViewer } from "@/lib/portal/viewer";

export const metadata: Metadata = { title: "Reviews" };

/** One project's work in review. The header's "Submit for review" lands here with `?submit=1`. */
export default function ProjectReviewsPage(props: PageProps<"/portal/projects/[project]/reviews">) {
  return (
    <Suspense fallback={<SkeletonCard className="h-96" />}>
      <Reviews params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Reviews({ params, searchParams }: Pick<PageProps<"/portal/projects/[project]/reviews">, "params" | "searchParams">) {
  const [{ project: slug }, { submit }] = await Promise.all([params, searchParams]);
  const viewer = await getViewer();
  const [items, targets] = await Promise.all([listReviews(viewer, slug), submitTargets(viewer, slug)]);
  return <ReviewBoard items={items} role={viewer.role} showProject={false} projects={targets} openSubmit={submit === "1"} />;
}
