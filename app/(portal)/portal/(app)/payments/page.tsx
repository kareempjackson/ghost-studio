import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentsBoard } from "../../../_components/payments/PaymentsBoard";
import { PageHead, SkeletonCard } from "../../../_components/ui";
import { invoiceTargets, listInvoices } from "@/lib/portal/data";
import { money } from "@/lib/portal/format";
import { getViewer } from "@/lib/portal/viewer";

export const metadata: Metadata = { title: "Payments" };

/**
 * Money across every project. The studio switches between what clients owe
 * it and what it owes contractors (`?tab=payables`); a client sees their
 * invoices; a contractor sees theirs to the studio.
 */
export default function PaymentsPage(props: PageProps<"/portal/payments">) {
  return (
    <Suspense fallback={<SkeletonCard className="mt-24 h-96" lines={6} />}>
      <Payments searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Payments({ searchParams }: Pick<PageProps<"/portal/payments">, "searchParams">) {
  const { tab } = await searchParams;
  const viewer = await getViewer();
  const direction = viewer.role === "studio" && tab === "payables" ? "payable" : "receivable";
  const [ledger, targets] = await Promise.all([listInvoices(viewer, { direction }), invoiceTargets(viewer)]);
  const { rows, summary } = ledger!;
  const title = viewer.role === "contractor" ? "Invoices" : "Payments";
  const eyebrow =
    viewer.role === "contractor"
      ? `${money(summary.outstanding)} owed to you`
      : direction === "payable"
        ? `${money(summary.outstanding)} owed to contractors`
        : `${money(summary.outstanding)} outstanding`;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      <PageHead eyebrow={eyebrow} title={title} />
      <PaymentsBoard
        key={direction}
        rows={rows}
        role={viewer.role}
        direction={ledger!.direction}
        showProject
        tabs={
          viewer.role === "studio"
            ? [
                { label: "From clients", href: "/portal/payments", active: direction === "receivable" },
                { label: "To contractors", href: "/portal/payments?tab=payables", active: direction === "payable" },
              ]
            : undefined
        }
        projects={direction === "payable" && viewer.role === "studio" ? [] : targets.projects}
        nextNumber={targets.nextNumber}
      />
    </div>
  );
}
