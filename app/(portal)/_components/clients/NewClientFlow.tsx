"use client";

import Link from "next/link";
import { ArrowLeft, Check, Plus, X } from "lucide-react";
import { useState } from "react";
import { ArrowPill } from "@/app/(site)/_components/ArrowPill";
import { InviteEmail } from "../email/InviteEmail";
import { Avatar, Card, Chip, DISPLAY, LABEL, META, OrgMark, Pill, TITLE } from "../ui";
import { Field } from "./ClientActions";

const COLOURS = ["#eedf4e", "#f2875f", "#8fa8f7", "#63cdab", "#c6a8f0", "#f1b8c6", "#d7e23f", "#9ad0e8"];
const STEPS = ["Client", "People", "Project", "Send"] as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Person {
  name: string;
  email: string;
  title: string;
}

/**
 * Creating a client is inviting them: four short steps — who they are, who
 * from their side gets in, the first project if there is one, and the note
 * that goes with the invitation — with the email they'll receive drawn live
 * beside the form, so nobody sends what they haven't seen.
 *
 * In the prototype nothing is stored or sent.
 */
export function NewClientFlow({
  leads,
  nextCode,
}: {
  leads: readonly { readonly id: string; readonly name: string }[];
  nextCode: string;
}) {
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [site, setSite] = useState("");
  const [colour, setColour] = useState(COLOURS[0]);
  const [people, setPeople] = useState<Person[]>([{ name: "", email: "", title: "" }]);
  const [withProject, setWithProject] = useState(true);
  const [project, setProject] = useState("");
  const [leadId, setLeadId] = useState(leads[0]?.id ?? "");
  const [due, setDue] = useState("");
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState(0);

  const lead = leads.find((l) => l.id === leadId)?.name ?? "The studio";
  const domain = site.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
  const ready = people.filter((p) => p.name.trim() && EMAIL.test(p.email.trim()));
  const valid = [
    name.trim().length > 1,
    ready.length > 0 && people.every((p) => (!p.name && !p.email) || (p.name.trim() && EMAIL.test(p.email.trim()))),
    !withProject || project.trim().length > 1,
    true,
  ];
  const shown = ready[Math.min(preview, ready.length - 1)] ?? people[0];
  const first = (s: string) => s.trim().split(/\s+/)[0] ?? "";
  const names = ready.map((p) => first(p.name));
  const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0];

  const reset = () => {
    setStep(0);
    setSent(false);
    setName("");
    setSite("");
    setPeople([{ name: "", email: "", title: "" }]);
    setProject("");
    setDue("");
    setNote("");
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <Card i={1} className="grid gap-7">
        {sent ? (
          <div className="grid gap-6 py-6">
            <span className="grid size-14 place-items-center rounded-full bg-acid-300">
              <Check aria-hidden className="size-6" strokeWidth={2} />
            </span>
            <div className="grid gap-3">
              <h2 className={`${DISPLAY} text-[2.25rem]`}>Invitations sent.</h2>
              <p className="max-w-[44ch] text-[0.9375rem] leading-[1.6] text-secondary">
                {list} will get an email with a link straight into {withProject && project ? project : name}. They&rsquo;ll show as{" "}
                <span className="text-primary">Invited</span> until they open it, and you can send it again from their client page.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Pill tone="ink" href="/portal/clients">
                Go to clients
              </Pill>
              <Pill tone="white" onClick={reset}>
                Invite another client
              </Pill>
            </div>
          </div>
        ) : (
          <>
            {/* Steps ----------------------------------------------------- */}
            <ol className="flex w-max max-w-full gap-0.5 rounded-pill bg-ink-950/[0.04] p-1" aria-label="Steps">
              {STEPS.map((s, n) => {
                const done = n < step;
                const reachable = n <= step || valid.slice(0, n).every(Boolean);
                return (
                  <li key={s}>
                    <button
                      type="button"
                      disabled={!reachable}
                      onClick={() => setStep(n)}
                      aria-current={n === step ? "step" : undefined}
                      className={`gs-press inline-flex h-8 items-center gap-2 rounded-pill pl-1.5 ${n === step ? "pr-3.5" : "pr-1.5 sm:pr-3.5"} ${LABEL} disabled:opacity-40 ${n === step ? "gs-ink" : "text-ink-700 hover:bg-white"}`}
                    >
                      <span
                        className={`grid size-5 place-items-center rounded-full text-[0.5625rem] ${n === step ? "bg-white/15" : done ? "bg-acid-300 text-ink-950" : "bg-ink-950/[0.06]"}`}
                      >
                        {done ? <Check aria-hidden className="size-3" strokeWidth={2.25} /> : n + 1}
                      </span>
                      <span className={n === step ? "" : "sr-only sm:not-sr-only"}>{s}</span>
                    </button>
                  </li>
                );
              })}
            </ol>

            {step === 0 ? (
              <Section title="Who's the client?" lede="Their name, the domain their mail comes from, and a colour for their projects.">
                <Field label="Company" value={name} onChange={setName} placeholder="Kinfolk Bakery" />
                <Field label="Website" value={site} onChange={setSite} placeholder="kinfolkbakery.com" hint="Mail from this domain is filed to them automatically." />
                <fieldset className="grid gap-2.5">
                  <legend className={`mb-2.5 ${LABEL} text-tertiary`}>Colour</legend>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {COLOURS.map((c) => (
                      <label key={c} className="relative cursor-pointer">
                        <input type="radio" name="colour" value={c} checked={colour === c} onChange={() => setColour(c)} className="peer sr-only" />
                        <span
                          className="gs-press block size-9 rounded-full ring-offset-2 ring-offset-white peer-checked:ring-2 peer-checked:ring-ink-950 peer-focus-visible:ring-2 peer-focus-visible:ring-focus"
                          style={{ backgroundColor: c, boxShadow: "inset 0 0 0 1px rgb(14 13 11 / 0.08)" }}
                        />
                        <span className="sr-only">{c}</span>
                      </label>
                    ))}
                    {name.trim() ? (
                      <span className="ml-2 flex items-center gap-2.5 border-l border-ink-950/[0.08] pl-4">
                        <OrgMark org={{ name, colour }} size="md" />
                        <span className={`${META} text-[0.75rem]`}>How they&rsquo;ll appear</span>
                      </span>
                    ) : null}
                  </div>
                </fieldset>
              </Section>
            ) : null}

            {step === 1 ? (
              <Section title="Who gets in?" lede="Each person gets their own invitation. Nobody needs a password.">
                <ul className="grid gap-2.5">
                  {people.map((p, n) => (
                    <li key={n} className="grid gap-3 rounded-[1.25rem] bg-ink-950/[0.025] p-4 ring-1 ring-inset ring-ink-950/[0.04]">
                      <div className="flex items-center justify-between">
                        <span className={`${LABEL} text-tertiary`}>Person {n + 1}</span>
                        {people.length > 1 ? (
                          <button
                            type="button"
                            aria-label={`Remove person ${n + 1}`}
                            onClick={() => setPeople((x) => x.filter((_, k) => k !== n))}
                            className="gs-press grid size-7 place-items-center rounded-full text-tertiary hover:bg-white hover:text-primary"
                          >
                            <X aria-hidden className="size-3.5" strokeWidth={1.75} />
                          </button>
                        ) : null}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Name" value={p.name} onChange={(v) => setPeople((x) => x.map((q, k) => (k === n ? { ...q, name: v } : q)))} placeholder="Ama Owusu" />
                        <Field
                          label="Email"
                          type="email"
                          value={p.email}
                          onChange={(v) => setPeople((x) => x.map((q, k) => (k === n ? { ...q, email: v } : q)))}
                          placeholder={`ama@${domain || "company.com"}`}
                        />
                      </div>
                      <Field label="Role (optional)" value={p.title} onChange={(v) => setPeople((x) => x.map((q, k) => (k === n ? { ...q, title: v } : q)))} placeholder="Founder" />
                    </li>
                  ))}
                </ul>
                <Pill tone="ghost" onClick={() => setPeople((x) => [...x, { name: "", email: "", title: "" }])} className="justify-self-start">
                  <Plus aria-hidden className="size-4" strokeWidth={1.75} />
                  Add someone
                </Pill>
              </Section>
            ) : null}

            {step === 2 ? (
              <Section title="Start a project?" lede="Their invitation can open straight onto it. You can always add one later.">
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-[1.25rem] bg-ink-950/[0.025] p-4 ring-1 ring-inset ring-ink-950/[0.04]">
                  <span className="grid gap-0.5">
                    <span className={`${TITLE} text-[0.875rem]`}>Create the first project now</span>
                    <span className={`${META} text-[0.75rem]`}>It&rsquo;ll be {nextCode}.</span>
                  </span>
                  <input type="checkbox" checked={withProject} onChange={(e) => setWithProject(e.target.checked)} className="peer sr-only" />
                  <span
                    aria-hidden
                    className="relative h-6 w-10 shrink-0 rounded-full bg-ink-950/15 transition-colors peer-checked:bg-ink-950 after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow-[0_0_0_1px_rgb(14_13_11/0.08)] after:transition-transform after:duration-300 peer-checked:after:translate-x-4"
                  />
                </label>
                {withProject ? (
                  <>
                    <Field label="Project name" value={project} onChange={setProject} placeholder="Second location launch" />
                    <fieldset className="grid gap-2.5">
                      <legend className={`mb-2.5 ${LABEL} text-tertiary`}>Lead</legend>
                      <div className="flex flex-wrap gap-2">
                        {leads.map((l) => (
                          <button
                            key={l.id}
                            type="button"
                            aria-pressed={leadId === l.id}
                            onClick={() => setLeadId(l.id)}
                            className={`gs-press inline-flex h-9 items-center gap-2 rounded-pill py-1 pr-3.5 pl-1 text-[0.8125rem] font-medium ${leadId === l.id ? "gs-ink" : "gs-card hover:bg-ink-50"}`}
                          >
                            <Avatar person={{ name: l.name, role: leadId === l.id ? "contractor" : "studio" }} size="sm" />
                            {l.name}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                    <Field label="Target date" type="date" value={due} onChange={setDue} />
                  </>
                ) : null}
              </Section>
            ) : null}

            {step === 3 ? (
              <Section title="Ready to send." lede="Check who's getting what, and add a line from you if you like.">
                <div className="grid gap-4 rounded-[1.25rem] bg-ink-950/[0.025] p-4 ring-1 ring-inset ring-ink-950/[0.04]">
                  <div className="flex items-center gap-3">
                    <OrgMark org={{ name: name || "?", colour }} />
                    <span className="grid gap-0.5">
                      <span className={`${TITLE} text-[0.875rem]`}>{name}</span>
                      <span className={`${META} text-[0.75rem]`}>{domain || "No domain"}</span>
                    </span>
                    {withProject && project ? (
                      <Chip colour={colour} className="ml-auto">
                        {nextCode} · {project}
                      </Chip>
                    ) : null}
                  </div>
                  <ul className="grid gap-2 border-t border-ink-950/[0.06] pt-4">
                    {ready.map((p) => (
                      <li key={p.email} className="flex items-center gap-3">
                        <Avatar person={{ name: p.name, role: "client" }} size="sm" />
                        <span className="text-[0.8125rem] font-medium">{p.name}</span>
                        <span className={`${META} truncate text-[0.75rem]`}>{p.email}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <label className="grid gap-2">
                  <span className={`${LABEL} text-tertiary`}>A note from you (optional)</span>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Looking forward to this one. The kickoff deck is already up."
                    className="resize-none rounded-[1rem] bg-ink-950/[0.035] px-4 py-3 text-[0.875rem] leading-[1.55] outline-none transition-shadow placeholder:text-ink-400 focus-visible:bg-white focus-visible:shadow-[0_0_0_1px_rgb(14_13_11/0.14)]"
                  />
                </label>
              </Section>
            ) : null}

            {/* Back and forth ------------------------------------------------ */}
            <div className="flex items-center justify-between gap-3 border-t border-ink-950/[0.06] pt-5">
              {step > 0 ? (
                <Pill tone="ghost" onClick={() => setStep((s) => s - 1)}>
                  <ArrowLeft aria-hidden className="size-4" strokeWidth={1.5} />
                  Back
                </Pill>
              ) : (
                <Link href="/portal/clients" className="text-[0.8125rem] text-tertiary transition-colors hover:text-primary">
                  Cancel
                </Link>
              )}
              {step < 3 ? (
                <Pill tone="ink" disabled={!valid[step]} onClick={() => setStep((s) => s + 1)}>
                  Continue
                </Pill>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                  }}
                >
                  <ArrowPill submit size="sm">
                    Send {ready.length} {ready.length === 1 ? "invitation" : "invitations"}
                  </ArrowPill>
                </form>
              )}
            </div>
          </>
        )}
      </Card>

      {/* The email, live ------------------------------------------------- */}
      <aside className="gs-rise grid gap-3 [--i:2] lg:sticky lg:top-[5rem]">
        <div className="flex items-center justify-between gap-3 px-1">
          <p className={`${LABEL} text-tertiary`}>What {first(shown?.name ?? "") || "they"} will get</p>
          {ready.length > 1 ? (
            <div role="group" aria-label="Preview for" className="flex gap-0.5 rounded-pill bg-ink-950/[0.045] p-0.5">
              {ready.map((p, n) => (
                <button
                  key={p.email}
                  type="button"
                  aria-pressed={n === preview}
                  onClick={() => setPreview(n)}
                  className={`gs-press h-6 rounded-pill px-2.5 text-[0.6875rem] font-medium ${n === preview ? "gs-ink" : "text-secondary"}`}
                >
                  {first(p.name)}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <InviteEmail
          client={name.trim()}
          first={first(shown?.name ?? "")}
          email={shown?.email.trim() ?? ""}
          project={withProject ? project.trim() : undefined}
          lead={lead}
          note={note.trim() || undefined}
        />
      </aside>
    </div>
  );
}

function Section({ title, lede, children }: { title: string; lede: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-5">
      <div className="grid gap-1.5">
        <h2 className={`${DISPLAY} text-[1.75rem] sm:text-[2rem]`}>{title}</h2>
        <p className={`${META} text-[0.875rem]`}>{lede}</p>
      </div>
      {children}
    </section>
  );
}
