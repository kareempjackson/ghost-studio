import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Conversation } from "../../../../../_components/messages/Conversation";
import { audienceLine } from "../../../../../_components/messages/audience";
import { SkeletonCard } from "../../../../../_components/ui";
import { getThread } from "@/lib/portal/data";
import { getViewer } from "@/lib/portal/viewer";

export const metadata: Metadata = { title: "Messages" };

/**
 * A project's conversation. The client and the studio share one thread; the
 * studio and its contractors share another. The studio, in both, switches
 * between them with `?kind=`.
 */
export default function ProjectMessagesPage(props: PageProps<"/portal/projects/[project]/messages">) {
  return (
    <Suspense fallback={<SkeletonCard className="h-[36rem]" lines={6} />}>
      <Thread params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Thread({
  params,
  searchParams,
}: Pick<PageProps<"/portal/projects/[project]/messages">, "params" | "searchParams">) {
  const [{ project: slug }, { kind }] = await Promise.all([params, searchParams]);
  const viewer = await getViewer();
  const data = await getThread(slug, kind === "internal" ? "internal" : kind === "client" ? "client" : undefined, viewer);
  if (!data) notFound();
  const { project, thread, kinds, firstUnread, people, team } = data;
  const base = `/portal/projects/${slug}/messages`;

  return (
    <Conversation
      key={thread.id}
      className="gs-rise h-[78dvh] lg:h-[calc(100dvh-15.5rem)]"
      viewer={{ personId: viewer.person.id, role: viewer.role }}
      people={people}
      messages={thread.messages}
      firstUnread={firstUnread}
      kind={thread.kind}
      kinds={kinds.map((k) => ({ kind: k, href: `${base}?kind=${k}`, active: k === thread.kind }))}
      project={{ code: project.code, name: project.name, chip: project.chip, href: `/portal/projects/${slug}` }}
      audience={audienceLine(
        thread.kind,
        viewer.role,
        team.filter((m) => m.role === "client").map((m) => m.person),
      )}
    />
  );
}
