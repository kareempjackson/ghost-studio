import { Suspense } from "react";
import {
  ProjectHeader,
  ProjectHeaderFallback,
  ProjectRail,
} from "../../../../_components/project/ProjectHeader";

/**
 * Every page inside a project: the floating rail at the left, the project's
 * head across the top, and the page under it. The project comes from the
 * URL and the rail from who is looking, so both stream; the frame around
 * them doesn't wait.
 */
export default function ProjectLayout({ children, params }: LayoutProps<"/portal/projects/[project]">) {
  return (
    <div className="lg:grid lg:grid-cols-[3.5rem_minmax(0,1fr)] lg:gap-5">
      <Suspense fallback={<div className="hidden w-14 lg:block" />}>
        {params.then(({ project }) => (
          <ProjectRail slug={project} />
        ))}
      </Suspense>
      <div className="min-w-0">
        <Suspense fallback={<ProjectHeaderFallback />}>
          {params.then(({ project }) => (
            <ProjectHeader slug={project} />
          ))}
        </Suspense>
        {children}
      </div>
    </div>
  );
}
