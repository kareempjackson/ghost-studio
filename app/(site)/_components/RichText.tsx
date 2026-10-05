import Image from "next/image";
import { PortableText, stegaClean, type PortableTextComponents } from "next-sanity";
import type { RichText as RichTextValue } from "@/sanity/types";
import { MONO } from "./SectionHead";

/** An image block, as the project and article queries project it. */
interface ImageBlock {
  readonly src?: string | null;
  readonly width?: number | null;
  readonly height?: number | null;
  readonly alt?: string | null;
  readonly caption?: string | null;
}

/** Off the site: it opens in a new tab. On it: it does not. */
const isExternal = (href: string) => /^https?:\/\//.test(href);

/**
 * The type the body is set in: the reading measure and sizes of the legal
 * pages, the band headings' voice scaled down for the subheads.
 */
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mt-5 text-[1rem] leading-[1.7] tracking-[-0.005em] text-ink-600 first:mt-0 lg:text-[1.0625rem]">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-14 text-[1.5rem] leading-[1.2] tracking-[-0.03em] text-ink-950 first:mt-0 lg:mt-16 lg:text-[1.75rem]">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-10 text-[1.25rem] leading-[1.2] tracking-[-0.03em] text-ink-950 first:mt-0">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-12 border-l border-ink-950 pl-6 text-[1.375rem] leading-[1.35] tracking-[-0.025em] text-ink-950 lg:my-14 lg:pl-8 lg:text-[1.625rem]">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="mt-5 space-y-2.5">{children}</ul>,
    number: ({ children }) => (
      <ol className="mt-5 list-decimal space-y-2.5 pl-5">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="flex gap-3 text-[1rem] leading-[1.6] tracking-[-0.005em] text-ink-600 lg:text-[1.0625rem]">
        <span
          aria-hidden
          className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-ink-400"
        />
        <span>{children}</span>
      </li>
    ),
    number: ({ children }) => (
      <li className="text-[1rem] leading-[1.6] tracking-[-0.005em] text-ink-600 lg:text-[1.0625rem]">
        {children}
      </li>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-medium text-ink-950">{children}</strong>
    ),
    link: ({ children, value }) => {
      const href = stegaClean((value as { href?: string } | undefined)?.href ?? "");
      if (!href) return <>{children}</>;
      return (
        <a
          href={href}
          {...(isExternal(href)
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="text-ink-950 underline underline-offset-4 transition-colors duration-200 hover:text-accent"
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }: { value: ImageBlock }) => {
      if (!value.src) return null;
      return (
        <figure className="my-12 lg:my-16">
          <Image
            src={value.src}
            alt={value.alt ?? ""}
            width={value.width ?? 1600}
            height={value.height ?? 1000}
            sizes="(min-width: 1024px) 42rem, 100vw"
            className="h-auto w-full rounded-[0.75rem]"
          />
          {value.caption && (
            <figcaption className={`${MONO} mt-4 text-ink-500`}>
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};

/**
 * A Portable Text body, from Sanity, set at the site's reading measure.
 * Paragraphs, two levels of subhead, pull quotes, links and pictures.
 */
export function RichText({
  value,
  className,
}: {
  value: RichTextValue;
  className?: string;
}) {
  return (
    <div className={className}>
      <PortableText
        value={value as unknown as Parameters<typeof PortableText>[0]["value"]}
        components={components}
      />
    </div>
  );
}
