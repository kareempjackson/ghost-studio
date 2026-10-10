import type { StructureResolver } from "sanity/structure";
import { families } from "../lib/links";
import { fixedPages, singletons } from "./schemaTypes";

const SITE = ["siteSettings", "navigation", "footer", "chat"];
const PAGES = [
  "homePage",
  "aboutPage",
  "servicesPage",
  "whoWeServePage",
  "workPage",
  "contactPage",
  "approachPage",
];

/** Pages with pages of their own under them, at /[page]/[slug]. */
const SUBPAGES: Record<string, { type: string; title: string }> = {
  whoWeServePage: { type: "audience", title: "Audience pages" },
  approachPage: { type: "phase", title: "Phase pages" },
};

/** Newest first, as /insights lists them. */
const NEWEST = [{ field: "publishedAt", direction: "desc" as const }];

/** Newest first, as a family's archive lists its stories. */
const LATEST = [{ field: "date", direction: "desc" as const }];

/**
 * The desk, in the order an editor looks for things: the work and the
 * insights first, then the pages, then the bands pages share, then the
 * settings every page carries. Singletons open straight onto their one
 * document; a page with pages under it opens onto itself and them.
 */
export const structure: StructureResolver = (S) => {
  const single = (type: string) => {
    const { title } = singletons.find((s) => s.type === type)!;
    return S.listItem()
      .title(title)
      .id(type)
      .child(S.document().schemaType(type).documentId(type).title(title));
  };

  const page = (type: string) => {
    const sub = SUBPAGES[type];
    if (!sub) return single(type);
    const { title } = singletons.find((s) => s.type === type)!;
    return S.listItem()
      .title(title)
      .id(type)
      .child(
        S.list()
          .title(title)
          .items([
            S.listItem()
              .title(`${title} page`)
              .id(type)
              .child(S.document().schemaType(type).documentId(type).title(title)),
            S.documentTypeListItem(sub.type).title(sub.title),
          ]),
      );
  };

  /* Everything /insights is made of, in one place: the pieces, the topics
     that file them, and the page that lists them. */
  const insights = S.listItem()
    .title("Insights")
    .id("insights")
    .schemaType("article")
    .child(
      S.list()
        .title("Insights")
        .items([
          S.listItem()
            .title("All insights")
            .id("all-insights")
            .schemaType("article")
            .child(S.documentTypeList("article").title("All insights").defaultOrdering(NEWEST)),
          S.listItem()
            .title("By topic")
            .id("insights-by-topic")
            .child(
              S.documentTypeList("insightTopic")
                .title("By topic")
                .child((topicId) =>
                  S.documentList()
                    .title("Insights")
                    .schemaType("article")
                    .filter(`_type == "article" && topic._ref == $topicId`)
                    .params({ topicId })
                    .defaultOrdering(NEWEST)
                    /* A new insight started here is filed under this topic. */
                    .initialValueTemplates([
                      S.initialValueTemplateItem("insight-by-topic", { topicId }),
                    ]),
                ),
            ),
          S.documentTypeListItem("insightTopic").title("Topics"),
          S.divider(),
          single("insightsPage"),
        ]),
    );

  /* The Ghost family in one place: each member's page, and the stories
     filed under it. A story started from a member's list is filed there. */
  const family = S.listItem()
    .title("Ghost family")
    .id("ghost-family")
    .child(
      S.list()
        .title("Ghost family")
        .items([
          ...families.map(({ slug, title }) =>
            S.listItem()
              .title(title)
              .id(slug)
              .child(
                S.list()
                  .title(title)
                  .items([
                    S.listItem()
                      .title(`${title} page`)
                      .id(`familyPage-${slug}`)
                      .child(
                        S.document()
                          .schemaType("familyPage")
                          .documentId(`familyPage-${slug}`)
                          .title(title),
                      ),
                    S.listItem()
                      .title("Stories")
                      .id(`${slug}-stories`)
                      .schemaType("familyStory")
                      .child(
                        S.documentList()
                          .title(`${title} stories`)
                          .schemaType("familyStory")
                          .filter(`_type == "familyStory" && family == $family`)
                          .params({ family: slug })
                          .defaultOrdering(LATEST)
                          .initialValueTemplates([
                            S.initialValueTemplateItem("story-in-family", { family: slug }),
                          ]),
                      ),
                  ]),
              ),
          ),
          S.divider(),
          S.listItem()
            .title("All stories")
            .id("all-stories")
            .schemaType("familyStory")
            .child(S.documentTypeList("familyStory").title("All stories").defaultOrdering(LATEST)),
        ]),
    );

  const sections = singletons
    .map((s) => s.type as string)
    .filter((type) => !SITE.includes(type) && !PAGES.includes(type));

  return S.list()
    .title("Content")
    .items([
      S.documentTypeListItem("project").title("Projects"),
      insights,
      family,
      S.divider(),
      S.listItem()
        .title("Pages")
        .child(
          S.list()
            .title("Pages")
            .items([
              ...PAGES.map(page),
              S.divider(),
              /* The family pages live with their stories, under Ghost family. */
              ...fixedPages.filter((group) => group.type !== "familyPage").map((group) =>
                S.listItem()
                  .title(group.title)
                  .child(
                    S.list()
                      .title(group.title)
                      .items(
                        group.slugs.map((slug) =>
                          S.listItem()
                            .title(slug)
                            .id(`${group.type}-${slug}`)
                            .child(
                              S.document()
                                .schemaType(group.type)
                                .documentId(`${group.type}-${slug}`)
                                .title(slug),
                            ),
                        ),
                      ),
                  ),
              ),
            ]),
        ),
      S.listItem()
        .title("Sections")
        .child(S.list().title("Sections").items(sections.map(single))),
      S.divider(),
      ...SITE.map(single),
    ]);
};
