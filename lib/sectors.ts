/**
 * Ghost Savvy Studios — who the studio is hired by.
 *
 * The services list says what the work is and the engagement models say how it
 * is bought. This says who is on the other side of the table, because a
 * programme lead deciding whether to write is first deciding whether this
 * studio has stood where they are standing.
 *
 * The four are `positioning.audience` broken into its parts — governments,
 * universities, and mission-driven organisations — with government split at
 * the line that actually changes the work: a council answers to residents in
 * public, an agency answers to a statute. Nothing here is a market the studio
 * would like to be in; a sector that cannot be evidenced comes off the list.
 *
 * Each line names the systems, not the sentiment. "Public websites,
 * engagement platforms, and service portals" is a line a procurement officer
 * can match against a notice; "digital transformation for the public sector"
 * is not.
 *
 * PLACEHOLDER: every plate but the first points at the hero poster. Drop the real
 * photography into `public/images/` and change the `image` line — plates are
 * about 12:7 and cropped with object-cover. The `art` note on each is what to
 * shoot.
 */

const PLACEHOLDER = "/media/hero-poster.jpg";

export interface Sector {
  readonly slug: string;
  readonly name: string;
  /** What the studio actually builds for them. One sentence, systems named. */
  readonly work: string;
  /** Decorative: the row's own text carries the meaning, so there is no alt. */
  readonly image: string;
  /** What the plate should eventually show. Not rendered. */
  readonly art: string;
}

export const sectors = {
  eyebrow: "Who we work with",
  items: [
    {
      slug: "local-government",
      name: "Local and municipal government",
      work: "Public websites, engagement platforms, and service portals.",
      image: "/images/city-hall.png",
      art: "A council building at street level, with the public going in.",
    },
    {
      slug: "national-agencies",
      name: "National agencies and regulators",
      work: "Case management, licensing, and the systems behind a statutory duty.",
      image: PLACEHOLDER,
      art: "A records floor. The scale of the obligation, not the architecture.",
    },
    {
      slug: "universities",
      name: "Universities and research institutes",
      work: "Admissions, student services, and the tools research is published through.",
      image: PLACEHOLDER,
      art: "A queue at a registry desk in term week. Not a prospectus shot.",
    },
    {
      slug: "mission-driven",
      name: "Mission-driven organisations",
      work: "Grant programmes, member services, and the platforms a campaign runs on.",
      image: PLACEHOLDER,
      art: "A small team in a borrowed room, working late on something public.",
    },
  ],
} as const satisfies {
  eyebrow: string;
  items: readonly Sector[];
};
