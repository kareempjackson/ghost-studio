import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PaymentsBoard } from "../../../../../_components/payments/PaymentsBoard";
import { SkeletonCard } from "../../../../../_components/ui";
import { invoiceTargets, listInvoices } from "@/lib/portal/data";
import { getViewer } from "@/lib/portal/viewer";

export const metadata: Metadata = { title: "Payments" };

/** One project's invoices: the client's bills, or — for a contractor — what they've billed the studio for it. */
export default function ProjectPaymentsPage(props: PageProps<"/portal/projects/[project]/payments">) {
  return (
    <Suspense fallback={<SkeletonCard className="h-96" lines={6} />}>
      <Payments params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Payments({ params, searchParams }: Pick<PageProps<"/portal/projects/[project]/payments">, "params" | "searchParams">) {
  const [{ project: slug }, { tab }] = await Promise.all([params, searchParams]);
  const viewer = await getViewer();
  const direction = viewer.role === "studio" && tab === "payables" ? "payable" : "receivable";
  const [ledger, targets] = await Promise.all([listInvoices(viewer, { slug, direction }), invoiceTargets(viewer, slug)]);
  if (!ledger) notFound();
  const base = `/portal/projects/${slug}/payments`;
  return (
    <PaymentsBoard
      key={direction}
      rows={ledger.rows}
      role={viewer.role}
      direction={ledger.direction}
      showProject={false}
      tabs={
        viewer.role === "studio"
          ? [
              { label: "From the client", href: base, active: direction === "receivable" },
              { label: "To contractors", href: `${base}?tab=payables`, active: direction === "payable" },
            ]
          : undefined
      }
      projects={direction === "payable" && viewer.role === "studio" ? [] : targets.projects}
      nextNumber={targets.nextNumber}
    />
  );
}
