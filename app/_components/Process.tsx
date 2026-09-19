import { process } from "@/lib/process";
import { ProcessIcon } from "./ProcessIcon";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The four steps, two by two.
 *
 * Each card is a black plate carrying the step's mark and a grey leaf
 * carrying the words: the step, the question it answers, what it involves,
 * and what comes out of it. The plate is the picture and the leaf is the
 * caption, so the two halves always sit in that order.
 */
export function Process() {
  const total = pad(process.steps.length);

  return (
    <section
      aria-label="How we work"
      className="relative z-10 bg-surface-page px-5 pb-28 sm:px-8 lg:px-12 lg:pb-44"
    >
      <ol className="grid gap-4 xl:grid-cols-2 xl:gap-5">
        {process.steps.map((step, index) => (
          <li
            key={step.title}
            className="flex flex-col overflow-hidden rounded-[0.625rem] bg-[#f0efed] sm:flex-row"
          >
            {/* Square at every width: the plate is a tile, not a banner. */}
            <div className="relative flex aspect-square w-full shrink-0 items-center justify-center rounded-[0.625rem] bg-black sm:w-[17.5rem] xl:w-[18rem]">
              <span className="absolute top-4 left-4 font-mono text-[0.6875rem] leading-none tracking-[0.04em] text-ink-300">
                {pad(index + 1)} / {total}
              </span>
              <ProcessIcon name={step.icon} />
              <span className="absolute bottom-4 left-4 font-mono text-[0.625rem] leading-none tracking-[0.06em] text-ink-500 uppercase">
                {process.mark}
              </span>
            </div>

            <div className="flex min-w-0 flex-1 flex-col px-5 pt-5 pb-5 sm:px-6">
              <span className="font-mono text-[0.75rem] leading-none text-ink-500">
                {pad(index + 1)}
              </span>
              <h3 className="mt-3 text-[1.375rem] leading-[1.15] font-normal tracking-[-0.03em] text-primary">
                {step.title}
              </h3>

              <div className="mt-auto pt-8">
                <p className="text-[0.9375rem] leading-[1.35] font-medium tracking-[-0.01em] text-primary">
                  {step.question}
                </p>
                <p className="mt-1.5 max-w-[26rem] text-[0.875rem] leading-[1.5] text-ink-600">
                  {step.body}
                </p>
              </div>

              <p className="-mr-6 mt-4 border-t border-ink-200 pt-4 font-mono text-[0.6875rem] leading-none text-primary">
                {step.outputs.join("  ·  ")}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
