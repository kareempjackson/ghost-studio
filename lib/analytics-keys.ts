/**
 * The keys the Studio's Analytics tool reads Google with, kept in Sanity at
 * a private id. The dataset is public, but a document whose id has a dot in
 * it is read only by a request with a token: the server's, through
 * lib/studio-reports.ts. The Studio edits it as Analytics keys
 * (sanity/schemaTypes/documents/keys.ts).
 */
export const ANALYTICS_KEYS_ID = "secrets.analytics";

/** A Google Cloud API key, as Google writes them. */
export const GOOGLE_API_KEY = /^AIza[0-9A-Za-z_-]{35}$/;

export interface ServiceAccount {
  readonly email: string;
  readonly privateKey: string;
}

/** The address and private key in a service account's JSON key file, or null if it isn't one. */
export function parseServiceAccount(json: string | null | undefined): ServiceAccount | null {
  if (!json) return null;
  try {
    const key = JSON.parse(json) as { type?: unknown; client_email?: unknown; private_key?: unknown };
    return key.type === "service_account" &&
      typeof key.client_email === "string" &&
      typeof key.private_key === "string" &&
      key.private_key.includes("PRIVATE KEY")
      ? { email: key.client_email, privateKey: key.private_key }
      : null;
  } catch {
    return null;
  }
}
