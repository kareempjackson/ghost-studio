/**
 * Where mail for the portal arrives. Each project has its own reply address
 * on the inbound subdomain, carrying a short seal so a guessed address can't
 * post into a thread; anything else goes to the studio inbox to be filed.
 *
 * The prototype's seal is a stable hash of the slug. With Resend it becomes
 * an HMAC under REPLY_ADDRESS_SECRET.
 */
export const INBOUND_DOMAIN = "in.ghostsavvy.com";
export const STUDIO_INBOX = `inbox@${INBOUND_DOMAIN}`;

function seal(slug: string) {
  let h = 2166136261;
  for (const c of slug) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0).toString(36).slice(0, 4);
}

export const replyAddress = (slug: string) => `${slug}.${seal(slug)}@${INBOUND_DOMAIN}`;
