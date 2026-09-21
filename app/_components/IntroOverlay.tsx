"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { wordmarkAperture } from "@/lib/brand";

/*
  The logo mark (logo-mark.svg), measured in its own 500-unit box: the letters
  run from x 13.5 to 486 and stand from y 198 to 301.5. GH ends at 201.5 and
  ST starts at 294; the 92.5 units between them are the O.

  Everything is laid out as a share of that 472.5-unit strip, so the mark
  scales as one piece at any screen width. The movement is in globals.css
  ("The intro"), in `cqw` — a hundredth of the mark's own width.
*/
const LEFT = 13.5;
const RIGHT = 486;
const TOP = 198;
const W = RIGHT - LEFT;
const H = 301.5 - TOP;
const O_CENTRE = (201.5 + 294) / 2;
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/** The pill when the mark first opens: the O at the hero aperture's 2.58 : 1. */
const PILL_W = H * 2.58;
/**
 * The frame the intro holds, and where it sits in the reel: the laptop shot,
 * which runs from 5.0s to 6.3s and is followed by the reel's steadier
 * stretch, so the picture comes alive at the hand-off without a burst of
 * cuts. (The reel's opening seconds are a fast montage.)
 */
const REEL_STILL = { src: "/media/intro-still.jpg", at: 5.3 } as const;

/** The pill's own scale at the end of the grow (see `gs-intro-pill`). */
const PILL_END = 1.1434;

/*
  The two drawings are matched on G and H, whose flat tops and bottoms are the
  edges a mismatch would show on. Measured at high resolution: in the mark,
  GH stands from y 198.25 to 301.625; in the hero's 1512 x 323 box, from
  20.17 to 302.33. (The hero's S and T run about 4% taller than its G and H,
  and the mark's do not, so no single scale matches both halves to the pixel;
  the hand-off's crossfade covers the hair of difference left on ST.)
*/
const MARK_GH_TOP = 198.25;
const MARK_GH_H = 301.625 - MARK_GH_TOP;
const HERO_W = 1512;
const HERO_GH_TOP = 20.17;
const HERO_GH_BOTTOM = 302.33;

/** Where the page's own pieces are, read off the hero once it has laid out. */
function measureGrowth(mark: HTMLElement): CSSProperties | null {
  const art = document.querySelector(".gs-hero-rise")?.getBoundingClientRect();
  if (!art) return null;

  const u = art.width / HERO_W;
  /* px per mark unit, on the hero and as the mark stands now. */
  const onHero = ((HERO_GH_BOTTOM - HERO_GH_TOP) * u) / MARK_GH_H;
  const markW = mark.offsetWidth;
  const now = markW / W;

  /* The mark's GH centre line and O centre, untransformed, in the middle. */
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const markH = markW * (H / W);
  const fromX = vw / 2 - markW / 2 + (O_CENTRE - LEFT) * now;
  const fromY = vh / 2 - markH / 2 + (MARK_GH_TOP + MARK_GH_H / 2 - TOP) * now;

  /* The same points on the hero. */
  const toX = art.left + (wordmarkAperture.x + wordmarkAperture.width / 2) * u;
  const toY = art.top + ((HERO_GH_TOP + HERO_GH_BOTTOM) / 2) * u;

  return {
    "--gs-grow-origin": `${fromX}px ${fromY}px`,
    "--gs-grow-x": `${toX - fromX}px`,
    "--gs-grow-y": `${toY - fromY}px`,
    "--gs-grow-scale": `${onHero / now}`,
  } as CSSProperties;
}

/**
 * One half of the mark: a window onto the logo, drawn twice — the grey
 * watermark underneath and the ink over it. The colour change is the ink
 * copy fading off, and both are plain images rather than masks, so the fade
 * is a single layer's opacity the compositor can run without repainting.
 */
