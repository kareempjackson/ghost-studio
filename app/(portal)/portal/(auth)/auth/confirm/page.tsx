import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ConfirmCard, type ConfirmMode } from "../../../../_components/auth/ConfirmCard";
import { LABEL } from "../../../../_components/ui";

export const metadata: Metadata = { title: "Enter the portal" };

const MODES: readonly ConfirmMode[] = ["sign-in", "invite", "expired"];

/**
 * Where a magic link lands. With auth, the link carries a one-time token and
 * the button verifies it; in the prototype `?state=` picks which of the three
 * cards to show, and the links under the card switch between them.
 */
export default function ConfirmPage(props: PageProps<"/portal/auth/confirm">) {
  return (
    <main className="grid min-h-dvh place-items-center gap-6 p-3 sm:p-6">
      <Suspense fallback={<div className="h-[32rem] w-full max-w-[36rem] rounded-[2rem] bg-white" />}>
        <Card searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

async function Card({ searchParams }: { searchParams: PageProps<"/portal/auth/confirm">["searchParams"] }) {
  const { state } = await searchParams;
  const mode = MODES.find((m) => m === state) ?? "sign-in";
  return (
    <div className="grid w-full justify-items-center gap-6">
      <ConfirmCard mode={mode} />
      <nav aria-label="Prototype states" className={`flex gap-4 ${LABEL} text-tertiary`}>
        {MODES.map((m) => (
          <Link
            key={m}
            href={`/portal/auth/confirm?state=${m}`}
            aria-current={m === mode ? "page" : undefined}
            className={m === mode ? "text-primary" : "transition-colors hover:text-primary"}
          >
            {m.replace("-", " ")}
          </Link>
        ))}
      </nav>
    </div>
  );
}
