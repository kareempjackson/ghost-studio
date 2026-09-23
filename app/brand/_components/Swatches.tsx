import {
  absolute,
  bestTextOn,
  contrastRatio,
  passesNonText,
  reportRatio,
  wcagLevel,
  type ColorPairing,
  type ColorRamp,
  type SemanticColors,
} from "@/lib/brand";
import { CopyValue } from "./CopyValue";
import { Eyebrow, Pill, Type } from "./ui";

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

/**
 * A ramp, with the contrast of every step against paper and against ink shown
 * inline. The numbers are computed from the tokens, not typed in — which is
 * the only way a contrast note stays true after someone nudges a hex.
 */
export function Ramp({
  name,
  ramp,
  note,
}: {
  name: string;
  ramp: ColorRamp;
  note: string;
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2 border-t border-edge pt-4">
        <Type role="label" as="h4" className="text-primary">
          {name}
        </Type>
        <Type role="body-s" className="text-secondary" measure>
          {note}
        </Type>
      </div>

      <ul className="grid grid-cols-2 gap-px bg-edge sm:grid-cols-4 lg:grid-cols-11">
        {STEPS.map((step) => {
          const hex = ramp[step];
          const onWhite = contrastRatio(hex, absolute.white);
          const onBlack = contrastRatio(hex, absolute.black);
          const label = bestTextOn(hex, [absolute.black, absolute.white]);

          return (
            <li key={step} className="bg-surface-page">
              <div
                className="flex h-16 items-end p-2"
                style={{ backgroundColor: hex }}
              >
                <span
                  className="font-sans text-[0.6875rem] font-bold uppercase tracking-[0.12em]"
                  style={{ color: label }}
                >
                  {step}
                </span>
              </div>
              <div className="grid gap-0.5 pt-2 pb-3">
                <CopyValue value={hex.toUpperCase()} label={`${name} ${step}`} />
                <span className="font-label text-[0.6875rem] leading-4 text-disabled tabular-nums">
                  {onWhite.toFixed(1)} paper &middot; {onBlack.toFixed(1)} ink
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** The semantic layer for one theme, with a live preview of each token. */
export function SemanticTokens({
  name,
  theme,
  ground,
}: {
  name: string;
  theme: SemanticColors;
  ground: string;
}) {
  const groups = Object.entries(theme) as [string, Record<string, string>][];

  return (
    <div className="grid gap-6">
      <div className="grid gap-2 border-t border-edge pt-4">
        <Type role="label" as="h4" className="text-primary">
          {name}
        </Type>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        {groups.map(([group, tokens]) => (
          <div key={group} className="grid gap-2">
            <Eyebrow>{group}</Eyebrow>
            <ul className="grid gap-px bg-edge">
              {Object.entries(tokens).map(([key, hex]) => (
                <li
                  key={key}
                  className="flex items-center gap-3 bg-surface-page py-2"
                >
                  <span
                    aria-hidden
                    className="size-6 shrink-0 border border-edge"
                    style={{ backgroundColor: hex, borderColor: ground }}
                  />
                  <span className="min-w-0 flex-1 truncate font-label text-[0.75rem] text-secondary">
                    {group}.{key}
                  </span>
                  <CopyValue
                    value={hex.toUpperCase()}
                    label={`${group}.${key}`}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Every shipped pairing, measured. */
export function ContrastAudit({
  pairings,
}: {
  pairings: readonly ColorPairing[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[44rem] border-collapse text-left">
        <caption className="sr-only">
          Contrast ratios for every documented colour pairing, measured against
          WCAG 2.2.
        </caption>
        <thead>
          <tr className="border-b border-edge-strong">
            {["Pairing", "Sample", "Ratio", "Result", "Where"].map((h) => (
              <th key={h} scope="col" className="py-3 pr-6 align-bottom">
                <Type role="label" as="span" className="text-tertiary">
                  {h}
                </Type>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pairings.map((pair) => {
            const ratio = contrastRatio(pair.foreground, pair.background);
            const isText = pair.usage !== "non-text";
            const level = wcagLevel(ratio, pair.usage === "large" ? "large" : "normal");
            const ok = isText ? level !== "Fail" : passesNonText(ratio);
            const verdict = isText
              ? level
              : passesNonText(ratio)
                ? "Non-text pass"
                : "Non-text fail";

            return (
              <tr
                key={pair.name}
                className="border-b border-edge-subtle align-top"
              >
                <th scope="row" className="py-4 pr-6 font-normal">
                  <Type role="body-s" className="text-primary">
                    {pair.name}
                  </Type>
                </th>
                <td className="py-4 pr-6">
                  <span
                    className="inline-flex items-center px-3 py-2"
                    style={{
                      backgroundColor: pair.background,
                      color: pair.foreground,
                    }}
                  >
                    <span className="font-sans text-[0.9375rem] font-bold">
                      Filing deadline
                    </span>
                  </span>
                </td>
                <td className="py-4 pr-6">
                  <span className="font-label text-[0.8125rem] text-secondary tabular-nums">
                    {reportRatio(ratio)}
                  </span>
                </td>
                <td className="py-4 pr-6 whitespace-nowrap">
                  <Pill tone={ok ? "pass" : "fail"}>{verdict}</Pill>
                </td>
                <td className="py-4 pr-6">
                  <Type role="body-s" className="text-secondary" measure>
                    {pair.note}
                  </Type>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
