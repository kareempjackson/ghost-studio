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
 * The pill plays the reel from the moment the mark opens. Under it is the
 * reel's poster, from the home page in Sanity: it is what the pill shows
 * until the reel has a frame to show, and again whenever it stops to
 * buffer, so the opening never shows a black or frozen pill.
 *
 * At that point the layer and the page under it are the same picture — the
 * hero's reel is set to the frame the pill's has reached and plays on with
 * it — and the layer dissolves onto it: there is no second logo to cut to.
 * The header and the claim come in as it goes.
 *
 * All the movement is CSS keyframes keyed to `html[data-intro]`, on transform
 * and opacity alone. The layer is held at `pre` — mark below the screen, pill
 * shut — until its drawings have decoded and it has been on the screen for a
 * frame; only then does the clock start, so a slow load opens on the rise
 * rather than part-way through it. The only thing measured is where the hero
 * sits, which the grow needs and which is known long before the grow begins.
 */
export function IntroOverlay({
  film,
  poster,
}: {
  /** The hero's reel, played in the pill. */
  film: string;
  /** Its poster, shown in the pill until the reel plays and while it buffers. */
  poster: string;
}) {
  const [done, setDone] = useState(false);
  const [growth, setGrowth] = useState<CSSProperties | null>(null);
  /* Whether the pill's reel is showing frames; the poster shows until it is. */
  const [rolling, setRolling] = useState(false);
  const markRef = useRef<HTMLDivElement>(null);
  const filmRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const frames: number[] = [];
    const timers: number[] = [];

    /* `pre` is the layer held, `run` the clock going — the inline script
       starts it on its own if the bundle is slow, so both are ours to see
       through. Anything else means the intro is not this page's to play. */
    const playing =
      root.dataset.intro === "pre" || root.dataset.intro === "run";
    if (!playing) {
      frames.push(requestAnimationFrame(() => setDone(true)));
      return () => frames.forEach(cancelAnimationFrame);
    }

    window.scrollTo(0, 0);
    let finished = false;
    const reel = document.querySelector<HTMLVideoElement>(
      ".gs-hero-aperture video",
    );

    /* The pill's own reel. It is only given its source now, with the intro
       known to be playing: the layer is in every home page's markup, and a
       visit that skips the intro should not load the reel a second time. */
    const own = filmRef.current;
    if (own) {
      own.src = film;
      void own.play().catch(() => {});
    }

    /* The hero's reel to the frame the pill's has reached, and playing, so
       the layer dissolves onto the same moving picture. Only a real drift is
       corrected: a seek takes the reel a moment to land, and two reels
       already in step would come out of it a few frames apart. */
    const sync = () => {
      if (!reel) return;
      if (
        own &&
        own.readyState >= 2 &&
        own.currentTime > 0 &&
        Math.abs(reel.currentTime - own.currentTime) > 0.25
      ) {
        reel.currentTime = own.currentTime;
      }
      void reel.play().catch(() => {});
    };

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

    /* The grey has settled: the layer dissolves onto the page it has become,
       the header and the claim come in as it goes, and then it is removed. */
    const handOver = () => {
      if (finished) return;
      finished = true;
      sync();
      root.dataset.intro = "reveal";
      timers.push(window.setTimeout(() => setDone(true), 650));
      timers.push(window.setTimeout(() => delete root.dataset.intro, 1150));
    };

    /* With the clock running, wait on the moving parts themselves. */
    let following = false;
    const follow = () => {
      if (finished || following) return;
      following = true;

      /* As soon as the grow lands, register the pill and bring the hero's
         reel to the pill's frame, so by the time the grey has settled the two
         are the same picture and nothing waits on it. */
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

        sync();
      });

      whenDone(".gs-intro-ink", handOver);

      /* A floor, in case an animation never reports back. */
      timers.push(window.setTimeout(handOver, 7000));
    };

    /* Start the clock. Until this runs the layer holds its first frame — the
       mark below the screen, the pill shut — so however long the page takes
       to appear, what it opens on is the rise about to begin. */
    const start = () => {
      if (finished) return;
      if (root.dataset.intro === "pre") root.dataset.intro = "run";
      if (root.dataset.intro !== "run") return;
      /* The animations are on the elements from the next style pass; wait
         for it before asking them when they are done. */
      frames.push(requestAnimationFrame(follow));
    };

    /*
      Wait for the layer's own drawings — the two copies of the mark and the
      reel's poster — so the rise is not a blank box filling in, and give it a frame
      on the screen before it moves. `decode` on an image already in the
      document resolves as soon as it is ready to paint; `ready` is a floor,
      for a drawing that never arrives.
    */
    const art = Array.from(
      document.querySelectorAll<HTMLImageElement>(".gs-intro img"),
    );
    const ready = new Promise<void>((resolve) =>
      timers.push(window.setTimeout(resolve, 2000)),
    );
    if (root.dataset.intro === "run") {
      /* Already going, started by the inline script's own timer. */
      frames.push(requestAnimationFrame(follow));
    }

    void Promise.race([
      Promise.all(art.map((img) => img.decode().catch(() => {}))),
      ready,
    ]).then(() => {
      if (finished) return;
      /* One frame held, so the first thing seen is the mark at the foot of
         the screen rather than the first step of the rise. */
      frames.push(
        requestAnimationFrame(() => frames.push(requestAnimationFrame(start))),
      );
    });

    return () => {
      finished = true;
      window.removeEventListener("resize", measure);
      frames.forEach(cancelAnimationFrame);
      timers.forEach(clearTimeout);
    };
  }, [film]);

  if (done) return null;

  return (
    <div
      aria-hidden
      /* The page transition moves every piece of the page but the ones kept
         back. The intro is a layer over all of it, and fading it with the
         page would show the page through it — so it is kept back too. */
      data-page-keep
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
            {/* The reel's poster, underneath: what the pill shows until the
                reel has a frame to show, and whenever it stops to buffer. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={poster}
              alt=""
              draggable={false}
              className="absolute inset-0 size-full object-cover"
            />
            {/* The reel itself, over it once it is playing. No source in the
                markup: the effect gives it one when the intro plays. */}
            <video
              ref={filmRef}
              muted
              loop
              playsInline
              preload="none"
              onPlaying={() => setRolling(true)}
              onWaiting={() => setRolling(false)}
              onEmptied={() => setRolling(false)}
              className={`absolute inset-0 size-full object-cover transition-opacity duration-200 ${
                rolling ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>

          <Half from={LEFT} to={201.5} side="left" />
          <Half from={294} to={RIGHT} side="right" />
        </div>
      </div>
    </div>
  );
}