function Half({ from, to, side }: { from: number; to: number; side: string }) {
  const width = to - from;
  const art: CSSProperties = {
    left: pct(-from, width),
    top: pct(-TOP, H),
    width: pct(500, width),
    height: pct(500, H),
  };
  return (
    <div
      className={`gs-intro-${side} absolute top-0 h-full overflow-hidden`}
      style={{ left: pct(from - LEFT, W), width: pct(width, W) }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logos/logo-mark-grey.svg"
        alt=""
        draggable={false}
        className="absolute max-w-none"
        style={art}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logos/logo-mark.svg"
        alt=""
        draggable={false}
        className="gs-intro-ink absolute max-w-none"
        style={art}
      />
    </div>
  );
}

/**
 * The intro: the logo mark rises, opens, grows into the cover, and is the
 * cover.
 *
 * 1. Rise — logo-mark.svg, in ink and as drawn, slides up to the middle of
 *    the screen and holds.
 * 2. Open — the halves slide apart and the pill is uncovered by the opening
 *    itself: it parts from a line at the centre on the halves' own curve,
 *    and its ends reach the letters as the letters stop.
 * 3. Grow — the whole mark scales until it runs off both edges of the screen,
 *    landing exactly on the hero's wordmark: same letters, same lines, the
 *    pill on the hero's pill.
 * 4. Grey — the letters soften from ink to the hero's watermark grey.
 *
 * At that point the layer and the page under it are the same picture — the
 * hero's reel is parked on the frame the pill has been holding — and the
 * layer dissolves onto it as the reel starts to play — there
 * is no second logo to cut to. The header and the claim come in as it goes.
 *
 * All the movement is CSS keyframes keyed to `html[data-intro]`, running from
 * the first paint on transform and opacity alone. The only thing measured is
 * where the hero sits, which the grow needs and which is known long before
 * the grow begins.
 */
export function IntroOverlay() {
  const [done, setDone] = useState(false);
  const [growth, setGrowth] = useState<CSSProperties | null>(null);
  const markRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const frames: number[] = [];
    const timers: number[] = [];

    if (root.dataset.intro !== "pre") {
      frames.push(requestAnimationFrame(() => setDone(true)));
      return () => frames.forEach(cancelAnimationFrame);
    }

    window.scrollTo(0, 0);
    let finished = false;
    const reel = document.querySelector<HTMLVideoElement>(
      ".gs-hero-aperture video",
    );

    const measure = () => {
      if (markRef.current) setGrowth(measureGrowth(markRef.current));
    };
    frames.push(requestAnimationFrame(measure));
    window.addEventListener("resize", measure);

    /* Once a named part of the layer has finished moving, run `fn`. */
    const whenDone = (selector: string, fn: () => void) => {
      const running = document.querySelector(selector)?.getAnimations() ?? [];
      if (!running.length) {
        frames.push(requestAnimationFrame(fn));
        return;
      }
      Promise.all(running.map((a) => a.finished))
        .then(fn)
        .catch(fn);
    };

    /* As soon as the grow lands, register the pill and park the hero's reel
       on the still, so by the time the grey has settled the two are the same
       picture and nothing waits on it. */
    whenDone(".gs-intro-pill", () => {
      if (finished) return;

      /* Registration: rounding in the scale chain can leave the pill a
         pixel off the hero's — the size lands true, the position may not.
         Measure the two and close the gap now, while the grey is
         still changing — a quarter-second nudge of a pixel is invisible,
         and the layer then dissolves onto an exact copy of itself. */
      const pill = document.querySelector<HTMLElement>(".gs-intro-pill");
      const hole = document
        .querySelector(".gs-hero-aperture")
        ?.getBoundingClientRect();
      if (pill && hole) {
        const at = pill.getBoundingClientRect();
        /* `translate` sits outside the pill's own transform, so it moves in
           the stage's space: undo the stage's scale to get there. */
        const stage = at.width / (pill.offsetWidth * PILL_END);
        const dx =
          (hole.left + hole.width / 2 - (at.left + at.width / 2)) / stage;
        const dy =
          (hole.top + hole.height / 2 - (at.top + at.height / 2)) / stage;
        pill.style.transition =
          "translate 250ms ease-out, scale 250ms ease-out";
        pill.style.translate = `${dx}px ${dy}px`;
      }

      /* Park the hero's reel on the still's frame, so the layer dissolves
         onto the same picture — and it plays on from there as it goes. */
      if (reel) {
        reel.pause();
        reel.currentTime = REEL_STILL.at;
      }
    });

    /* The grey has settled: the layer dissolves onto the page it has become,
       the header and the claim come in as it goes, and then it is removed. */
    const handOver = () => {
      if (finished) return;
      finished = true;
      void reel?.play().catch(() => {});
      root.dataset.intro = "reveal";
      timers.push(window.setTimeout(() => setDone(true), 650));
      timers.push(window.setTimeout(() => delete root.dataset.intro, 1150));
    };
    whenDone(".gs-intro-ink", handOver);

    /* A floor, in case an animation never reports back. */
    timers.push(window.setTimeout(handOver, 7000));

    return () => {
      finished = true;
      window.removeEventListener("resize", measure);
      frames.forEach(cancelAnimationFrame);
      timers.forEach(clearTimeout);
    };
  }, []);

  if (done) return null;

  return (
    <div
      aria-hidden
      className="gs-intro pointer-events-none fixed inset-0 z-[70] bg-surface-page"
    >
      <div
        className="gs-intro-stage absolute inset-0 grid place-items-center"
        style={growth ?? undefined}
      >
        <div
          ref={markRef}
          className="gs-intro-mark relative"
          style={{ width: "min(60vw, 52rem)", aspectRatio: `${W} / ${H}` }}
        >
          <div
            className="gs-intro-pill absolute top-0 h-full overflow-hidden rounded-full bg-ink-950"
            style={{
              left: pct(O_CENTRE - PILL_W / 2 - LEFT, W),
              width: pct(PILL_W, W),
            }}
          >
            {/* A still of the reel's calmest shot, so the opening shows one
                composed picture rather than the reel's opening montage. The
                hero's reel is parked on this same frame and plays on as the
                layer dissolves, so the picture comes alive with no seam. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={REEL_STILL.src}
              alt=""
              draggable={false}
              className="size-full object-cover"
            />
          </div>

          <Half from={LEFT} to={201.5} side="left" />
          <Half from={294} to={RIGHT} side="right" />
        </div>
      </div>
    </div>
  );
}
