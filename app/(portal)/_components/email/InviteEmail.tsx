import { ArrowRight } from "lucide-react";
import { Mark } from "@/app/(site)/_components/Mark";
import { DISPLAY, LABEL, META } from "../ui";

export interface InviteEmailProps {
  readonly client: string;
  readonly first: string;
  readonly email: string;
  readonly project?: string;
  readonly lead: string;
  readonly note?: string;
}

/**
 * The invitation a client opens, drawn as it will arrive: the envelope —
 * who it's from, who it's to, the subject — then the letter itself, on the
 * portal's paper. One button, no password, nothing to set up.
 *
 * The same design becomes the React Email template when sending is wired.
 */
export function InviteEmail({ client, first, email, project, lead, note }: InviteEmailProps) {
  const place = project || client || "the studio";
  const subject = `You're invited to ${place}`;
  return (
    <figure aria-label="Invitation preview" className="gs-card overflow-hidden rounded-[1.75rem]">
      <dl className="grid gap-2 border-b border-ink-950/[0.06] px-5 py-4 text-[0.75rem]">
        {[
          ["From", "Ghost Savvy Studios <portal@ghostsavvy.com>"],
          ["To", email || "—"],
          ["Subject", subject],
        ].map(([k, v]) => (
          <div key={k} className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-baseline gap-2">
            <dt className={`${LABEL} text-tertiary`}>{k}</dt>
            <dd className={`truncate ${k === "Subject" ? "font-medium text-primary" : "text-secondary"}`}>{v}</dd>
          </div>
        ))}
      </dl>

      <div className="bg-ink-950/[0.03] px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto grid max-w-[30rem] gap-6 rounded-[1.25rem] bg-white p-7 shadow-card sm:p-9">
          <div className="flex items-center justify-between">
            <Mark className="size-20 shrink-0" decorative />
            <span className={`${LABEL} text-tertiary`}>Client portal</span>
          </div>
          <p className={`${DISPLAY} text-[2rem] sm:text-[2.25rem]`}>Welcome to {place}.</p>
          <p className="text-[0.875rem] leading-[1.65] text-secondary">
            Hi {first || "there"}, {lead} has set up a space for {client || "you"} on the Ghost Savvy portal. It&rsquo;s where
            you&rsquo;ll review work as it&rsquo;s ready, follow each milestone, talk with the studio, and find every invoice.
          </p>
          {note ? (
            <blockquote className="grid gap-1.5 border-l-2 border-ink-950/15 pl-4">
              <p className="text-[0.875rem] leading-[1.6] text-primary">{note}</p>
              <cite className={`${META} text-[0.75rem] not-italic`}>— {lead}</cite>
            </blockquote>
          ) : null}
          <span className={`gs-ink inline-flex h-11 items-center gap-2 justify-self-start rounded-pill pr-2 pl-5 ${LABEL} text-[0.6875rem]`}>
            Enter the portal
            <span className="grid size-7 place-items-center rounded-full bg-white/15">
              <ArrowRight aria-hidden className="size-3.5" strokeWidth={1.75} />
            </span>
          </span>
          <p className={`${META} text-[0.75rem] leading-[1.55]`}>
            No password. This link signs you in once; you can ask for a fresh one any time at portal.ghostsavvy.com.
          </p>
        </div>
        <figcaption className={`mt-5 text-center ${LABEL} text-tertiary`}>Ghost Savvy Studios · Sent because {lead.split(" ")[0]} invited you</figcaption>
      </div>
    </figure>
  );
}
