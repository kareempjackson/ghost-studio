import { ArrowLeft, MessageCircle, Upload } from "lucide-react";
import { notFound } from "next/navigation";
import { getProject } from "@/lib/portal/data";
import { day } from "@/lib/portal/format";
import { getViewer } from "@/lib/portal/viewer";
import { ProjectNav } from "../ProjectNav";
import { AvatarStack, Chip, FieldPill, H1, IconButton, META, Pill, ProjectStatus } from "../ui";

/**
 * The head of every project page, from the references' "Load Plan": a way
 * back, the project's name large and light, its code beside its colour, and
 * at the right the people and the one thing to do next.
 *
 * Clients see the studio and their own colleagues in the team, not the
 * studio's contractors: who the studio hires is the studio's business.
 */
export async function ProjectHeader({ slug }: { slug: string }) {
  const viewer = await getViewer();
  const view = await getProject(slug, viewer);
  if (!view) notFound();
  const { project, org, lead, team } = view;
  const people = team
    .filter(({ role }) => viewer.role !== "client" || role !== "contractor")
    .map(({ person }) => person);

  return (
    <header className="gs-rise grid gap-4 pt-3 pb-4 lg:pt-5 lg:pb-5">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex items-start gap-4">
          <IconButton label="All projects" href="/portal/projects" className="mt-0.5 hidden sm:grid">
            <ArrowLeft aria-hidden className="size-4" strokeWidth={1.5} />
          </IconButton>
          <div className="grid min-w-0 gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Chip colour={project.chip}>{project.code}</Chip>
              <ProjectStatus status={project.status} />
              <span className={META}>{org.name}</span>
            </div>
            <h1 className={H1}>{project.name}</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1">
            <AvatarStack people={people} max={4} />
          </span>
          <FieldPill label="Lead" value={lead.name.split(" ")[0]} />
          <FieldPill label="Due" value={day(project.targetOn)} />
          {viewer.role === "client" ? (
            <Pill tone="ink" href={`/portal/projects/${slug}/messages`}>
              <MessageCircle aria-hidden className="size-4" strokeWidth={1.5} />
              Message the studio
            </Pill>
          ) : (
            <Pill tone="ink" href={`/portal/projects/${slug}/reviews?submit=1`}>
              <Upload aria-hidden className="size-4" strokeWidth={1.5} />
              Submit for review
            </Pill>
          )}
        </div>
      </div>
      <ProjectNav slug={slug} role={viewer.role} variant="row" />
    </header>
  );
}

/** The rail, once the viewer is known: the studio gets Settings. */
export async function ProjectRail({ slug }: { slug: string }) {
  const viewer = await getViewer();
  return <ProjectNav slug={slug} role={viewer.role} variant="rail" />;
}

export function ProjectHeaderFallback() {
  return (
    <div aria-hidden className="grid gap-3 pt-5 pb-6">
      <div className="h-5 w-48 animate-pulse rounded-pill bg-ink-950/[0.05]" />
      <div className="h-11 w-2/3 max-w-[28rem] animate-pulse rounded-[1rem] bg-ink-950/[0.05]" />
    </div>
  );
}
