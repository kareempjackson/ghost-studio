import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { ItemCard } from "@/lib/portal/data";
import { day, pad } from "@/lib/portal/format";
import { stageChip } from "@/lib/portal/stage";
import type { Role } from "@/lib/portal/types";
import { Avatar, Chip, CornerArrow, Empty, META, TITLE } from "../ui";

/**
 * Work in review as cards: the latest version on its project's ground, the
 * stage as the viewer should read it, and the way in. Batch 3 adds the
 * stage tabs and the upload sheet; this is the list they'll sit over.
 */
export function ReviewGrid({ items, role, showProject }: { items: readonly ItemCard[]; role: Role; showProject: boolean }) {
  if (!items.length) {
    return <Empty title="Nothing in review." body="When work is shared here, it shows up as a card." />;
  }
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3">
      {items.map((item, n) => {
        const chip = stageChip(item.stage, role, item.mine);
        return (
          <li key={item.id} className="gs-rise" style={{ "--i": n } as CSSProperties}>
            <Link href={item.href} className="group gs-card grid gap-4 rounded-[1.75rem] p-2.5 pb-5 transition-shadow duration-500 hover:shadow-[0_0_0_1px_rgb(14_13_11/0.16)]">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[1.25rem]" style={{ backgroundColor: item.project.ground, boxShadow: "inset 0 0 0 1px rgb(14 13 11 / 0.05)" }}>
                {item.thumb ? (
                  <Image src={item.thumb} alt="" fill unoptimized className="object-cover" />
                ) : null}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {showProject ? (
                    <Chip colour={item.project.chip} className="bg-white">
                      {item.project.code}
                    </Chip>
                  ) : null}
                  <Chip tone="ink">v{pad(item.version)}</Chip>
                </div>
                <CornerArrow label={`Open ${item.title}`} tone="white" className="absolute right-3 bottom-3" />
              </div>
              <div className="grid gap-2.5 px-2.5">
                <div className="flex items-start justify-between gap-3">
                  <p className={`${TITLE} text-[1rem] transition-colors group-hover:text-accent`}>{item.title}</p>
                  <Chip tone={chip.tone}>{chip.label}</Chip>
                </div>
                <p className={`line-clamp-2 ${META}`}>{item.summary}</p>
                <div className="flex items-center gap-2">
                  <Avatar person={item.submittedBy} size="xs" />
                  <span className={`${META} text-[0.75rem]`}>
                    {showProject ? `${item.project.name} · ` : ""}
                    {item.milestone ?? ""}
                    {item.dueOn ? ` · Due ${day(item.dueOn)}` : ""}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
