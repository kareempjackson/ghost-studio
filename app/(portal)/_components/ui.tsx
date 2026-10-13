import Link from "next/link";
import type { CSSProperties, ElementType, ReactNode } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { initials, moneyParts } from "@/lib/portal/format";
import type { Tone } from "@/lib/portal/stage";
import type { Role } from "@/lib/portal/types";

/**
 * The portal's parts. Server-safe: nothing here holds state, so a server
 * page can set them and a client component can pass them handlers.
 *
 * The vocabulary is the site's — Arial labels, pills, the disc with the
 * up-right arrow — set quieter for a tool used every day: medium-weight
 * titles, grey sentence-case detail, colour kept to a dot until something
 * truly needs attention, and surfaces that read as paper on a lit desk.
 */

/* -------------------------------------------------------------------------- */
/*  Type                                                                      */
/* -------------------------------------------------------------------------- */

/** The site's MONO label, a size down: eyebrows, chips, the nav. */
export const LABEL = "font-label text-[0.625rem] leading-none tracking-[0.1em] uppercase";

/** Page titles and big figures: the display cut, light, set tight. */
export const DISPLAY = "font-display font-light tracking-[-0.045em] leading-[0.95]";

/** A page's title: large, light, and no larger than it needs to be. */
export const H1 = `${DISPLAY} text-[2.25rem] sm:text-[2.75rem] lg:text-[3.25rem]`;

/** A card's or a row's name. */
export const TITLE = "text-[0.9375rem] font-medium leading-[1.25] tracking-[-0.015em]";

/** The quiet line under a name: who, when, how many. */
export const META = "text-[0.8125rem] leading-[1.35] tracking-[-0.005em] text-tertiary";

/** Hairline rules inside a card: on a border, and between rows (divide-y). */
export const RULE = "border-ink-950/[0.06]";
export const DIVIDE = "divide-y divide-ink-950/[0.06]";

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The head of a top-level page: a small eyebrow, the title, a line under it,
 * and the page's actions at the right.
 */
