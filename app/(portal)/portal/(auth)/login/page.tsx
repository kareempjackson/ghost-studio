import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Film } from "@/app/(site)/_components/Film";
import { Mark } from "@/app/(site)/_components/Mark";
import { LoginForm } from "../../../_components/auth/LoginForm";
import { Chip, DISPLAY, LABEL, ProgressBar } from "../../../_components/ui";

export const metadata: Metadata = { title: "Sign in" };

/**
 * The way in. One white card with the form, and beside it the studio's reel
 * playing in a rounded window — the first thing a client sees of the portal
 * is the studio's work, not a form. Two small cards float over the reel to
 * say what's inside: work to approve, and where the project stands.
 */
export default function LoginPage() {
  return (
    <main className="min-h-dvh p-2 sm:p-3 lg:p-4">
      <div className="grid min-h-[calc(100dvh-1rem)] gap-2 sm:min-h-[calc(100dvh-1.5rem)] lg:min-h-[calc(100dvh-2rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-3">
        <section className="gs-rise gs-card flex flex-col justify-between gap-12 rounded-[2rem] p-6 sm:p-10 lg:p-14">
          <header className="flex items-center justify-between">
            <Link href="/" className="flex h-12 items-center" aria-label="Ghost Savvy Studios — home">
              <Mark className="size-24 shrink-0" decorative />
            </Link>
            <Chip>Client portal</Chip>
          </header>

          <div className="grid max-w-[32rem] gap-8">
            <h1 className={`${DISPLAY} text-[2.75rem] sm:text-[3.5rem] lg:text-[4.25rem]`}>
              <span className="block">Your work,</span>
              <span className="block">in one place.</span>
            </h1>
            <p className="max-w-[36ch] text-[0.9375rem] leading-[1.55] text-secondary">
              Sign in with the email we invited. We&rsquo;ll send you a link, so there&rsquo;s no password to
              remember.
            </p>
            <LoginForm />
          </div>

          <footer className={`flex flex-wrap items-center justify-between gap-3 ${LABEL} text-tertiary`}>
            <span>© 2026 Ghost Savvy Studios</span>
            <Link href="/contact" className="transition-colors hover:text-primary">
              Trouble signing in?
            </Link>
          </footer>
        </section>

        <aside aria-hidden className="relative hidden overflow-hidden rounded-[2rem] bg-ink-950 lg:block">
          <Film src="/media/hero.mp4" poster="/media/hero-poster.jpg" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/50 via-transparent to-transparent" />

          <div className="gs-rise absolute top-8 right-8 flex items-center gap-3 rounded-pill bg-ink-950 py-2 pr-4 pl-2 text-white [--i:3]">
            <span className="grid size-8 place-items-center rounded-full bg-acid-300 font-label text-[0.625rem] text-ink-950">
              DW
            </span>
            <span className="text-[0.8125rem] font-medium tracking-[-0.01em]">Dana approved Primary logo v03</span>
          </div>

          <div className="gs-rise absolute bottom-8 left-8 grid w-[21rem] gap-4 rounded-[1.5rem] bg-white p-4 shadow-float [--i:4]">
            <div className="flex items-center justify-between">
              <span className={`${LABEL} text-tertiary`}>GS-014 · Northwind rebrand</span>
              <Chip tone="acid">Approved</Chip>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-[0.875rem]">
              <Image src="/portal-demo/northwind-logo-v3.svg" alt="" fill unoptimized className="object-cover" />
            </div>
            <div className="grid gap-2">
              <div className="flex items-baseline justify-between">
                <span className="text-[0.875rem] font-medium tracking-[-0.015em]">Identity system</span>
                <span className={`${LABEL} text-tertiary`}>02 / 05</span>
              </div>
              <ProgressBar
                label="Milestone 2 of 5"
                segments={[
                  { share: 1, tone: "acid" },
                  { share: 1, tone: "ink" },
                  { share: 3, tone: "hatch" },
                ]}
              />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
