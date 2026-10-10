"use client";

/**
 * The Studio, mounted at /studio by app/(studio)/studio/[[...tool]]/page.tsx.
 */

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId, studioUrl } from "./sanity/env";
import { resolve } from "./sanity/presentation";
import { fixedPages, schemaTypes, singletons } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

const singletonTypes = new Set<string>(singletons.map((s) => s.type));
const fixedTypes = new Set<string>(fixedPages.map((p) => p.type));

export default defineConfig({
  name: "ghost-savvy",
  title: "Ghost Savvy Studios",
  basePath: studioUrl,
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    /* No "new" button for a page that exists once, or once per fixed route. */
    templates: (templates) => [
      ...templates.filter(
        ({ schemaType }) => !singletonTypes.has(schemaType) && !fixedTypes.has(schemaType),
      ),
      /* An insight started from a topic's list, already filed under it. */
      {
        id: "insight-by-topic",
        title: "Insight in this topic",
        schemaType: "article",
        parameters: [{ name: "topicId", type: "string" }],
        value: ({ topicId }: { topicId: string }) => ({
          topic: { _type: "reference", _ref: topicId },
        }),
      },
      /* A story started from a family's list, already filed under it. */
      {
        id: "story-in-family",
        title: "Story in this family",
        schemaType: "familyStory",
        parameters: [{ name: "family", type: "string" }],
        value: ({ family }: { family: string }) => ({ family }),
      },
    ],
  },
  document: {
    /* A singleton can be edited and published, never duplicated or deleted. */
    actions: (actions, { schemaType }) =>
      singletonTypes.has(schemaType) || fixedTypes.has(schemaType)
        ? actions.filter(
            ({ action }) => action && !["duplicate", "delete", "unpublish"].includes(action),
          )
        : actions,
  },
  plugins: [
    structureTool({ structure }),
    presentationTool({
      resolve,
      previewUrl: { previewMode: { enable: "/api/draft-mode/enable" } },
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
