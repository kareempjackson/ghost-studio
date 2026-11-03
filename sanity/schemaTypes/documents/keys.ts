/**
 * The keys the Studio's Analytics tool reads Google with: one document, at
 * the private id in lib/analytics-keys.ts, so they never leave the dataset
 * without a token. Which properties they read is set in Site settings ›
 * Tracking. GA_SERVICE_ACCOUNT_EMAIL, GA_PRIVATE_KEY and PAGESPEED_API_KEY
 * in the environment are used for whatever is empty here.
 */

import { LockIcon } from "@sanity/icons/Lock";
import { defineField, defineType } from "sanity";
import { GOOGLE_API_KEY, parseServiceAccount } from "../../../lib/analytics-keys";
import { secretInput } from "../../components/SecretInput";

export const analyticsKeys = defineType({
  name: "analyticsKeys",
  title: "Analytics keys",
  type: "document",
  icon: LockIcon,
  fields: [
    defineField({
      name: "googleServiceAccount",
      type: "text",
      title: "Google service account key",
      description:
        "What GA4 and Search Console are read as. In Google Cloud: IAM › Service accounts › the account › Keys › Add key › JSON, then paste the whole file. Turn on the Google Analytics Data API and the Google Search Console API in the same project, add the account's address as a Viewer in Google Analytics (Admin › Property access management) and as a Full user in Search Console (Settings › Users and permissions).",
      components: { input: secretInput((value) => parseServiceAccount(value)?.email ?? "Not a service account key", { multiline: true }) },
      validation: (r) =>
        r.custom((value?: string) =>
          !value || parseServiceAccount(value)
            ? true
            : "Not a service account key: paste the whole JSON file Google gave, from { to }.",
        ),
    }),
    defineField({
      name: "pagespeedKey",
      type: "string",
      title: "PageSpeed API key",
      description:
        "What Lighthouse tests on. In the same Google Cloud project: turn on the PageSpeed Insights API, then APIs & Services › Credentials › Create credentials › API key, restricted to that API. Without one, Lighthouse can't run.",
      components: { input: secretInput((value) => `Ending ${value.slice(-4)}`) },
      validation: (r) => r.regex(GOOGLE_API_KEY, { name: "Google API key, starting AIza" }),
    }),
  ],
  preview: { prepare: () => ({ title: "Analytics keys" }) },
});