export function PageHead({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="gs-rise flex flex-col gap-5 pt-5 pb-2 lg:flex-row lg:items-end lg:justify-between lg:pt-9 lg:pb-4">
      <div className="grid gap-3.5">
        {eyebrow ? <p className={`${LABEL} text-tertiary`}>{eyebrow}</p> : null}
        <h1 className={H1}>{title}</h1>
        {lede ? <p className="text-[0.9375rem] tracking-[-0.01em] text-secondary">{lede}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*  Cards                                                                     */
/* -------------------------------------------------------------------------- */

export function Card({
  children,
  className = "",
  as: Tag = "section",
  i,
  tone = "white",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Its place in the entrance queue: cards rise in reading order. */
  i?: number;
  tone?: "white" | "ink";
  "aria-label"?: string;
  "aria-labelledby"?: string;
}) {
  const tones = {
    white: "gs-card",
    ink: "bg-ink-950 text-white",
  };
  return (
    <Tag
      className={`gs-rise relative rounded-[1.75rem] p-5 sm:p-6 lg:p-7 ${tones[tone]} ${className}`}
      style={i !== undefined ? ({ "--i": i } as CSSProperties) : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** A card's head: its name, a quiet line under it, and its controls at the right. */
export function CardHead({
  title,
  meta,
  id,
  children,
  className = "",
  inverse = false,
}: {
  title: ReactNode;
  meta?: ReactNode;
  id?: string;
  children?: ReactNode;
  className?: string;
  /** On an ink card. */
  inverse?: boolean;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="grid min-w-0 gap-1">
        <h2 id={id} className={`${TITLE} text-[1rem]`}>
          {title}
        </h2>
        {meta ? <p className={`${META} ${inverse ? "text-white/50" : ""}`}>{meta}</p> : null}
      </div>
      {children ? <div className="flex shrink-0 items-center gap-1.5">{children}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Chips and pills                                                           */
/* -------------------------------------------------------------------------- */

const CHIP_TONES: Record<Tone, { chip: string; dot: string }> = {
  quiet: { chip: "bg-ink-950/[0.045] text-ink-700", dot: "bg-ink-400" },
  outline: { chip: "ring-1 ring-inset ring-ink-950/[0.12] text-ink-700", dot: "bg-ink-400" },
  ink: { chip: "bg-ink-950 text-white", dot: "bg-white" },
  acid: { chip: "bg-acid-100 text-acid-900", dot: "bg-acid-500" },
  signal: { chip: "bg-signal-50 text-signal-700", dot: "bg-alert" },
  "signal-soft": { chip: "ring-1 ring-inset ring-signal-200 text-signal-700", dot: "bg-alert" },
};

/** Tones that carry a status, and so a dot by default. */
const DOTTED: readonly Tone[] = ["acid", "signal", "signal-soft"];

/**
 * A tag: a stage, a status, a project's code. Arial, upper case, small.
 * Status tones lead with a dot; colour stays in the dot and the tint, never
 * a loud block. Give it `colour` to lead with a project's swatch instead.
 */
export function Chip({
  children,
  tone = "quiet",
  colour,
  dot,
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  colour?: string;
  /** A small disc before the label. On by default for status tones. */
  dot?: boolean;
  className?: string;
}) {
  const t = CHIP_TONES[colour ? "quiet" : tone];
  const showDot = dot ?? DOTTED.includes(tone);
  return (
    <span
      className={`inline-flex h-[1.375rem] shrink-0 items-center gap-1.5 rounded-pill px-2 whitespace-nowrap ${LABEL} ${t.chip} ${className}`}
    >
      {colour ? (
        <span aria-hidden className="size-2 rounded-[0.1875rem]" style={{ backgroundColor: colour, boxShadow: "inset 0 0 0 1px rgb(14 13 11 / 0.08)" }} />
      ) : showDot ? (
        <span aria-hidden className={`size-1.5 rounded-full ${t.dot}`} />
      ) : null}
      {children}
    </span>
  );
}

/** A count: unread, waiting. The one place the vermilion is solid. */
export function Count({ n, className = "" }: { n: number; className?: string }) {
  if (!n) return null;
  return (
    <span className={`grid h-[1.125rem] min-w-[1.125rem] place-items-center rounded-full bg-alert px-1 font-label text-[0.5625rem] tracking-normal text-white ${className}`}>
      {n}
    </span>
  );
}

/** "Label: Value ▾", the filter row's field. */
export function FieldPill({
  label,
  value,
  className = "",
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`gs-press gs-card inline-flex h-9 shrink-0 items-center gap-1.5 rounded-pill pr-2.5 pl-3.5 text-[0.8125rem] tracking-[-0.01em] hover:bg-ink-50 ${className}`}
    >
      <span className="text-tertiary">{label}</span>
      <span className="font-medium text-primary">{value}</span>
      <ChevronDown aria-hidden className="size-3.5 text-tertiary" strokeWidth={1.75} />
    </button>
  );
}

/** A plain pill: secondary actions, set beside the one black one. */
export const PILL =
  "gs-press inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-pill px-4 text-[0.8125rem] font-medium tracking-[-0.01em]";
export const PILL_TONES = {
  white: "gs-card text-primary hover:bg-ink-50",
  canvas: "bg-ink-950/[0.05] text-primary hover:bg-ink-950/[0.08]",
  ink: "gs-ink hover:bg-ink-800",
  alert: "bg-alert text-white hover:bg-signal-600",
  ghost: "text-secondary hover:bg-ink-950/[0.05] hover:text-primary",
} as const;

export function Pill({
  children,
  href,
  tone = "white",
  className = "",
  type = "button",
  onClick,
  disabled,
}: {
  children: ReactNode;
  href?: string;
  tone?: keyof typeof PILL_TONES;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}) {
  const classes = `${PILL} ${PILL_TONES[tone]} disabled:pointer-events-none disabled:opacity-40 ${className}`;
  return href ? (
    <Link href={href} className={classes}>
      {children}
    </Link>
  ) : (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}

/** The size of icons in pills and round controls. */
export const ICON = "size-4";

/* -------------------------------------------------------------------------- */
/*  Round controls                                                            */
/* -------------------------------------------------------------------------- */

const ROUND_TONES = {
  white: "gs-card text-primary hover:bg-ink-50",
  canvas: "bg-ink-950/[0.045] text-primary hover:bg-ink-950/[0.08]",
  ink: "gs-ink",
  clear: "text-ink-700 hover:bg-ink-950/[0.05] hover:text-primary",
} as const;

/**
 * A control that is only an icon: a disc, named for assistive tech. Black
 * when it is the one that's on.
 */
export function IconButton({
  label,
  children,
  href,
  onClick,
  tone = "white",
  active = false,
  size = "md",
  badge = false,
  className = "",
  pressed,
  submit = false,
}: {
  label: string;
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  /** Submits the form it sits in. */
  submit?: boolean;
  tone?: keyof typeof ROUND_TONES;
  active?: boolean;
  size?: "sm" | "md" | "lg";
  /** A vermilion dot: something new behind it. */
  badge?: boolean;
  className?: string;
  /** For toggles: whether it's on. */
  pressed?: boolean;
}) {
  const sizes = { sm: "size-8", md: "size-9", lg: "size-10" };
  const classes = `gs-press relative grid shrink-0 place-items-center rounded-full ${sizes[size]} ${active ? ROUND_TONES.ink : ROUND_TONES[tone]} ${className}`;
  const inner = (
    <>
      {children}
      {badge ? (
        <span aria-hidden className="absolute top-[0.4375rem] right-[0.4375rem] size-1.5 rounded-full bg-alert ring-2 ring-white" />
      ) : null}
    </>
  );
  return href ? (
    <Link href={href} aria-label={label} title={label} aria-current={active ? "page" : undefined} className={classes}>
      {inner}
    </Link>
  ) : (
    <button type={submit ? "submit" : "button"} aria-label={label} title={label} aria-pressed={pressed} onClick={onClick} className={classes}>
      {inner}
    </button>
  );
}

/**
 * The way into whatever the card is about: the disc with the up-right arrow
 * from the site's project plates. Turns to ink, and the arrow steps out, when
 * its card is hovered.
 */
export function CornerArrow({
  href,
  label,
  tone = "canvas",
  className = "",
}: {
  /** Leave it off when the whole card is already the link: the disc is then only a sign. */
  href?: string;
  label: string;
  tone?: "canvas" | "white";
  className?: string;
}) {
  const classes = `gs-press grid size-9 shrink-0 place-items-center rounded-full transition-colors duration-300 hover:bg-ink-950 hover:text-white group-hover:bg-ink-950 group-hover:text-white ${tone === "canvas" ? "bg-ink-950/[0.045]" : "bg-white shadow-card"} ${className}`;
  const arrow = (
    <ArrowUpRight
      aria-hidden
      className="size-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-px group-hover:-translate-y-px"
      strokeWidth={1.5}
    />
  );
  return href ? (
    <Link href={href} aria-label={label} className={classes}>
      {arrow}
    </Link>
  ) : (
    <span aria-hidden className={classes}>
      {arrow}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  People                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * A person, as their initials on a disc. The disc says which side they're
 * on before the name does: the studio in ink, contractors in grey, clients
 * on a warm ground.
 */
export function Avatar({
  person,
  size = "md",
  ring,
  className = "",
}: {
  person: { readonly name: string; readonly role: Role };
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  ring?: string;
  className?: string;
}) {
  const sizes = {
    xs: "size-6 text-[0.5rem]",
    sm: "size-7 text-[0.5625rem]",
    md: "size-9 text-[0.625rem]",
    lg: "size-11 text-[0.6875rem]",
    xl: "size-16 text-[0.875rem]",
  };
  const tones = {
    studio: "bg-ink-950 text-white",
    contractor: "bg-ink-200 text-ink-800",
    client: "bg-[#efe2c6] text-ink-900",
  };
  return (
    <span
      title={person.name}
      className={`grid shrink-0 place-items-center rounded-full font-label tracking-[0.06em] ${sizes[size]} ${tones[person.role]} ${className}`}
      style={ring ? { boxShadow: `0 0 0 2px ${ring}` } : undefined}
    >
      <span aria-hidden>{initials(person.name)}</span>
      <span className="sr-only">{person.name}</span>
    </span>
  );
}

/** A few faces overlapping, then "+N" on a black disc for the rest. */
export function AvatarStack({
  people,
  max = 4,
  size = "sm",
  ring = "#f0efed",
}: {
  people: readonly { readonly name: string; readonly role: Role }[];
  max?: number;
  size?: "sm" | "md";
  ring?: string;
}) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <span className="flex items-center">
      {shown.map((p, n) => (
        <Avatar key={p.name} person={p} size={size} ring={ring} className={n ? "-ml-1.5" : ""} />
      ))}
      {rest > 0 ? (
        <span
          className={`-ml-1.5 grid place-items-center rounded-full bg-ink-950 font-label text-white ${size === "sm" ? "size-7 text-[0.5625rem]" : "size-9 text-[0.625rem]"}`}
          style={{ boxShadow: `0 0 0 2px ${ring}` }}
        >
          +{rest}
        </span>
      ) : null}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Figures                                                                   */
/* -------------------------------------------------------------------------- */

const FIGURE_SIZES = {
  sm: "text-[1.625rem] lg:text-[1.875rem]",
  md: "text-[2rem] lg:text-[2.375rem]",
  lg: "text-[2.5rem] lg:text-[3rem]",
  xl: "text-[3rem] lg:text-[3.75rem]",
};

/**
 * A sum set large: "$" and the cents small and raised, the whole dollars in
 * the display cut, figures lined up. The way the references set $278.86.
 */
export function Money({
  cents,
  size = "lg",
  className = "",
}: {
  cents: number;
  size?: keyof typeof FIGURE_SIZES;
  className?: string;
}) {
  const { symbol, whole, fraction } = moneyParts(cents);
  return (
    <span className={`inline-flex items-start tabular-nums ${DISPLAY} ${FIGURE_SIZES[size]} ${className}`}>
      <span className="mt-[0.14em] mr-[0.05em] text-[0.4em] tracking-normal text-secondary">{symbol}</span>
      <span>{whole}</span>
      <span className="mt-[0.14em] ml-[0.03em] text-[0.4em] tracking-normal text-tertiary">{fraction}</span>
    </span>
  );
}

/** A count set large, with a quiet unit after it: "02 / 05", "3 days". */
export function Figure({
  value,
  unit,
  size = "lg",
  className = "",
}: {
  value: ReactNode;
  unit?: ReactNode;
  size?: keyof typeof FIGURE_SIZES;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-baseline gap-[0.14em] tabular-nums ${DISPLAY} ${FIGURE_SIZES[size]} ${className}`}>
      <span>{value}</span>
      {unit ? <span className="text-[0.38em] tracking-[-0.01em] text-tertiary">{unit}</span> : null}
    </span>
  );
}

/**
 * Progress as a thin pill: done in acid, the part in hand in ink, and what's
 * still to come hatched. Each segment is a share of the whole.
 */
export function ProgressBar({
  segments,
  className = "",
  label,
}: {
  segments: readonly { readonly share: number; readonly tone: "acid" | "ink" | "hatch" | "alert" | "canvas" }[];
  className?: string;
  label: string;
}) {
  const tones = {
    acid: "bg-acid-300",
    ink: "bg-ink-950",
    hatch: "gs-hatch bg-ink-950/[0.04] text-ink-300",
    alert: "bg-alert",
    canvas: "bg-ink-950/[0.06]",
  };
  return (
    <div role="img" aria-label={label} className={`flex h-2 gap-[3px] ${className}`}>
      {segments
        .filter((s) => s.share > 0)
        .map((s, n) => (
          <span key={n} className={`h-full rounded-pill ${tones[s.tone]}`} style={{ flexGrow: s.share, flexBasis: 0 }} />
        ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Waiting                                                                   */
/* -------------------------------------------------------------------------- */

/** What a card is while its data streams in: its shape, quietly pulsing. */
export function SkeletonCard({ className = "", lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div aria-hidden className={`gs-card rounded-[1.75rem] p-6 lg:p-7 ${className}`}>
      <div className="h-4 w-1/3 animate-pulse rounded-pill bg-ink-950/[0.05]" />
      <div className="mt-6 grid gap-3">
        {Array.from({ length: lines }, (_, n) => (
          <div key={n} className="h-2.5 animate-pulse rounded-pill bg-ink-950/[0.04]" style={{ width: `${88 - n * 14}%` }} />
        ))}
      </div>
    </div>
  );
}

/** Nothing here yet, said plainly, with the one thing to do about it. */
export function Empty({ title, body, children }: { title: string; body?: string; children?: ReactNode }) {
  return (
    <div className="grid place-items-center gap-2.5 rounded-[1.25rem] bg-ink-950/[0.03] px-6 py-14 text-center">
      <p className={TITLE}>{title}</p>
      {body ? <p className={`max-w-[38ch] ${META}`}>{body}</p> : null}
      {children ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Status                                                                    */
/* -------------------------------------------------------------------------- */

const PROJECT_STATUS: Record<string, { label: string; tone: Tone }> = {
  proposal: { label: "Proposal", tone: "outline" },
  active: { label: "Active", tone: "acid" },
  paused: { label: "Paused", tone: "quiet" },
  complete: { label: "Complete", tone: "quiet" },
};

export function ProjectStatus({ status }: { status: string }) {
  const { label, tone } = PROJECT_STATUS[status] ?? PROJECT_STATUS.active;
  return (
    <Chip tone={tone} dot>
      {label}
    </Chip>
  );
}

/**
 * A client, as their initials on their own colour: a rounded square, so a
 * company never reads as a person's disc.
 */
export function OrgMark({
  org,
  size = "md",
  className = "",
}: {
  org: { readonly name: string; readonly colour: string };
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    sm: "size-8 rounded-[0.625rem] text-[0.5625rem]",
    md: "size-10 rounded-[0.75rem] text-[0.625rem]",
    lg: "size-12 rounded-[0.875rem] text-[0.6875rem]",
    xl: "size-16 rounded-[1.125rem] text-[0.875rem]",
  };
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center font-label tracking-[0.08em] text-ink-950 ${sizes[size]} ${className}`}
      style={{ backgroundColor: org.colour, boxShadow: "inset 0 0 0 1px rgb(14 13 11 / 0.06)" }}
    >
      {initials(org.name)}
    </span>
  );
}
