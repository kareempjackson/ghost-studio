import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { NewClientFlow } from "../../../../_components/clients/NewClientFlow";
import { PageHead, SkeletonCard } from "../../../../_components/ui";
import { listStudio } from "@/lib/portal/data";
import { projects } from "@/lib/portal/fixtures";
import { getViewer } from "@/lib/portal/viewer";

export const metadata: Metadata = { title: "New client" };

export default function NewClientPage() {
  return (
    <Suspense fallback={<SkeletonCard className="mt-24 h-[36rem]" lines={8} />}>
      <NewClient />
    </Suspense>
  );
}

async function NewClient() {
  const viewer = await getViewer();
  const studio = await listStudio(viewer);
  if (!studio) notFound();
  /* The next project code: one past the highest the studio has used. */
  const next = Math.max(...projects.map((p) => Number(p.code.replace("GS-", "")))) + 1;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      <PageHead eyebrow="Clients · New" title="Invite a client." lede="Set them up, and they'll get an email with a way straight in." />
      <NewClientFlow leads={studio.map((p) => ({ id: p.id, name: p.name }))} nextCode={`GS-${String(next).padStart(3, "0")}`} />
    </div>
  );
}
