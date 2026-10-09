import type { StructureResolver } from "sanity/structure";
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

/** Newest first, as /insights lists them. */
const NEWEST = [{ field: "publishedAt", direction: "desc" as const }];

/**
 * The desk, in the order an editor looks for things: the work and the
 * insights first, then the pages, then the bands pages share, then the
 * settings every page carries. Singletons open straight onto their one
 * document.
 */
export const structure: StructureResolver = (S) => {
  const single = (type: string) => {
    const { title } = singletons.find((s) => s.type === type)!;
    return S.listItem()
      .title(title)
      .id(type)
      .child(S.document().schemaType(type).documentId(type).title(title));
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

  const sections = singletons
    .map((s) => s.type as string)
    .filter((type) => !SITE.includes(type) && !PAGES.includes(type));

  return S.list()
    .title("Content")
    .items([
      S.documentTypeListItem("project").title("Projects"),
      insights,
      S.documentTypeListItem("phase").title("Phases"),
      S.documentTypeListItem("audience").title("Audiences"),
      S.divider(),
      S.listItem()
        .title("Pages")
        .child(
          S.list()
            .title("Pages")
            .items([
              ...PAGES.map(single),
              S.divider(),
              ...fixedPages.map((group) =>
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
