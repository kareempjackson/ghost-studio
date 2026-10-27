import "server-only";

import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

/**
 * The one client that writes from the running site: the contact form's
 * enquiries and the newsletter's subscribers. Its token is its own
 * (SANITY_API_FORM_TOKEN, an Editor token made for this), so it can be
 * revoked without touching previews or the seed. Null when the token is not
 * set: the contact form then says it could not send unless the studio was
 * emailed, and a sign-up is kept in Resend alone.
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
