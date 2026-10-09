/**
 * The share cards: what a link to the site shows on LinkedIn, X, Slack or in
 * a message. Every route's opengraph-image renders one of three, all 1200 ×
 * 630:
 *
 *   - the page's own social image, set in its SEO fields, as it was made;
 *   - its picture (an insight's cover, a project's plate), full bleed, with
 *     the page's name over a darkened foot;
 *   - the brand card, public/og.png, with the page's name set in the open
 *     band between the mark and the line at its foot.
 *
 * Fonts and the card are read from disk; next.config.ts traces them into
 * the image routes so they are there when a card renders on demand.
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

export interface ShareCard {
  /** Small, over the title: the section, e.g. "Insights / Engineering". */
  readonly label: string;
  readonly title: string;
  /** Under the title, on a picture card only: a project's tagline. */
  readonly subtitle?: string | null;
  /** The page's picture, cropped to 1200 × 630. */
  readonly image?: string | null;
  /** The social image an editor set, used as it is. */
  readonly custom?: string | null;
}

const root = process.cwd();
const assets = Promise.all([
  readFile(join(root, "public/fonts/DMSans-Medium.ttf")),
  readFile(join(root, "public/fonts/Arial-Regular.ttf")),
  readFile(join(root, "lib/og/card.png")),
]);

/** The left edge and the measure of the brand card's own type. */
const EDGE = 86;
const MEASURE = 1028;

/** A title too long for the card, cut at a word with an ellipsis. */
function fit(title: string, max = 120) {
  const clean = title.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

/** Larger for a short name, smaller for a long one, so it holds in the band. */
const titleSize = (title: string) => (title.length <= 40 ? 64 : title.length <= 70 ? 54 : 46);

/** Satori, which draws the cards, reads no `inset`: the box spelled out. */
const FILL = { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" } as const;

const LABEL = {
  fontFamily: "Arial",
  fontSize: 19,
  lineHeight: 1.15,
  letterSpacing: "0.02em",
  textTransform: "uppercase",
} as const;

export async function shareImage(card: ShareCard | null): Promise<ImageResponse> {
  const [dmSans, arial, cardPng] = await assets;
  const options = {
    ...OG_SIZE,
    fonts: [
      { name: "DM Sans", data: dmSans, weight: 500 as const, style: "normal" as const },
      { name: "Arial", data: arial, weight: 400 as const, style: "normal" as const },
    ],
  };

  /* The editor's own image, untouched. */
  if (card?.custom) {
    return new ImageResponse(
      // eslint-disable-next-line @next/next/no-img-element
      <img src={card.custom} width={OG_SIZE.width} height={OG_SIZE.height} alt="" />,
      options,
    );
  }

  const title = card ? fit(card.title) : "";

  /* The page's picture, its name set over a darkened foot. */
  if (card?.image) {
    return new ImageResponse(
      (
        <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", background: "#000" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.image}
            width={OG_SIZE.width}
            height={OG_SIZE.height}
            alt=""
            style={{ ...FILL, objectFit: "cover" }}
          />
          <div
            style={{
              ...FILL,
              display: "flex",
              backgroundImage:
                "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.82) 100%)",
            }}
          />
          <div
            style={{
              ...FILL,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: `56px ${EDGE}px 60px`,
              color: "#fff",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", ...LABEL }}>
              <span>Ghost Savvy Studios</span>
              <span>{card.label}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", maxWidth: MEASURE }}>
              <div
                style={{
                  fontFamily: "DM Sans",
                  fontSize: titleSize(title),
                  lineHeight: 1.04,
                  letterSpacing: "-0.035em",
                }}
              >
                {title}
              </div>
              {card.subtitle && (
                <div style={{ ...LABEL, marginTop: 22, opacity: 0.8, textTransform: "none", fontSize: 24 }}>
                  {fit(card.subtitle, 90)}
                </div>
              )}
            </div>
          </div>
        </div>
      ),
      options,
    );
  }

  /* The brand card, with the page's name in its open band. */
  return new ImageResponse(
    (
      <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", background: "#000" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/png;base64,${cardPng.toString("base64")}`}
          width={OG_SIZE.width}
          height={OG_SIZE.height}
          alt=""
          style={FILL}
        />
        {card && (
          <div
            style={{
              position: "absolute",
              left: EDGE,
              top: 326,
              width: MEASURE,
              display: "flex",
              flexDirection: "column",
              color: "#fff",
            }}
          >
            <div style={{ ...LABEL, opacity: 0.6 }}>{card.label}</div>
            <div
              style={{
                marginTop: 14,
                fontFamily: "DM Sans",
                fontSize: titleSize(title),
                lineHeight: 1.04,
                letterSpacing: "-0.035em",
              }}
            >
              {title}
            </div>
          </div>
        )}
      </div>
    ),
    options,
  );
}
