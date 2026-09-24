"use client";

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "motion/react";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import {
  wordmarkApertureCss,
  wordmarkApertureFraction as FR,
  wordmarkSplit,
  wordmarkSplitCss,
} from "@/lib/brand";
import { CursorPlay } from "./CursorPlay";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { Claim } from "./Claim";

/**
 * The cover, and the sequence that opens it.
 *
 * At rest it is one frame: the wordmark holding its aperture, the reel inside
 * it, and the claim set in the bottom-left corner. The letters sit at ink-100,
 * barely above the paper — they are the watermark the page is printed on, not
 * the headline. The only things at full ink are the picture in the gap and the
 * sentence under it: the studio is the gap, and what shows through it is the
 * client's.
 *
 * Then it opens. GH leaves to the left and ST to the right, and the aperture
 * they were holding grows until it is the whole screen before settling into a
 * plate the rest of the page is built around.
 *
 * Three notes on the build:
 *
 * 1. The stage is pinned, not scroll-jacked. The page scrolls at its own
 *    speed; a sticky element simply holds still while it does. Find-in-page,
 *    keyboard paging and reading order all behave normally.
 * 2. Every rectangle is measured, never guessed. The opening starts on the
 *    artwork's own aperture coordinates and is interpolated in pixels from
 *    there, so it stays registered to the letters at any viewport.
 * 3. Once the plate has settled the stage stays pinned for COVER_SVH more,
 *    and the band after it is pulled up by exactly that much, so it slides
 *    over the reel. When its top edge reaches the middle of the screen the
 *    track ends, the pin lets go, and the band pushes the stage up with it.
 *    That is sticky positioning and a negative margin, not a scroll handler.
 * 4. Anyone who has asked for reduced motion gets the resting frame and no
 *    sequence at all — not a faster one.
 */

/** Scroll distance for the opening sequence, in svh. 100 of it is the pin. */
const SEQUENCE_SVH = 250;
/**
 * How far the next band travels over the settled plate before it pushes the
 * stage away: half a screen, so the push starts when its top reaches centre.
 * The band reads this for its own negative margin, so the two cannot drift.
 */
export const COVER_SVH = 50;
const TRACK_SVH = SEQUENCE_SVH + COVER_SVH;
/** The share of the track the opening sequence takes; the rest is the cover. */
const SEQUENCE_END = (SEQUENCE_SVH - 100) / (TRACK_SVH - 100);
/** Progress at which the aperture is the full screen. */
const SPLIT = 0.55;
/** The plate it settles into, as fractions of the viewport. */
const PLATE = { side: 0.14, top: 0.19, bottom: 0.14 };
const PLATE_MIN_SIDE = 20;

interface Metrics {
  vw: number;
  vh: number;
  /** The artwork box, relative to the pinned stage. */
  ax: number;
  ay: number;
  aw: number;
  ah: number;
  headerH: number;
}

const ZERO: Metrics = { vw: 0, vh: 0, ax: 0, ay: 0, aw: 0, ah: 0, headerH: 0 };

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * A half of the wordmark, drawn as a mask so it can take the page's ink.
 *
 * Masking is wrong for the composed hero artwork, because that file paints the
 * aperture as a filled rect and a mask would flatten the opening shut along
 * with everything else. The split halves are the letters and nothing else —
 * two paths each, no ground, no rect — so there is no opening to lose, and
 * `currentColor` lets the watermark be set from a token instead of the ink
 * being baked into the file. The artwork is never recoloured; only what shows
 * through it is.
 */
function letterMask(src: string): CSSProperties {
  return {
    backgroundColor: "currentColor",
    maskImage: `url(${src})`,
    WebkitMaskImage: `url(${src})`,
    maskSize: "100% 100%",
    WebkitMaskSize: "100% 100%",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
  };
}

const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Slow at both ends, so the growth reads as one gesture rather than a slide. */
const ease = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

/**
 * The three rectangles the opening passes through, in coordinates local to
 * the artwork box — which is where the element actually lives, so its resting
 * CSS and its animated pixels describe the same position.
 */
