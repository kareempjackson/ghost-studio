/**
 * The plus that turns into a cross: two rules, and the pair of them turned
 * 45 degrees. Drawn rather than swapped, so the two states are the same mark
 * at two angles and nothing jumps.
 */
export function Toggle({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden
      className={`relative block size-3.5 shrink-0 transition-[transform,color] duration-300 ease-out ${
        open ? "rotate-45 text-accent" : "rotate-0 text-ink-950"
      }`}
    >
      <span className="absolute top-1/2 left-0 block h-[1.5px] w-full -translate-y-1/2 bg-current" />
      <span className="absolute top-0 left-1/2 block h-full w-[1.5px] -translate-x-1/2 bg-current" />
    </span>
  );
}
