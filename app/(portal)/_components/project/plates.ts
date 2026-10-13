import type { ProjectCard } from "@/lib/portal/data";
import type { PlateData } from "./ProjectGrid";

/** A project as its plate needs it: plain data, ready to cross to the client. */
export function toPlate(card: ProjectCard): PlateData {
  const { project, org, next } = card;
  return {
    slug: project.slug,
    code: project.code,
    name: project.name,
    summary: project.summary,
    status: project.status,
    ground: project.ground,
    chip: project.chip,
    org: org.name,
    done: card.done,
    total: card.milestoneCount,
    current: next?.position,
    next: next?.title,
    waiting: card.waiting,
  };
}
