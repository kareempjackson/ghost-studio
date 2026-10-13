import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProjectSettings } from "../../../../../_components/project/ProjectSettings";
import { SkeletonCard } from "../../../../../_components/ui";
import { getProjectSettings } from "@/lib/portal/data";
import { replyAddress } from "@/lib/portal/mail";
import { getViewer } from "@/lib/portal/viewer";

export const metadata: Metadata = { title: "Project settings" };

export default function ProjectSettingsPage({ params }: PageProps<"/portal/projects/[project]/settings">) {
  return (
    <Suspense fallback={<SkeletonCard className="h-96" lines={6} />}>
      {params.then(({ project }) => (
        <Settings slug={project} />
      ))}
    </Suspense>
  );
}

async function Settings({ slug }: { slug: string }) {
  const viewer = await getViewer();
  const data = await getProjectSettings(slug, viewer);
  if (!data) notFound();
  const { project, org, team, others } = data;
  return (
    <ProjectSettings
      project={{ name: project.name, code: project.code, status: project.status, targetOn: project.targetOn, chip: project.chip, summary: project.summary, org: org.name }}
      members={team}
      others={others}
      reply={replyAddress(project.slug)}
    />
  );
}