function stages(m: Metrics): { start: Rect; full: Rect; plate: Rect } {
  const side = Math.max(PLATE_MIN_SIDE, m.vw * PLATE.side);
  return {
    start: {
      x: m.aw * FR.x,
      y: m.ah * FR.y,
      w: m.aw * FR.width,
      h: m.ah * FR.height,
    },
    full: { x: -m.ax, y: -m.ay, w: m.vw, h: m.vh },
    plate: {
      x: side - m.ax,
      y: m.vh * PLATE.top - m.ay,
      w: m.vw - side * 2,
      h: m.vh * (1 - PLATE.top - PLATE.bottom),
    },
  };
}

export function Hero() {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [m, setM] = useState<Metrics>(ZERO);
  const reduced = usePrefersReducedMotion();
  const ready = m.vw > 0 && !reduced;

  /* Measure once the layout is settled, and again whenever it can have moved. */
  useEffect(() => {
    const measure = () => {
      const stage = stageRef.current;
      const art = artRef.current;
      if (!stage || !art) return;
      const s = stage.getBoundingClientRect();
      const a = art.getBoundingClientRect();
      setM({
        vw: window.innerWidth,
        vh: window.innerHeight,
        ax: a.left - s.left,
        ay: a.top - s.top,
        aw: a.width,
        ah: a.height,
        headerH:
          parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue(
              "--gs-header-h",
            ),
          ) * 16,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /* Play only when motion is welcome; otherwise the poster frame stands. */
  useEffect(() => {
    const el = videoRef.current;
    if (!el || reduced) return;
    void el.play().catch(() => {});
  }, [reduced]);

  /*
    The background loop is silent, cropped and endless. Activating the picture
    hands over the real thing: full frame, with sound and the browser's own
    controls, which is also the pause mechanism the looping crop never had.
  */
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const restore = () => {
      if (document.fullscreenElement) return;
      el.muted = true;
      el.controls = false;
      el.loop = true;
      void el.play().catch(() => {});
    };
    document.addEventListener("fullscreenchange", restore);
    return () => document.removeEventListener("fullscreenchange", restore);
  }, []);

  async function openReel() {
    const el = videoRef.current;
    if (!el) return;
    el.muted = false;
    el.controls = true;
    el.loop = false;
    type IosVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else (el as IosVideo).webkitEnterFullscreen?.();
    } catch {
      /* Fullscreen refused: the controls and sound still stand on their own. */
    }
    await el.play().catch(() => {});
  }

  const { scrollYProgress: trackProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  /* The opening runs on its own share of the track and holds once it lands. */
  const scrollYProgress = useTransform(trackProgress, (p) =>
    clamp(p / SEQUENCE_END, 0, 1),
  );

  const S = stages(m);
  /* One interpolation, read four ways — the opening is always one rectangle. */
  const edge = (p: number, key: keyof Rect) =>
    p <= SPLIT
      ? lerp(S.start[key], S.full[key], ease(clamp(p / SPLIT, 0, 1)))
      : lerp(
          S.full[key],
          S.plate[key],
          ease(clamp((p - SPLIT) / (1 - SPLIT), 0, 1)),
        );

  /*
    x and y are transforms layered on top of the element's resting `left`/`top`,
    which already place it on the aperture. They therefore carry the *delta*
    from that resting position, not the absolute offset — adding the absolute
    value on top of the CSS would place the opening at twice its own inset.
  */
  const x = useTransform(scrollYProgress, (p) => edge(p, "x") - S.start.x);
  const y = useTransform(scrollYProgress, (p) => edge(p, "y") - S.start.y);
  const width = useTransform(scrollYProgress, (p) => edge(p, "w"));
  const height = useTransform(scrollYProgress, (p) => edge(p, "h"));

  /* Pill while it is still a letter; square the moment it stops being one. */
  const borderRadius = useTransform(scrollYProgress, (p) =>
    p <= SPLIT ? lerp(S.start.h / 2, 0, ease(clamp(p / SPLIT, 0, 1))) : 0,
  );

  const exit = useTransform(scrollYProgress, (p) =>
    ease(clamp(p / SPLIT, 0, 1)),
  );
  const leftX = useTransform(exit, (t) => `${-t * 115}%`);
  const rightX = useTransform(exit, (t) => `${t * 115}%`);

  /* The claim goes out on ink alone, gone before the opening is half grown. */
  const claimOpacity = useTransform(exit, [0, 0.45], [1, 0]);

  /*
    The header has to change ink while the picture is behind it. Driving it
    from the measured top edge rather than a guessed progress value means it
    flips exactly when the plate clears the header, at any viewport height.
  */
  const [over, setOver] = useState(false);
  useMotionValueEvent(y, "change", (v) => {
    if (!ready) return;
    /* v is the delta, so the true top edge is resting + delta + art offset. */
    setOver(S.start.y + v + m.ay < m.headerH * 0.92);
  });
  useEffect(() => {
    if (reduced) return;
    document.documentElement.dataset.heroOver = over ? "1" : "0";
    return () => {
      delete document.documentElement.dataset.heroOver;
    };
  }, [over, reduced]);

  const openingStyle = ready
    ? { x, y, width, height, borderRadius }
    : undefined;
  const claimStyle = ready ? { opacity: claimOpacity } : undefined;

  return (
    <section
      ref={trackRef}
      aria-labelledby="hero-heading"
      className="gs-hero relative"
      /* No pin, no track: reduced motion gets the resting frame, full stop. */
      style={{ height: reduced ? "auto" : `${TRACK_SVH}svh` }}
    >
      <div
        ref={stageRef}
        className={`flex h-svh flex-col overflow-hidden bg-surface-page ${
          reduced ? "relative" : "sticky top-0"
        }`}
      >
        <div className="flex flex-1 flex-col justify-center pt-[var(--gs-header-h)]">
          <div
            ref={artRef}
            className="relative w-full"
            style={{ aspectRatio: "1512 / 323" }}
          >
            {/* The intro reads the artwork box off this. */}
            <div className="gs-hero-rise absolute inset-0">
              <div className="gs-hero-slot gs-hero-slot-left absolute inset-0">
                <motion.div
                  aria-hidden
                  style={{
                    ...wordmarkSplitCss.left,
                    ...letterMask(wordmarkSplit.left.src),
                    x: leftX,
                  }}
                  className="gs-hero-letter absolute top-0 h-full text-ink-100"
                />
              </div>
              <div className="gs-hero-slot gs-hero-slot-right absolute inset-0">
                <motion.div
                  aria-hidden
                  style={{
                    ...wordmarkSplitCss.right,
                    ...letterMask(wordmarkSplit.right.src),
                    x: rightX,
                  }}
                  className="gs-hero-letter absolute top-0 h-full text-ink-100"
                />
              </div>

              {/*
              Resting position comes from the artwork's own aperture, in per
              cent, so the opening is correct before a single frame runs.
            */}
              <motion.div
                style={{ ...wordmarkApertureCss, ...openingStyle }}
                /* Dark ground for the header's ink, once it is pushed under it. */
                data-ground="dark"
                className="gs-hero-aperture absolute overflow-hidden rounded-pill bg-ink-950 will-change-[width,height,transform]"
              >
                <video
                  ref={videoRef}
                  className="size-full object-cover"
                  poster="/media/hero-poster.jpg"
                  preload="metadata"
                  muted
                  loop
                  playsInline
                  aria-label="Ghost Savvy Studios showreel"
                >
                  <source src="/media/hero.mp4" type="video/mp4" />
                </video>
                <CursorPlay onActivate={openReel} />
              </motion.div>
            </div>
          </div>
        </div>

        {/*
          The claim, in flow under the artwork rather than laid over it, so
          the two can never collide on a short screen. Its left edge is the
          header's, so the mark and the sentence hang off one line.
        */}
        <motion.div
          style={claimStyle}
          className="px-5 pb-[6svh] sm:px-8 lg:px-12"
        >
          <div className="gs-hero-claim">
            <Claim headingId="hero-heading" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
