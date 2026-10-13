import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { NoteWorkspace } from "../../../../../../_components/notes/NoteWorkspace";
import { SkeletonCard } from "../../../../../../_components/ui";
import { getNote, getProject } from "@/lib/portal/data";
import { TODAY } from "@/lib/portal/format";
import { getViewer } from "@/lib/portal/viewer";

export const metadata: Metadata = { title: "Note" };

/** One meeting's notes. `new` opens an empty note for the studio and contractors. */
export default function NotePage({ params }: PageProps<"/portal/projects/[project]/notes/[note]">) {
  return (
    <Suspense fallback={<SkeletonCard className="h-[32rem]" lines={8} />}>
      {params.then(({ project, note }) => (
        <Note slug={project} id={note} />
      ))}
    </Suspense>
  );
}

async function Note({ slug, id }: { slug: string; id: string }) {
  const viewer = await getViewer();
  const back = `/portal/projects/${slug}/notes`;

  if (id === "new") {
    const view = await getProject(slug, viewer);
    if (!view || viewer.role === "client") notFound();
    return (
      <NoteWorkspace
        isNew
        backHref={back}
        viewer={{ personId: viewer.person.id, role: viewer.role }}
        people={view.team.map((t) => t.person)}
        note={{
          id: "new",
          projectId: view.project.id,
          title: "",
          metOn: TODAY.slice(0, 10),
          attendeeIds: [viewer.person.id],
          guests: [],
          body: "",
          visibility: viewer.role === "contractor" ? "internal" : "shared",
          createdBy: viewer.person.id,
          updatedAt: TODAY,
          actions: [],
        }}
      />
    );
  }

  const data = await getNote(slug, id, viewer);
  if (!data) notFound();
  return <NoteWorkspace backHref={back} viewer={{ personId: viewer.person.id, role: viewer.role }} people={data.people} note={data.note} />;
}
