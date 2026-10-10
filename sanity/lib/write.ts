import "server-only";

import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

/**
 * The one client that writes from the running site: the contact form's
 * enquiries. Its token is its own (SANITY_API_FORM_TOKEN, an Editor token
 * made for this), so it can be revoked without touching previews or the
 * seed. Null when the token is not set, and the form says it could not send.
 */
export const writeClient = process.env.SANITY_API_FORM_TOKEN
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      token: process.env.SANITY_API_FORM_TOKEN,
      useCdn: false,
      perspective: "raw",
    })
  : null;
