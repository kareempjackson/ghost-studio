import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsForm } from "../../../_components/settings/SettingsForm";
import { PageHead, SkeletonCard } from "../../../_components/ui";
import { orgs } from "@/lib/portal/fixtures";
import { getViewer } from "@/lib/portal/viewer";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <Suspense fallback={<SkeletonCard className="mt-24 h-96" lines={6} />}>
      <Settings />
    </Suspense>
  );
}

async function Settings() {
  const viewer = await getViewer();
  const org = viewer.person.orgId ? orgs.find((o) => o.id === viewer.person.orgId)?.name : undefined;
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      <PageHead eyebrow="Your account" title="Settings" />
      <SettingsForm person={viewer.person} role={viewer.role} org={org} />
    </div>
  );
}
