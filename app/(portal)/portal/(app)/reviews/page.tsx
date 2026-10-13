import type { Metadata } from "next";
import { Suspense } from "react";
import { ReviewBoard } from "../../../_components/review/ReviewBoard";
import { PageHead, SkeletonCard } from "../../../_components/ui";
import { listReviews, submitTargets } from "@/lib/portal/data";
import { pad } from "@/lib/portal/format";
import { waitsOn } from "@/lib/portal/stage";
import { getViewer } from "@/lib/portal/viewer";

export const metadata: Metadata = { title: "Reviews" };

/** All the work in review across the viewer's projects. `?submit=1` opens the submit sheet. */
export default function ReviewsPage(props: PageProps<"/portal/reviews">) {
  return (
    <Suspense fallback={<SkeletonCard className="mt-24 h-96" />}>
      <Reviews searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Reviews({ searchParams }: Pick<PageProps<"/portal/reviews">, "searchParams">) {
  const { submit } = await searchParams;
  const viewer = await getViewer();
  const [items, targets] = await Promise.all([listReviews(viewer), submitTargets(viewer)]);
  const waiting = items.filter((i) => waitsOn(i.stage, viewer.role, i.mine)).length;
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      <PageHead eyebrow={waiting ? `${pad(waiting)} waiting on you` : "Nothing waiting on you"} title="Reviews" />
      <ReviewBoard items={items} role={viewer.role} showProject projects={targets} openSubmit={submit === "1"} />
    </div>
  );
}
