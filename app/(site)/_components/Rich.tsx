import { Fragment, type ReactNode } from "react";
import { PortableText, stegaClean, type PortableTextComponents } from "next-sanity";
import type { Rich as RichValue, RichBlock } from "@/sanity/types";

/** Off the site: it opens in a new tab. On it: it does not. */
const isExternal = (href: string) => /^https?:\/\//.test(href);

const marks: PortableTextComponents["marks"] = {
  strong: ({ children }) => <strong className="font-medium">{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  underline: ({ children }) => <span className="underline underline-offset-4">{children}</span>,
  "strike-through": ({ children }) => <s>{children}</s>,
  code: ({ children }) => (
    <code className="rounded-[0.25em] bg-ink-200/60 px-[0.3em] py-[0.1em] font-mono text-[0.875em]">
      {children}
    </code>
  ),
  link: ({ children, value }) => {
    const href = stegaClean((value as { href?: string } | undefined)?.href ?? "");
    if (!href) return <>{children}</>;
    return (
      <a
        href={href}
        {...(isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="underline underline-offset-4 transition-colors duration-200 hover:text-accent"
      >
        {children}
      </a>
    );
  },
};

/**
 * The space above every block but the first. In em, so it scales with the
 * type it is set in; a container can set its own with --rich-gap, the way
 * the runs of paragraphs keep the rhythm their designs gave them.
 */
const GAP = "mt-[var(--rich-gap,0.75em)] first:mt-0";

/**
 * The blocks, each a real element, in the type of whatever they are set
 * in: sizes and weights are relative, so a deck, a card and a case study
 * each keep their own voice and the headings and lists follow it.
 */
const blocks: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className={GAP}>{children}</p>,
    h2: ({ children }) => (
      <h2 className={`${GAP} text-[1.5em] leading-[1.15] font-medium tracking-[-0.03em] [&+*]:mt-[0.5em]`}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className={`${GAP} text-[1.25em] leading-[1.2] font-medium tracking-[-0.02em] [&+*]:mt-[0.5em]`}>
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className={`${GAP} font-medium [&+*]:mt-[0.35em]`}>{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className={`${GAP} border-l-2 border-current/25 pl-[1em] italic`}>
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className={`${GAP} list-disc space-y-[0.35em] pl-[1.25em] marker:opacity-50`}>{children}</ul>
    ),
    number: ({ children }) => (
      <ol className={`${GAP} list-decimal space-y-[0.35em] pl-[1.4em] marker:opacity-60`}>{children}</ol>
    ),
  },
  listItem: ({ children }) => <li className="pl-[0.25em] [&>ul]:mt-[0.35em] [&>ol]:mt-[0.35em]">{children}</li>,
  marks,
};

/** The blocks, for copy inside a link: its own links set as their words. */
const linklessBlocks: PortableTextComponents = {
  ...blocks,
  marks: { ...marks, link: ({ children }) => <>{children}</> },
};

/** Only the words and their marks: no element of its own. */
const words: PortableTextComponents = {
  /* Inline, every block is set as normal: see Rich below. */
  block: { normal: ({ children }) => <>{children}</> },
  marks,
};

const isBlock = (value: RichValue | RichBlock): value is RichBlock => !Array.isArray(value);

/** A paragraph still stored as a plain string, as a block, so it sets the same way. */
const fromString = (text: string, i: number): RichBlock => ({
  _type: "block",
  _key: `plain${i}`,
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: `plain${i}s`, text, marks: [] }],
});

/**
 * A React key for one paragraph of a run: its block key, or its place for
 * copy not yet moved to rich text, which is still a plain string.
 */
export const richKey = (block: RichBlock | string, index: number) =>
  typeof block === "string" ? index : block._key;

/**
 * A run cut where a paragraph may stand alone: each list kept whole, so a
 * component that sets its paragraphs one by one never splits one up.
 */
export function richChunks(value: RichValue): RichValue[] {
  const chunks: RichBlock[][] = [];
  value.forEach((block, i) => {
    const prev = value[i - 1];
    if (block?.listItem && prev?.listItem) chunks[chunks.length - 1].push(block);
    else chunks.push([block]);
  });
  return chunks;
}

/**
 * Copy from the rich text editor.
 *
 * By default the blocks are set as blocks: paragraphs, headings, quotes and
 * lists, so it belongs in a <div> (or a <blockquote>, <li>, <dd>), never in
 * a <p>, which cannot hold them.
 *
 * `inline` sets only the words, for a heading or a line inside a sentence:
 * paragraphs are joined by a line break and any heading or list is read as
 * plain text. The fields set that way use the inline editor in the Studio.
 *
 * `linkless` sets links as their words, for copy inside a card that is a
 * link itself: a link cannot hold another.
 *
 * A string is set as it is: copy not yet moved to rich text reads the same.
 */
export function Rich({
  value,
  inline = false,
  linkless = false,
}: {
  value: RichValue | RichBlock | string | null | undefined;
  inline?: boolean;
  linkless?: boolean;
}): ReactNode {
  if (!value) return null;
  if (typeof value === "string") return value;
  const list = (isBlock(value) ? [value] : value).map((block, i) =>
    typeof block === "string" ? fromString(block, i) : block,
  );

  if (!inline) {
    return <PortableText value={list as never} components={linkless ? linklessBlocks : blocks} />;
  }

  return list.map((block, i) => (
    <Fragment key={block._key ?? i}>
      {i > 0 && <br />}
      <PortableText
        value={{ ...block, style: "normal", listItem: undefined, level: undefined } as never}
        components={words}
      />
    </Fragment>
  ));
}
