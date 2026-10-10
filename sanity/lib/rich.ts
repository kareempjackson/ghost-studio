/**
 * Rich text, to and from plain strings.
 *
 * The site reads it as plain text where markup cannot go: a <meta> tag, an
 * alt or aria attribute. The seed and the migration write it from plain
 * strings, which is how the copy stood before the fields were rich: a run of
 * paragraphs was a list of strings, one paragraph a string with blank lines.
 */

import type { Rich } from "../types";

/** The words, without the marks: paragraphs joined by a blank line. */
export function toPlain(value: Rich | string | null | undefined): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value
    .map((block) => (block.children ?? []).map((span) => span.text ?? "").join(""))
    .join("\n\n");
}

let n = 0;
const key = () => `r${(n++).toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/** `[words](href)` is a link and `**words**` bold; everything else, the words. */
const INLINE = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;

function block(text: string) {
  const markDefs: { _type: "link"; _key: string; href: string }[] = [];
  const children: { _type: "span"; _key: string; text: string; marks: string[] }[] = [];
  const span = (words: string, marks: string[] = []) =>
    words && children.push({ _type: "span", _key: key(), text: words, marks });

  let at = 0;
  for (const match of text.matchAll(INLINE)) {
    span(text.slice(at, match.index));
    if (match[1]) {
      const link = { _type: "link" as const, _key: key(), href: match[2] };
      markDefs.push(link);
      span(match[1], [link._key]);
    } else {
      span(match[3], ["strong"]);
    }
    at = match.index + match[0].length;
  }
  span(text.slice(at));
  if (!children.length) span(" ");

  return { _type: "block", _key: key(), style: "normal", markDefs, children };
}

/**
 * One block per paragraph. A list of strings is a run, one paragraph each; a
 * string splits at its blank lines, and its single line breaks stay inside
 * the block, where the site sets them as line breaks. Links and bold are
 * written as in Markdown: `[words](href)` and `**words**`.
 */
export function toBlocks(value: string | readonly string[]) {
  const paragraphs =
    typeof value === "string" ? value.split(/\n\s*\n/).map((p) => p.trim()) : [...value];
  return paragraphs.filter(Boolean).map(block);
}

/* ---- Following the schema -------------------------------------------------- */

type FieldDef = {
  name?: string;
  type: string;
  fields?: FieldDef[];
  of?: FieldDef[];
};

/**
 * Turns every plain string or list of strings sitting in a rich text field
 * into blocks, following the schema to find them. Anything already rich, or
 * not a richText field, is left as it is. Returns the same object when
 * nothing changed, so a caller can tell.
 */
export function richify<T>(doc: T, schemaTypes: readonly FieldDef[]): T {
  const named = new Map(schemaTypes.map((t) => [t.name!, t]));

  const walk = (value: unknown, def: FieldDef | undefined): unknown => {
    if (!def || value == null) return value;
    if (def.type === "richText" || def.type === "inlineText") {
      const plain =
        typeof value === "string" ||
        (Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === "string"));
      return plain ? toBlocks(value as string | string[]) : value;
    }
    if (Array.isArray(value)) {
      const members = def.of ?? named.get(def.type)?.of ?? [];
      let changed = false;
      const next = value.map((item) => {
        const type = item && typeof item === "object" ? (item as { _type?: string })._type : undefined;
        const member =
          members.find((m) => m.name === type || m.type === type) ??
          (members.length === 1 ? members[0] : undefined);
        const out = walk(item, member);
        if (out !== item) changed = true;
        return out;
      });
      return changed ? next : value;
    }
    if (typeof value === "object") {
      const fields = def.fields ?? named.get(def.type)?.fields;
      if (!fields) return value;
      let changed = false;
      const next: Record<string, unknown> = { ...(value as Record<string, unknown>) };
      for (const field of fields) {
        const before = next[field.name!];
        const after = walk(before, field);
        if (after !== before) {
          next[field.name!] = after;
          changed = true;
        }
      }
      return changed ? next : value;
    }
    return value;
  };

  const type = (doc as { _type?: string })._type;
  return walk(doc, type ? named.get(type) : undefined) as T;
}
