/** Section index for the guide. Shared by the page and the rail nav. */
export interface GuideSection {
  readonly id: string;
  readonly index: string;
  readonly title: string;
}

export const guideSections: readonly GuideSection[] = [
  { id: "positioning", index: "01", title: "Positioning" },
  { id: "mark", index: "02", title: "The mark" },
  { id: "colour", index: "03", title: "Colour" },
  { id: "typography", index: "04", title: "Typography" },
  { id: "space", index: "05", title: "Space & grid" },
  { id: "motion", index: "06", title: "Motion" },
  { id: "voice", index: "07", title: "Voice" },
  { id: "in-use", index: "08", title: "In use" },
  { id: "tokens", index: "09", title: "Using the tokens" },
];
