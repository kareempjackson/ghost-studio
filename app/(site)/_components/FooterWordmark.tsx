"use client";

import { motion, type Variants } from "motion/react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/**
 * The name, with the mark turning over.
 *
 * The wordmark is inlined rather than placed as an image so the R inside the
 * ® can be animated on its own. The mark sits where the artwork draws it —
 * top right, above the end of the word — the ring holds still, and the R
 * turns over and back inside it on a loop. The letters do not move: the name
 * is the constant and the R is the only thing alive in it.
 *
 * The flip is `scaleX` rather than a 3D rotation: the silhouette is the same
 * — the mark narrows to nothing and opens out again — and it renders the same
 * way in every browser, which 3D transforms on SVG do not.
 *
 * Reduced motion gets the mark, still.
 */

/** The turn over and back, and the rest before it comes round again. */
const TURN = 0.6;
const REST = 3;
const CYCLE = TURN * 2 + REST;

/**
 * Over and back, then upright until the next turn. It rests the right way
 * round — a mark held backwards reads as a fault, not a flourish.
 */
const FLIP: Variants = {
  still: { scaleX: 1 },
  flip: {
    scaleX: [1, -1, 1, 1],
    transition: {
      duration: CYCLE,
      times: [0, TURN / CYCLE, (TURN * 2) / CYCLE, 1],
      ease: [0.65, 0, 0.35, 1],
      repeat: Infinity,
    },
  },
};

const LETTERS = [
  "M0 100.881C0 40.6774 37.4634 0.00579834 97.6673 0.00579834C147.969 0.00579834 180.08 25.6943 186.768 70.3776H130.842C127.362 51.9147 115.859 42.0127 98.1992 42.0127C70.1002 42.0127 57.2616 67.1637 57.2616 100.881C57.2616 138.611 73.0482 160.016 98.1992 160.016C116.928 160.016 130.576 148.241 132.715 128.443V127.373H97.6616V88.5746H186.762V198.017H139.934V175.542H138.865C128.431 192.67 109.968 202.034 84.5458 202.034C34.787 202.028 0 161.091 0 100.881Z",
  "M367.652 31.907V4.02307H312.795V76.5337H252.857V4.02307H198V198.011H252.857V120.679H312.795V198.011H367.652V168.973C356.754 149.791 350.858 126.677 350.677 101.153C350.654 100.921 350.654 100.678 350.654 100.446C350.654 100.202 350.654 99.9702 350.677 99.7269C350.864 74.2025 356.754 51.0885 367.652 31.907Z",
  "M661.625 82.4183L615.069 71.7185C602.23 68.7705 596.611 64.2326 596.611 56.1979C596.611 46.03 605.97 40.9432 620.427 40.9432C637.011 40.9432 644.231 48.7063 645.838 59.6777H702.036C701.227 23.0235 671.793 0.00564575 623.364 0.00564575C584.882 0.00564575 558.605 12.369 547.594 34.2438C557.66 52.95 563.103 75.2323 563.273 99.7325C563.295 99.9758 563.295 100.208 563.295 100.451C563.295 100.694 563.295 100.926 563.273 101.158C563.261 102.154 563.25 103.156 563.227 104.14C569.859 108.718 577.984 112.124 587.507 114.274L634.063 124.974C646.647 127.922 652.532 133.535 652.532 142.368C652.532 154.142 641.832 159.761 626.577 159.761C608.109 159.761 597.675 150.668 595.802 134.882L559.369 135.057C556.766 146.3 552.862 156.785 547.741 166.353C560.579 188.912 588.033 202.051 626.312 202.051C674.209 202.051 708.187 180.108 708.187 138.101C708.187 109.465 692.134 89.3949 661.63 82.4352L661.625 82.4183Z",
  "M735.218 135.934V48.169H703.645V4.01755H855.094V48.169H790.069V127.639C790.069 148.779 798.098 155.738 818.966 155.738C829.671 155.738 840.371 153.865 850.273 150.923H851.342V195.074C836.359 199.624 817.896 202.034 800.503 202.034C753.675 202.034 735.212 183.571 735.212 135.94L735.218 135.934Z",
];

/** Hairlines the artwork carries between the letters; they ride with S. */
const SLIVERS = [
  "M624.448 101.147H624.426V100.44C624.426 100.672 624.426 100.915 624.448 101.147Z",
  "M563.296 100.446V101.153H563.273C563.296 100.921 563.296 100.678 563.296 100.446Z",
  "M624.448 99.7271C624.426 99.9704 624.426 100.202 624.426 100.446V99.7271H624.448Z",
  "M563.296 99.7272V100.446C563.296 100.203 563.296 99.9705 563.273 99.7272H563.296Z",
];

export function FooterWordmark() {
  const reduced = usePrefersReducedMotion();
  const state = reduced ? "still" : "flip";

  return (
    <motion.svg
      viewBox="0 0 923 204"
      role="img"
      aria-label="Ghost Savvy"
      initial="still"
      animate={state}
      className="mt-14 h-auto w-full lg:mt-20"
    >
      {LETTERS.map((d, index) => (
        <path key={index} d={d} fill="#ffffff" />
      ))}

      {SLIVERS.map((d, index) => (
        <path key={`sliver-${index}`} d={d} fill="#ffffff" />
      ))}

      {/* The ring holds still; the R inside it turns over. */}
      <g>
        <circle
          cx="902.233"
          cy="26.45"
          r="19.1686"
          stroke="#ffffff"
          strokeWidth="2.75305"
          fill="none"
        />
        <motion.path
          variants={FLIP}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          d={
            "M894.057 36.3612V16.5719H903.388C908.097 16.5719 910.452 18.4821 910.452 22.3025C910.452 26.123 907.928 28.0332 902.88 28.0332H898.303V36.3612H894.057ZM905.999 36.3612L900.31 26.8788H905.01L910.754 36.3612H905.999ZM898.303 24.735H903.127C904.116 24.735 904.877 24.5288 905.408 24.1165C905.949 23.6951 906.219 23.095 906.219 22.3163C906.219 21.5283 905.944 20.9237 905.395 20.5022C904.854 20.0808 904.075 19.8701 903.058 19.8701H898.303V24.735Z"
          }
          fill="#ffffff"
        />
      </g>
    </motion.svg>
  );
}
