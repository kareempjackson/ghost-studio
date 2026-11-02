import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, studioUrl } from "../env";

/**
 * Fields the code reads as values rather than shows as words: colours, links,
 * anchors, icon names, filter keys. In draft mode every other string carries
 * invisible edit markers for the Presentation overlays; these must not, or a
 * colour stops being a colour and a filter stops matching.
 */
const NOT_COPY = new Set([
  "ground",
  "ink",
  "href",
  "slug",
  "id",
  "icon",
  "topic",
  "category",
  "disciplines",
  "src",
  "video",
  "aspect",
  "fit",
  "poster",
  "image",
  "portrait",
  "email",
  /* The home page's moments: their conditions, and the dates and kinds of
     what is new, are read, not shown. Their lines are copy. */
  "when",
  "publishedAt",
  "studioTimeZone",
  "region",
  "countries",
  /* The way of working a contact band line is for: compared, not shown. */
  "track",
]);

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  stega: {
    studioUrl,
    filter: (props) =>
      props.sourcePath.some((segment) => typeof segment === "string" && NOT_COPY.has(segment))
        ? false
        : props.filterDefault(props),
  },
});
