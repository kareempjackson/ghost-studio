import type { Metadata } from "next";
import { Suspense } from "react";
import { WelcomeFlow } from "../../../_components/auth/WelcomeFlow";
import { listProjects } from "@/lib/portal/data";
import { getViewer } from "@/lib/portal/viewer";

export const metadata: Metadata = { title: "Welcome" };

/** The first screen after an invitation's link. With auth it shows once; the prototype shows it whenever it's opened. */
export default function WelcomePage() {
  return (
    <main className="min-h-dvh p-2 sm:p-3 lg:p-4">
      <Suspense fallback={<div className="gs-card h-[calc(100dvh-2rem)] rounded-[2rem]" />}>
        <Welcome />
      </Suspense>
    </main>
  );
}

async function Welcome() {
  const viewer = await getViewer();
  const cards = await listProjects(viewer);
  const first = cards.find((c) => c.project.status === "active") ?? cards[0];
  return <WelcomeFlow name={viewer.person.name} title={viewer.person.title} project={first?.project.name} />;
}
