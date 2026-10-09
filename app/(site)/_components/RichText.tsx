import Image from "next/image";
import { Visual } from "./Visual";
import { PortableText, stegaClean, type PortableTextComponents } from "next-sanity";
import type { RichText as RichTextValue } from "@/sanity/types";
import { MONO } from "./SectionHead";

/** An image block, as the project and article queries project it. */
interface ImageBlock {
  readonly src?: string | null;
  /** A film to play in the picture's place. */
  readonly video?: string | null;
  readonly width?: number | null;
  readonly height?: number | null;
  readonly alt?: string | null;
  readonly caption?: string | null;
}

type Block = { _key?: string; _type: string; style?: string; children?: { text?: string }[] };

/** Off the site: it opens in a new tab. On it: it does not. */
const isExternal = (href: string) => /^https?:\/\//.test(href);

const textOf = (block: Block) =>
  stegaClean((block.children ?? []).map((child) => child.text ?? "").join(""));

/** "Moving From React to Next.js" → "moving-from-react-to-next-js": a heading's anchor. */
export const headingId = (text: string) =>
  stegaClean(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** The body's sections: every Heading, in order, with the anchor it is set at. */
export function outline(value: RichTextValue | null | undefined) {
  return ((value ?? []) as readonly Block[])
    .filter((block) => block._type === "block" && block.style === "h2")
    .map((block) => ({ id: headingId(textOf(block)), label: textOf(block) }));
}

/** Clear of the top of the screen when a contents link scrolls to it. */
const ANCHOR = "scroll-mt-24";

/**
 * The type a long read is set in: a lead paragraph, numbered section
 * headings, quotes in the editorial serif, and lists, links and pictures
 * at the reading measure. Sizes step up at lg, with the measure.
 */
function components(value: RichTextValue): PortableTextComponents {
  /* Sections are numbered by position, as the contents beside them are. */
  const sections = new Map(
    ((value ?? []) as readonly Block[])
      .filter((block) => block._type === "block" && block.style === "h2")
      .map((block, index) => [block._key, String(index + 1).padStart(2, "0")]),
  );

  return {
    block: {
      normal: ({ children, index }) =>
        index === 0 ? (
          <p className="text-[1.1875rem] leading-[1.6] tracking-[-0.015em] text-ink-950 lg:text-[1.3125rem]">
            {children}
          </p>
        ) : (
          <p className="mt-6 first:mt-0">{children}</p>
        ),
      h2: ({ children, value: block }) => (
        <h2
          id={headingId(textOf(block as Block))}
          className={`${ANCHOR} mt-16 border-t border-edge-subtle pt-8 text-[1.625rem] leading-[1.15] font-medium tracking-[-0.035em] text-ink-950 first:mt-0 lg:mt-20 lg:pt-10 lg:text-[2.125rem]`}
        >
          {sections.has(block._key) && (
            <span aria-hidden className={`${MONO} mb-5 block text-ink-400 lg:mb-6`}>
              {sections.get(block._key)}
            </span>
          )}
          {children}
        </h2>
      ),
      h3: ({ children, value: block }) => (
        <h3
          id={headingId(textOf(block as Block))}
          className={`${ANCHOR} mt-12 text-[1.25rem] leading-[1.25] font-medium tracking-[-0.025em] text-ink-950 first:mt-0 lg:text-[1.375rem]`}
        >
          {children}
        </h3>
      ),
      /* The page's one editorial moment, as the brand keeps the serif for. */
      blockquote: ({ children }) => (
        <blockquote className="my-12 border-l-2 border-surface-accent pl-6 font-editorial text-[1.5rem] leading-[1.3] font-light tracking-[-0.01em] text-ink-950 italic lg:my-16 lg:pl-8 lg:text-[1.875rem]">
          {children}
        </blockquote>
      ),
    },
    list: {
      bullet: ({ children }) => <ul className="mt-6 space-y-3">{children}</ul>,
      number: ({ children }) => (
        <ol className="mt-6 list-decimal space-y-3 pl-6 marker:font-label marker:text-[0.8125em] marker:text-ink-400">
          {children}
        </ol>
      ),
    },
    listItem: {
      bullet: ({ children }) => (
        <li className="flex gap-4">
          <span aria-hidden className="mt-[0.8em] h-px w-3 shrink-0 bg-ink-400" />
          <span>{children}</span>
        </li>
      ),
      number: ({ children }) => <li className="pl-2">{children}</li>,
    },
    marks: {
      strong: ({ children }) => <strong className="font-medium text-ink-950">{children}</strong>,
      em: ({ children }) => <em>{children}</em>,
      code: ({ children }) => (
        <code className="rounded-[0.25em] bg-ink-100 px-[0.35em] py-[0.1em] font-mono text-[0.875em] text-ink-950">
          {children}
        </code>
      ),
      link: ({ children, value: mark }) => {
        const href = stegaClean((mark as { href?: string } | undefined)?.href ?? "");
        if (!href) return <>{children}</>;
        return (
          <a
            href={href}
            {...(isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="text-ink-950 underline decoration-ink-300 underline-offset-4 transition-colors duration-200 hover:text-accent hover:decoration-current"
          >
            {children}
          </a>
        );
      },
    },
    types: {
      image: ({ value: image }: { value: ImageBlock }) => {
        if (!image.src && !image.video) return null;
        return (
          <figure className="my-12 lg:my-16">
            {image.video ? (
              /* A film, in a box the picture's shape, or wide without one. */
              <div
                className="relative w-full overflow-hidden rounded-[0.75rem]"
                style={{
                  aspectRatio:
                    image.width && image.height ? `${image.width} / ${image.height}` : "16 / 9",
                }}
              >
                <Visual
                  src={image.src}
                  video={image.video}
                  alt={image.alt ?? ""}
                  sizes="(min-width: 1024px) 42rem, 100vw"
                />
              </div>
            ) : (
              <Image
                src={image.src as string}
                alt={image.alt ?? ""}
                width={image.width ?? 1600}
                height={image.height ?? 1000}
                sizes="(min-width: 1024px) 42rem, 100vw"
                className="h-auto w-full rounded-[0.75rem]"
              />
            )}
            {image.caption && (
              <figcaption className={`${MONO} mt-4 text-ink-500`}>{image.caption}</figcaption>
            )}
          </figure>
        );
      },
    },
  };
}

/**
 * A Portable Text body, from Sanity, set at the reading measure: the text in
 * the body size, its sections anchored for the contents beside it.
 */
export function RichText({
  value,
  className,
  id,
}: {
  value: RichTextValue;
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`text-[1.0625rem] leading-[1.75] tracking-[-0.005em] text-ink-700 lg:text-[1.125rem] ${className ?? ""}`}
    >
      <PortableText
        value={value as unknown as Parameters<typeof PortableText>[0]["value"]}
        components={components(value)}
      />
    </div>
  );
}
