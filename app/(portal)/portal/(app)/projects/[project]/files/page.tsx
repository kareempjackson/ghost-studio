import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FileBrowser } from "../../../../../_components/files/FileBrowser";
import { SkeletonCard } from "../../../../../_components/ui";
import { listFiles } from "@/lib/portal/data";
import { getViewer } from "@/lib/portal/viewer";

export const metadata: Metadata = { title: "Files" };

export default function FilesPage({ params }: PageProps<"/portal/projects/[project]/files">) {
  return (
    <Suspense fallback={<SkeletonCard className="h-96" />}>
      {params.then(({ project }) => (
        <Files slug={project} />
      ))}
    </Suspense>
  );
}

async function Files({ slug }: { slug: string }) {
  const viewer = await getViewer();
  const data = await listFiles(slug, viewer);
  if (!data) notFound();
  return <FileBrowser files={data.files} ground={data.project.ground} />;
}
