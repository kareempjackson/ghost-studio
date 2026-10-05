import type { CSSProperties, ElementType, ReactNode } from "react";
import { typeScale, typeStyleToCss, type TypeRole } from "@/lib/brand";

/* -------------------------------------------------------------------------- */
/*  Type                                                                      */
/* -------------------------------------------------------------------------- */

interface TypeProps {
  role: TypeRole;
  as?: ElementType;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Cap the line length at the role's documented measure. */
  measure?: boolean;
  id?: string;
}

/**
 * Every piece of text on this page goes through the scale. If a role looks
 * wrong here, the role is wrong — there is no local override to hide behind.
 */
export function Type({
  role,
  as: Tag = "p",
  children,
  className,
  style,
  measure = false,
  id,
}: TypeProps) {
  const spec = typeScale[role];
  const css: CSSProperties = {
    ...typeStyleToCss(spec),
    ...(measure && spec.measure ? { maxInlineSize: `${spec.measure}ch` } : null),
    ...style,
  };
  return (
    <Tag id={id} className={className} style={css}>
      {children}
    </Tag>
  );
}

/* -------------------------------------------------------------------------- */
/*  Structure                                                                 */
/* -------------------------------------------------------------------------- */

export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Type role="label" as="p" className={`text-tertiary ${className}`}>
      {children}
    </Type>
  );
}

export function Rule({ className = "" }: { className?: string }) {
  return <div className={`h-px w-full bg-edge ${className}`} aria-hidden />;
}

/** The 1440px layout field with fluid page margins. */
export function Field({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-16 ${className}`}
    >
      {children}
    </div>
  );
}

export function Section({
  id,
  index,
  title,
  lead,
  children,
}: {
  id: string;
  index: string;
  title: string;
  lead?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <Rule className="bg-edge-strong" />
      <Field className="py-14 sm:py-20 lg:py-28">
        <header className="mb-12 grid gap-6 lg:mb-16 lg:grid-cols-[8rem_1fr] lg:gap-10">
          <Eyebrow className="pt-2">{index}</Eyebrow>
          <div className="grid gap-5">
            <Type role="display-m" as="h2" id={`${id}-title`}>
              {title}
            </Type>
            {lead ? (
              <Type role="body-l" className="text-secondary" measure>
                {lead}
              </Type>
            ) : null}
          </div>
        </header>
        <div className="lg:grid lg:grid-cols-[8rem_1fr] lg:gap-10">
          <div aria-hidden />
          <div className="min-w-0">{children}</div>
        </div>
      </Field>
    </section>
  );
}

/** A titled block inside a section. */
export function Block({
  title,
  note,
  children,
  className = "",
}: {
  title: string;
  note?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid gap-5 ${className}`}>
      <div className="grid gap-2 border-t border-edge pt-4">
        <Type role="label" as="h3" className="text-primary">
          {title}
        </Type>
        {note ? (
          <Type role="body-s" className="text-secondary" measure>
            {note}
          </Type>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Small parts                                                               */
/* -------------------------------------------------------------------------- */

export function Mono({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`font-label text-[0.8125rem] leading-6 ${className}`}>
      {children}
    </span>
  );
}

export function Pill({
  children,
  tone = "quiet",
}: {
  children: ReactNode;
  tone?: "quiet" | "signal" | "acid" | "pass" | "fail";
}) {
  const tones: Record<string, string> = {
    quiet: "border-edge text-secondary",
    signal: "border-transparent bg-signal-500 text-white",
    acid: "border-transparent bg-acid-400 text-ink-950",
    pass: "border-ink-950 text-ink-950",
    fail: "border-transparent bg-ink-950 text-white",
  };
  return (
    <span
      className={`inline-flex items-center rounded-pill border px-2.5 py-1 font-sans text-[0.6875rem] font-bold uppercase tracking-[0.12em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/** Two-column do / don't pair. */
export function Compare({
  yes,
  no,
  yesLabel = "Write",
  noLabel = "Not",
}: {
  yes: ReactNode;
  no: ReactNode;
  yesLabel?: string;
  noLabel?: string;
}) {
  return (
    <div className="grid gap-px overflow-hidden border border-edge bg-edge sm:grid-cols-2">
      <div className="grid gap-3 bg-surface-page p-5">
        <Eyebrow>{yesLabel}</Eyebrow>
        <Type role="body" className="text-primary">
          {yes}
        </Type>
      </div>
      <div className="grid gap-3 bg-surface-subtle p-5">
        <Eyebrow>{noLabel}</Eyebrow>
        <Type role="body" className="text-disabled line-through decoration-1">
          {no}
        </Type>
      </div>
    </div>
  );
}

/** Numbered rule list — the studio's standard way of stating a policy. */
export function RuleList({
  items,
}: {
  items: readonly { rule: string; why: string }[];
}) {
  return (
    <ol className="grid gap-px border-y border-edge bg-edge">
      {items.map((item, i) => (
        <li
          key={item.rule}
          className="grid gap-3 bg-surface-page py-6 sm:grid-cols-[3rem_1fr] sm:gap-6"
        >
          <Eyebrow className="pt-1">
            {String(i + 1).padStart(2, "0")}
          </Eyebrow>
          <div className="grid gap-2">
            <Type role="title" className="text-primary" measure>
              {item.rule}
            </Type>
            <Type role="body-s" className="text-secondary" measure>
              {item.why}
            </Type>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Table({
  head,
  rows,
}: {
  head: readonly string[];
  rows: readonly (readonly ReactNode[])[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-edge-strong">
            {head.map((cell) => (
              <th key={cell} scope="col" className="py-3 pr-6 align-bottom">
                <Type role="label" as="span" className="text-tertiary">
                  {cell}
                </Type>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-edge-subtle align-top">
              {row.map((cell, j) => (
                <td key={j} className="py-4 pr-6">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
