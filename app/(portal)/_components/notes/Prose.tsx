import type { ReactNode } from "react";

type Block = { kind: "h"; text: string } | { kind: "p"; text: string } | { kind: "ul"; items: string[] };

/** Notes are written in the plainest Markdown: "## " headings, "- " lists, and paragraphs. */
export function parse(body: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ kind: "p", text: para.join(" ") });
    para = [];
  };
  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (!line) {
      flush();
    } else if (line.startsWith("## ")) {
      flush();
      blocks.push({ kind: "h", text: line.slice(3) });
    } else if (line.startsWith("- ")) {
      flush();
      const last = blocks.at(-1);
      if (last?.kind === "ul") last.items.push(line.slice(2));
      else blocks.push({ kind: "ul", items: [line.slice(2)] });
    } else {
      para.push(line);
    }
  }
  flush();
  return blocks;
}

/** **bold** inside a line, and nothing else. */
function inline(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, n) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={n} className="font-medium text-primary">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );
}

/** A note set for reading: a calm measure, headings in the label voice, lists with a quiet dash. */
export function Prose({ body, className = "" }: { body: string; className?: string }) {
  return (
    <div className={`grid max-w-[40rem] gap-4 text-[0.9375rem] leading-[1.7] tracking-[-0.005em] text-ink-800 ${className}`}>
      {parse(body).map((b, n) =>
        b.kind === "h" ? (
          <h3 key={n} className="mt-3 font-label text-[0.625rem] leading-none tracking-[0.1em] text-tertiary uppercase">
            {b.text}
          </h3>
        ) : b.kind === "ul" ? (
          <ul key={n} className="grid gap-2">
            {b.items.map((item, k) => (
              <li key={k} className="grid grid-cols-[1rem_minmax(0,1fr)] gap-2">
                <span aria-hidden className="mt-[0.8em] h-px w-2.5 bg-ink-400" />
                <span>{inline(item)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={n}>{inline(b.text)}</p>
        ),
      )}
    </div>
  );
}

/** The first paragraph, for a list's excerpt. */
export function excerpt(body: string) {
  return parse(body).find((b) => b.kind === "p")?.text ?? "";
}
