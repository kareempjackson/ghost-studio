import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EmailGallery, type EmailSample } from "../../../../_components/email/EmailGallery";
import { PageHead, SkeletonCard } from "../../../../_components/ui";
import * as mail from "@/lib/email/portal";
import { invoices, notes, people, projects, reviewItems, threads } from "@/lib/portal/fixtures";
import { day, dayLong, due, money, pad, time, when } from "@/lib/portal/format";
import { replyAddress } from "@/lib/portal/mail";
import { getViewer } from "@/lib/portal/viewer";

export const metadata: Metadata = { title: "Emails" };

/**
 * Every email the portal sends, filled in from the prototype's world and
 * rendered exactly as it would be sent. The studio's, while the designs are
 * being settled.
 */
export default function EmailsPage() {
  return (
    <Suspense fallback={<SkeletonCard className="mt-24 h-[40rem]" lines={8} />}>
      <Emails />
    </Suspense>
  );
}

const who = (id: string) => people.find((p) => p.id === id)!;
const proj = (id: string) => projects.find((p) => p.id === id)!;
const item = (id: string) => reviewItems.find((i) => i.id === id)!;

async function Emails() {
  const viewer = await getViewer();
  if (viewer.role !== "studio") notFound();

  /* Images and links in mail must be full addresses: this preview's own origin. */
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const base = `${h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")}://${host}`;
  const at = (path: string) => `${base}${path}`;
  const ref = (id: string) => {
    const p = proj(id);
    return { name: p.name, code: p.code, ground: p.ground };
  };

  const nw = proj("pr-nw-rebrand");
  const dana = who("p-dana");
  const marcus = who("p-marcus");
  const sofia = who("p-sofia");
  const kareem = who("p-kareem");
  const priya = who("p-priya");
  const logo = item("primary-logo");
  const v3 = logo.versions.at(-1)!;
  const ct = item("colour-and-type");
  const anim = item("logo-animation");
  const tokens = item("design-tokens");
  const photo = item("photography-direction");
  const jen = notes.find((n) => n.id === "identity-review-with-jen")!;
  const inv142 = invoices.find((i) => i.id === "inv-0142")!;
  const inv136 = invoices.find((i) => i.id === "inv-0136")!;
  const tl022 = invoices.find((i) => i.id === "inv-tl-022")!;
  const nwThread = threads.find((t) => t.id === "t-nw-client")!;
  const first = (name: string) => name.split(" ")[0];

  const samples: EmailSample[] = [
    {
      key: "magic-link", name: "Sign-in link", audience: "Client", when: "When someone asks to sign in", to: dana.email,
      ...mail.magicLink({ base, first: first(dana.name), email: dana.email, link: at("/portal/auth/confirm") }),
    },
    {
      key: "invite", name: "Invitation", audience: "Client", when: "When the studio adds someone", to: marcus.email,
      ...mail.invite({ base, first: first(marcus.name), client: "Northwind Coffee", project: nw.name, lead: kareem.name, note: "Marcus, this is where every invoice for the rebrand will live, with the work it pays for.", link: at("/portal/auth/confirm?state=invite") }),
    },
    {
      key: "review-requested", name: "Work to review", audience: "Client", when: "When work is sent to the client", to: dana.email, replyTo: replyAddress(nw.slug),
      ...mail.reviewRequested({ base, first: first(dana.name), project: ref(nw.id), item: logo.title, version: `v${pad(v3.number)}`, note: v3.note, sender: who(v3.createdBy).name, thumb: at("/portal-demo/northwind-logo-v3.svg"), dueOn: logo.dueOn ? `${dayLong(logo.dueOn)}` : undefined, link: at(`/portal/projects/${nw.slug}/reviews/${logo.id}`) }),
    },
    {
      key: "new-messages", name: "New messages", audience: "Client", when: "Messages unread for five minutes", to: dana.email, replyTo: replyAddress(nw.slug),
      ...mail.newMessages({
        base, first: first(dana.name), project: ref(nw.id), link: at(`/portal/projects/${nw.slug}/messages`),
        messages: nwThread.messages.filter((m) => m.id === "m5" || m.id === "m7").map((m) => ({ author: who(m.authorId).name, side: who(m.authorId).role, at: `${when(m.at)}${/^\d/.test(when(m.at)) ? "" : `, ${time(m.at)}`}`, body: m.body })),
      }),
    },
    {
      key: "notes-shared", name: "Notes shared", audience: "Client", when: "When the studio shares meeting notes", to: dana.email, replyTo: replyAddress(nw.slug),
      ...mail.notesShared({
        base, first: first(dana.name), project: ref(nw.id), title: jen.title, metOn: dayLong(jen.metOn),
        excerpt: jen.body.split("\n")[0], actions: jen.actions.filter((a) => a.assigneeId === dana.id && !a.done).map((a) => ({ text: a.text, due: a.dueOn ? `due ${day(a.dueOn)}` : undefined })),
        link: at(`/portal/projects/${nw.slug}/notes/${jen.id}`),
      }),
    },
    {
      key: "milestone-complete", name: "Milestone complete", audience: "Client", when: "When the studio closes a milestone", to: dana.email, replyTo: replyAddress(nw.slug),
      ...mail.milestoneComplete({ base, first: first(dana.name), project: ref(nw.id), position: "01", total: "05", title: "Discovery", summary: "Interviews, audit and the brief we agreed on.", segments: ["done", "now", "next", "next", "next"], next: { title: "Identity system", due: `${day("2026-10-24")}, ${due("2026-10-24")}` }, link: at(`/portal/projects/${nw.slug}/milestones`) }),
    },
    {
      key: "invoice-issued", name: "Invoice issued", audience: "Client", when: "When the studio sends an invoice", to: marcus.email, replyTo: replyAddress(nw.slug),
      ...mail.invoiceIssued({ base, first: first(marcus.name), project: ref(nw.id), number: inv142.number, label: inv142.label, amount: money(inv142.amount), issued: day(inv142.issuedOn), dueOn: dayLong(inv142.dueOn), link: at(`/portal/projects/${nw.slug}/payments`) }),
    },
    {
      key: "invoice-overdue", name: "Invoice overdue", audience: "Client", when: "Three days after a due date passes", to: sofia.email, replyTo: replyAddress("halcyon-patient-app"),
      ...mail.invoiceOverdue({ base, first: first(sofia.name), project: ref(inv136.projectId), number: inv136.number, label: inv136.label, balance: money(inv136.amount - inv136.payments.reduce((s, p) => s + p.amount, 0)), dueOn: dayLong(inv136.dueOn), late: due(inv136.dueOn), link: at("/portal/projects/halcyon-patient-app/payments") }),
    },
    {
      key: "work-submitted", name: "Work submitted", audience: "Studio", when: "When a contractor submits work", to: kareem.email,
      ...mail.workSubmitted({ base, first: first(kareem.name), contractor: who(anim.submittedBy).name, project: ref(anim.projectId), item: anim.title, version: "v01", note: anim.versions[0].note, thumb: at("/portal-demo/northwind-motion.svg"), link: at(`/portal/projects/${nw.slug}/reviews/${anim.id}`) }),
    },
    {
      key: "decision-changes", name: "Changes requested", audience: "Studio", when: "When a client asks for changes", to: kareem.email,
      ...mail.decisionMade({ base, first: first(kareem.name), reviewer: dana.name, project: ref(nw.id), item: ct.title, version: "v01", decision: "changes_requested", reason: ct.versions[0].decisions.find((d) => d.stage === "client")?.reason, comments: ct.versions[0].comments.map((c, n) => ({ n: n + 1, body: c.body })), link: at(`/portal/projects/${nw.slug}/reviews/${ct.id}`) }),
    },
    {
      key: "decision-approved", name: "Approved", audience: "Studio", when: "When a client approves", to: kareem.email,
      ...mail.decisionMade({ base, first: first(kareem.name), reviewer: dana.name, project: ref(nw.id), item: photo.title, version: "v01", decision: "approved", comments: [], link: at(`/portal/projects/${nw.slug}/reviews/${photo.id}`) }),
    },
    {
      key: "contractor-invoice", name: "Contractor invoice", audience: "Studio", when: "When a contractor bills the studio", to: kareem.email,
      ...mail.contractorInvoice({ base, first: first(kareem.name), contractor: who(tl022.contractorId!).name, project: ref(tl022.projectId), number: tl022.number, label: tl022.label, amount: money(tl022.amount), dueOn: dayLong(tl022.dueOn), link: at("/portal/payments?tab=payables") }),
    },
    {
      key: "changes-for-you", name: "Changes for you", audience: "Contractor", when: "When the studio sends work back", to: priya.email, replyTo: replyAddress("halcyon-patient-app"),
      ...mail.changesForYou({ base, first: first(priya.name), reviewer: who("p-ines").name, project: ref(tokens.projectId), item: tokens.title, version: "v01", next: "v02", reason: tokens.versions[0].decisions[0].reason ?? "", comments: [], link: at(`/portal/projects/halcyon-patient-app/reviews/${tokens.id}`) }),
    },
  ];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      <PageHead eyebrow={`${samples.length} emails`} title="Emails" lede="Everything the portal sends, filled in and rendered as it will arrive." />
      <EmailGallery samples={samples} />
    </div>
  );
}
