/**
 * The share cards: what a link to the site shows on LinkedIn, X, Slack or in
 * a message. Every route's opengraph-image returns one of two, 1200 × 630:
 *
 *   - the page's own picture, as it is: an editor's social image, a
 *     project's featured image, an insight's cover. Sanity's image CDN crops
 *     it around its hotspot and sends it as a JPEG, passed on unchanged, so a
 *     photograph stays small enough for every app (WhatsApp drops previews
 *     over about 300 KB, which a redrawn PNG of a photograph easily is);
 *   - the brand card, public/og.png, with the page's name set in the open
 *     band between the mark and the line at its foot, for a page with no
 *     picture of its own.
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
  /** The page's picture, cropped to 1200 × 630: its featured image or cover. */
  readonly image?: string | null;
  /** The social image an editor set, which comes before the picture. */
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

/**
 * A picture from Sanity's CDN, already cropped and encoded. Cached: its
 * address names the asset and the crop, so a new picture is a new address.
 */
async function picture(url: string): Promise<{ data: string; type: string } | null> {
  "use cache";
  const res = await fetch(url);
  if (!res.ok) return null;
  return {
    data: Buffer.from(await res.arrayBuffer()).toString("base64"),
    type: res.headers.get("content-type") ?? "image/jpeg",
  };
}

export async function shareImage(card: ShareCard | null): Promise<Response> {
  /* The page's own picture, as it is. */
  const source = card?.custom ?? card?.image;
  const photo = source ? await picture(source) : null;
  if (photo) {
    return new Response(Buffer.from(photo.data, "base64"), {
      headers: {
        "Content-Type": photo.type,
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  }

  const [dmSans, arial, cardPng] = await assets;
  const options = {
    ...OG_SIZE,
    fonts: [
      { name: "DM Sans", data: dmSans, weight: 500 as const, style: "normal" as const },
      { name: "Arial", data: arial, weight: 400 as const, style: "normal" as const },
    ],
  };
  const title = card ? fit(card.title) : "";

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
