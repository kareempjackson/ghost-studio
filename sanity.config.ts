"use client";

/**
 * The Studio, mounted at /studio by app/(studio)/studio/[[...tool]]/page.tsx.
 */

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { unpublishEverywhere } from "./sanity/actions";
import { apiVersion, dataset, projectId, studioUrl } from "./sanity/env";
import { resolve } from "./sanity/presentation";
import { fixedPages, schemaTypes, singletons } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

const singletonTypes = new Set<string>(singletons.map((s) => s.type));
const fixedTypes = new Set<string>(fixedPages.map((p) => p.type));
/* What the site writes, never an editor: no "new" button, no copies. */
const siteWritten = new Set(["enquiry", "subscriber"]);
/* Unpublished, these come out of every place that shows them first. */
const takenOutOnUnpublish = new Set(["project"]);

export default defineConfig({
  name: "ghost-savvy",
  title: "Ghost Savvy Studios",
  basePath: studioUrl,
  projectId,
  dataset,
  /* Signed in by token, never by Sanity's cookie alone: the film fields send
     the editor's token to /api/r2, which asks Sanity who they are, and a
     session held only in a cookie has no token to send. */
  auth: { loginMethod: "token" },
  schema: {
    types: schemaTypes,
    /* No "new" button for a page that exists once, or once per fixed route. */
    templates: (templates) => [
      ...templates.filter(
        ({ schemaType }) =>
          !singletonTypes.has(schemaType) && !fixedTypes.has(schemaType) && !siteWritten.has(schemaType),
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
      /* A project started from a discipline's list, already tagged with it. */
      {
        id: "project-in-discipline",
        title: "Project in this discipline",
        schemaType: "project",
        parameters: [{ name: "disciplineId", type: "string" }],
        value: ({ disciplineId }: { disciplineId: string }) => ({
          disciplines: [{ _type: "reference", _ref: disciplineId, _key: disciplineId }],
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
      siteWritten.has(schemaType)
        ? /* The site writes enquiries and subscribers: they can be filed and
             deleted, not copied. */
          actions.filter(({ action }) => action !== "duplicate")
        : singletonTypes.has(schemaType) || fixedTypes.has(schemaType)
        ? actions.filter(
            ({ action }) => action && !["duplicate", "delete", "unpublish"].includes(action),
          )
        : takenOutOnUnpublish.has(schemaType)
        ? actions.map((Action) => (Action.action === "unpublish" ? unpublishEverywhere(Action) : Action))
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
