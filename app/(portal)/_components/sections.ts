import {
  Flag,
  Folder,
  Layers,
  LayoutGrid,
  MessageCircle,
  NotebookPen,
  Receipt,
  Settings2,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/portal/types";
import type { NavItem } from "./PillNav";

/** The top bar's routes, by role. The studio also runs clients and the team. */
export function primaryNav(role: Role, counts: { messages: number; reviews: number }): NavItem[] {
  const base: NavItem[] = [
    { href: "/portal", label: "Home", exact: true },
    { href: "/portal/projects", label: "Projects" },
  ];
  const work: NavItem[] = [
    { href: "/portal/reviews", label: "Reviews", count: counts.reviews },
    { href: "/portal/messages", label: "Messages", count: counts.messages },
  ];
  if (role === "studio") {
    return [
      ...base,
      { href: "/portal/clients", label: "Clients" },
      ...work,
      { href: "/portal/payments", label: "Payments" },
      { href: "/portal/team", label: "Team" },
    ];
  }
  return [...base, ...work, { href: "/portal/payments", label: role === "contractor" ? "Invoices" : "Payments" }];
}

export interface Section {
  readonly href: string;
  readonly label: string;
  readonly Icon: LucideIcon;
  readonly exact?: boolean;
}

/** A project's parts: the rail on a wide screen, a row of pills on a phone. */
export function projectSections(slug: string, role: Role): Section[] {
  const base = `/portal/projects/${slug}`;
  const sections: Section[] = [
    { href: base, label: "Overview", Icon: LayoutGrid, exact: true },
    { href: `${base}/reviews`, label: "Reviews", Icon: Layers },
    { href: `${base}/milestones`, label: "Milestones", Icon: Flag },
    { href: `${base}/messages`, label: "Messages", Icon: MessageCircle },
    { href: `${base}/notes`, label: "Notes", Icon: NotebookPen },
    { href: `${base}/files`, label: "Files", Icon: Folder },
    { href: `${base}/payments`, label: role === "contractor" ? "Invoices" : "Payments", Icon: Receipt },
  ];
  if (role === "studio") sections.push({ href: `${base}/settings`, label: "Settings", Icon: Settings2 });
  return sections;
}
