/**
 * Ghost Savvy Studios — the legal pages: privacy, terms and cookies.
 *
 * Written to describe what the site actually does, as of the date below:
 * no analytics, advertising or tracking cookies; one item of session storage
 * (lib/intro.ts); fonts from Adobe Fonts; pictures and live updates from
 * Sanity; films from Cloudflare R2; hosting on Vercel; and the contact form,
 * which stores an enquiry in Sanity and emails through Resend
 * (app/(site)/contact/actions.ts). The newsletter sign-up and the chat open
 * the visitor's own mail app; nothing is collected by the page itself.
 *
 * When any of that changes — an analytics tool, a new form, a new provider —
 * these documents change with it, and their date moves.
 *
 * These are a sound first draft, written to common practice for a studio
 * working with clients in the US, the Caribbean and Europe (GDPR, UK GDPR,
 * California's CCPA). They are not legal advice: have them reviewed by
 * counsel before relying on them. Copy is written with Markdown-style links
 * and bold, which the seed turns into rich text (sanity/lib/rich.ts).
 */

import { email } from "./footer";

export interface LegalSection {
  /** The anchor, so a section can be linked to directly. */
  readonly id: string;
  readonly title: string;
  readonly paragraphs: readonly string[];
  readonly list?: readonly string[];
}

export interface LegalDocument {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly updated: string;
  readonly intro: string;
  readonly sections: readonly LegalSection[];
}

/** Who the studio is, legally. */
const ENTITY = "P. Jackson & Associates LLC";
const TRADING = "Ghost Savvy Studios LLC";
const UPDATED = "10 October 2026";

const mail = `[${email}](mailto:${email})`;

/** The way to reach the studio, set at the foot of every document. */
const contact: LegalSection = {
  id: "contact",
  title: "Contact us",
  paragraphs: [
    "Questions about this document, or about your information, are welcome:",
    `${ENTITY}, doing business as ${TRADING}\nFort Lauderdale, Florida, United States\n${mail}`,
  ],
};

export const legalDocuments = {
  privacy: {
    slug: "privacy",
    title: "Privacy policy",
    description:
      "What personal information Ghost Savvy Studios collects when you visit our website or get in touch, how we use it, and the choices you have.",
    updated: UPDATED,
    intro: `This policy explains what personal information ${ENTITY}, doing business as ${TRADING} (“Ghost Savvy Studios”, “we”, “us”), collects when you visit our website or contact us, how we use it, and the choices you have. We collect very little: no advertising trackers, no analytics cookies, and we never sell your information.`,
    sections: [
      {
        id: "who-we-are",
        title: "Who we are",
        paragraphs: [
          `Ghost Savvy Studios is the trading name of ${ENTITY}, a Florida limited liability company based in Fort Lauderdale, Florida, United States. We are responsible for the personal information described in this policy (its “controller”, in the language of data protection law).`,
          `You can reach us about this policy or your information at ${mail}.`,
        ],
      },
      {
        id: "scope",
        title: "What this policy covers",
        paragraphs: [
          "This policy covers our website, the contact form, our newsletter, and your correspondence with us.",
          "When we build or run products for clients, we may handle personal information on their behalf. That work is governed by our agreement with the client and by the client’s own privacy notice, not by this policy.",
        ],
      },
      {
        id: "information-you-give-us",
        title: "Information you give us",
        paragraphs: [
          "We only collect what you choose to send us. Please don’t include sensitive information, such as health or financial details: we don’t need it to answer an enquiry.",
        ],
        list: [
          "**The contact form:** your name and email address and, if you add them, your company, the services you’re interested in, your message, your budget and your timing.",
          "**Email:** anything you include when you write to us. The chat window and the newsletter sign-up both open a message in your own email app, so what you send that way reaches us as an email.",
          "**Working together:** business contact details and project information you share during an engagement.",
        ],
      },
      {
        id: "information-collected-automatically",
        title: "Information collected automatically",
        paragraphs: [
          "We don’t use analytics, advertising or tracking cookies, and we don’t build profiles of visitors. When you load a page, some technical information is processed so the site can be delivered and kept secure:",
        ],
        list: [
          "**Server logs:** our hosting provider records your IP address, browser, the page requested and the time, to deliver the site and protect it from abuse. These logs are kept for a short period.",
          "**Fonts:** our typefaces are served by Adobe Fonts, which receives your IP address and the address of the page you’re viewing, to deliver the fonts and count page views for licensing.",
          "**Pictures, video and page updates:** these are delivered from Sanity’s and Cloudflare’s networks, which receive your IP address to send them to you.",
          "**Browser storage:** one item in your browser’s session storage remembers that you’ve seen the opening animation. It holds no personal information and is deleted when you close the tab. Our [cookie policy](/cookies) has the details.",
        ],
      },
      {
        id: "how-we-use-it",
        title: "How we use your information",
        paragraphs: [
          "We use personal information only for the purposes below. Where data protection law asks for a legal basis, it is given after each one:",
        ],
        list: [
          "**To answer your enquiry**, and to email you a confirmation that it arrived: to take the steps you’ve asked for before any contract, and our legitimate interest in replying to people who contact us.",
          "**To deliver our services** and manage our relationship with clients: to perform our contract.",
          "**To send our newsletter**, if you’ve asked for it: your consent, which you can withdraw at any time.",
          "**To run and secure the website**, and to keep spam and abuse out of the contact form: our legitimate interests.",
          "**To meet our legal obligations**, such as tax and accounting records: legal obligation.",
        ],
      },
      {
        id: "sharing",
        title: "Who we share it with",
        paragraphs: [
          "We don’t sell personal information, share it for targeted advertising, or use it to make automated decisions that significantly affect you.",
          "We may disclose information when the law requires it, to protect our rights or the safety of others, or as part of a sale or reorganisation of our business, in which case it would remain protected by this policy.",
          "Otherwise, we share it only with service providers that process it for us under contract, and only as far as they need it:",
        ],
        list: [
          "**Vercel**, which hosts the website.",
          "**Sanity**, which stores the website’s content and the messages sent through the contact form.",
          "**Resend**, which delivers the emails sent when you use the contact form.",
          "**Cloudflare**, which stores and delivers the website’s video.",
          "**Adobe**, which serves the website’s fonts.",
          "**Our email and business software providers**, which hold our correspondence and records.",
        ],
      },
      {
        id: "international-transfers",
        title: "International transfers",
        paragraphs: [
          "We are based in the United States, and our service providers may process information in the United States and other countries. If you are in the European Economic Area, the United Kingdom or Switzerland, we rely on recognised safeguards for these transfers, such as the European Commission’s Standard Contractual Clauses, or the EU–U.S. Data Privacy Framework where a provider takes part in it.",
        ],
      },
      {
        id: "retention",
        title: "How long we keep it",
        paragraphs: ["We keep personal information only for as long as we need it:"],
        list: [
          "**Enquiries that don’t lead to work:** up to two years after our last contact, then deleted.",
          "**Client records:** for the length of the engagement, and up to seven years after it ends, to meet tax, accounting and legal obligations.",
          "**Newsletter:** until you unsubscribe.",
          "**Server logs:** for a short period set by our hosting provider, typically a few days.",
        ],
      },
      {
        id: "your-rights",
        title: "Your rights and choices",
        paragraphs: [
          "Depending on where you live, you may have the right to access the personal information we hold about you, to correct it, to have it deleted, to restrict or object to how we use it, to receive a copy in a portable format, and to withdraw your consent at any time. You can stop the newsletter whenever you like by replying to any issue or emailing us.",
          "**In the European Economic Area or the United Kingdom**, you also have the right to complain to your local data protection authority. We’d welcome the chance to put things right first.",
          "**In California**, you have the right to know what personal information we collect, use and disclose; to have it corrected or deleted; and not to be treated differently for exercising these rights. We don’t sell or share personal information as California law defines those terms.",
          `To make a request, email ${mail}. We may ask you to confirm your identity before we act on it, and we’ll respond within one month.`,
        ],
      },
      {
        id: "security",
        title: "Security",
        paragraphs: [
          "We use reasonable technical and organisational measures to protect personal information, including encryption in transit, limited access, and a private store for contact form messages that only the studio can read. No method of transmitting or storing information is completely secure, so we can’t guarantee absolute security.",
        ],
      },
      {
        id: "children",
        title: "Children",
        paragraphs: [
          "Our website and services are meant for businesses and organisations, not children. We don’t knowingly collect personal information from anyone under 16. If you believe a child has sent us information, contact us and we’ll delete it.",
        ],
      },
      {
        id: "other-websites",
        title: "Other websites",
        paragraphs: [
          "Our website links to sites we don’t run, such as our social media profiles and our clients’ websites. Their privacy practices are their own, so please read their policies.",
        ],
      },
      {
        id: "changes",
        title: "Changes to this policy",
        paragraphs: [
          "We’ll update this policy when our practices or the law change. The current version is always on this page with its “last updated” date, and if a change is significant we’ll make it clear on the site or tell you directly.",
        ],
      },
      contact,
    ],
  },

  cookies: {
    slug: "cookies",
    title: "Cookie policy",
    description:
      "The cookies and browser storage the Ghost Savvy Studios website uses, the services that load with its pages, and how to control them.",
    updated: UPDATED,
    intro:
      "In short: our website doesn’t use advertising, analytics or tracking cookies. This policy explains the one small piece of browser storage we do use, the services that load with our pages, and how to control them.",
    sections: [
      {
        id: "what-cookies-are",
        title: "What cookies are",
        paragraphs: [
          "Cookies are small text files a website stores in your browser. Similar technologies, such as local and session storage, let a site keep small pieces of information in your browser too.",
          "Some are strictly necessary for a site to work. Others, such as those used for analytics or advertising, generally need your consent first.",
        ],
      },
      {
        id: "what-we-use",
        title: "What we use",
        paragraphs: [
          "We don’t use cookies to track you, measure visits or show you advertising.",
          "The only thing we store in your browser is one item of session storage, which the site needs to work as designed:",
        ],
        list: [
          "**gs-intro-played** (session storage): remembers that the opening animation has played in this tab, so it doesn’t play again as you move around the site. It holds no personal information and is deleted when you close the tab.",
        ],
      },
      {
        id: "if-you-edit-the-site",
        title: "If you sign in to edit the site",
        paragraphs: [
          "Our team edits the website through a content studio. Signing in there, or previewing changes before they’re published, stores sign-in details and sets cookies that those features need to work. They are only ever set for people who sign in, never for visitors.",
        ],
      },
      {
        id: "third-party-services",
        title: "Services that load with our pages",
        paragraphs: [
          "Some of what you see on our pages is delivered by other companies. They receive your IP address and basic technical information so they can send it to you, and we don’t use them to track you. Each describes how it handles that information in its own policy:",
        ],
        list: [
          "**Adobe Fonts** serves our typefaces: [Adobe’s privacy policy](https://www.adobe.com/privacy.html).",
          "**Sanity** delivers our pictures and keeps page content up to date: [Sanity’s privacy policy](https://www.sanity.io/legal/privacy).",
          "**Cloudflare** delivers our video: [Cloudflare’s privacy policy](https://www.cloudflare.com/privacypolicy/).",
          "**Vercel** hosts the website: [Vercel’s privacy policy](https://vercel.com/legal/privacy-policy).",
        ],
      },
      {
        id: "social-links",
        title: "Links to social media",
        paragraphs: [
          "Our links to Instagram, LinkedIn and other social networks are plain links. Those sites only set cookies if you follow a link to them, under their own policies.",
        ],
      },
      {
        id: "consent",
        title: "Consent",
        paragraphs: [
          "Because we only use storage that is strictly necessary, we don’t ask for consent or show a cookie banner. If we ever add analytics or other non-essential cookies, we’ll update this policy first and ask for your consent where the law requires it.",
        ],
      },
      {
        id: "managing-cookies",
        title: "Managing cookies and storage",
        paragraphs: [
          "You can block or delete cookies and site storage in your browser’s settings. Blocking the storage described above won’t stop our site working; you may just see the opening animation more than once. Help for the most common browsers:",
        ],
        list: [
          "[Google Chrome](https://support.google.com/chrome/answer/95647)",
          "[Safari](https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac)",
          "[Mozilla Firefox](https://support.mozilla.org/kb/clear-cookies-and-site-data-firefox)",
          "[Microsoft Edge](https://support.microsoft.com/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09)",
        ],
      },
      {
        id: "changes",
        title: "Changes to this policy",
        paragraphs: [
          "We’ll update this policy whenever what we store or load changes. The current version is always on this page with its “last updated” date. How we handle personal information more broadly is set out in our [privacy policy](/privacy).",
        ],
      },
      contact,
    ],
  },

  terms: {
    slug: "terms",
    title: "Terms of service",
    description:
      "The terms that apply when you use the Ghost Savvy Studios website.",
    updated: UPDATED,
    intro: `These terms apply when you use our website. They are an agreement between you and ${ENTITY}, doing business as ${TRADING} (“Ghost Savvy Studios”, “we”, “us”). By using the site you accept them; if you don’t, please don’t use the site.`,
    sections: [
      {
        id: "about-us",
        title: "About us",
        paragraphs: [
          `Ghost Savvy Studios is the trading name of ${ENTITY}, a limited liability company registered in Florida, United States, and based in Fort Lauderdale. You can reach us at ${mail}.`,
        ],
      },
      {
        id: "using-the-site",
        title: "Using the site",
        paragraphs: [
          "You’re welcome to use the site to learn about our work and to get in touch. When you do, please don’t:",
        ],
        list: [
          "use it in any way that breaks the law or infringes anyone’s rights;",
          "try to gain unauthorised access to the site or the systems behind it, or disrupt them;",
          "scrape, copy or harvest its content in bulk, including to train AI models, without our written permission;",
          "send spam, malicious code or misleading information through the contact form;",
          "pretend to be someone else, or misrepresent your connection with any person or organisation.",
        ],
      },
      {
        id: "intellectual-property",
        title: "Our content",
        paragraphs: [
          "The site and its content, including its text, design, graphics, video and the Ghost Savvy name and marks, belong to us or our licensors and are protected by copyright, trademark and other laws.",
          "You may view pages, print them for your own reference and share links to them. Otherwise, please don’t copy, adapt, publish or make commercial use of any of it without our written permission.",
          "Client names, logos and work shown in our case studies belong to their owners. Showing them describes the work we did; it doesn’t give you any rights in them.",
        ],
      },
      {
        id: "our-services",
        title: "Our services and prices",
        paragraphs: [
          "The site describes our services in general terms. Descriptions, prices and engagement models, such as monthly rates and minimum terms, are indicative, may change, and are not an offer that can be accepted.",
          "Any work we do for you is governed by a separate written agreement, such as a proposal, statement of work or services agreement. If that agreement and these terms differ, the agreement prevails.",
        ],
      },
      {
        id: "enquiries",
        title: "Enquiries and confidentiality",
        paragraphs: [
          "Contacting us, through the contact form or otherwise, doesn’t create a client relationship or an obligation on either side.",
          "We treat what you send with care, but please don’t share confidential or commercially sensitive information until we’ve agreed confidentiality terms, such as a non-disclosure agreement. How we handle personal information is set out in our [privacy policy](/privacy).",
        ],
      },
      {
        id: "other-websites",
        title: "Links to other websites",
        paragraphs: [
          "The site links to websites we don’t control, including our clients’ sites and social media. We aren’t responsible for their content, availability or practices, and a link isn’t an endorsement.",
        ],
      },
      {
        id: "availability",
        title: "Availability",
        paragraphs: [
          "We may change, suspend or withdraw any part of the site at any time, without notice. We work to keep it available, but we don’t promise that it will always be accessible, uninterrupted or free of errors.",
        ],
      },
      {
        id: "disclaimer",
        title: "Disclaimer",
        paragraphs: [
          "The site and its content are provided for general information, “as is” and “as available”. To the fullest extent the law allows, we make no warranties, express or implied, including about accuracy, completeness, merchantability, fitness for a particular purpose or non-infringement. Nothing on the site is professional advice for your particular situation.",
        ],
      },
      {
        id: "limitation-of-liability",
        title: "Limitation of liability",
        paragraphs: [
          "To the fullest extent the law allows, we are not liable for any indirect, incidental, special, consequential or punitive damages, or for any loss of profits, revenue, data or goodwill, arising from your use of the site or your inability to use it. Our total liability for any claim relating to the site is limited to one hundred US dollars (US$100).",
          "Nothing in these terms limits any liability that cannot be limited by law.",
        ],
      },
      {
        id: "indemnity",
        title: "Indemnity",
        paragraphs: [
          "You agree to indemnify us against claims, losses and expenses, including reasonable legal fees, that arise from your breach of these terms or your misuse of the site.",
        ],
      },
      {
        id: "governing-law",
        title: "Governing law and disputes",
        paragraphs: [
          "These terms are governed by the laws of the State of Florida, United States, without regard to its conflict of law rules. Any dispute arising from them or from your use of the site will be resolved exclusively in the state or federal courts located in Broward County, Florida, and you and we consent to their jurisdiction.",
          "If you are a consumer living outside the United States, this doesn’t take away any protection you have under the mandatory laws of the country where you live.",
        ],
      },
      {
        id: "changes",
        title: "Changes to these terms",
        paragraphs: [
          "We may update these terms from time to time. The version on this page, with its “last updated” date, is the one that applies; if you keep using the site after a change, you accept the updated terms.",
        ],
      },
      {
        id: "general",
        title: "General",
        paragraphs: [
          "If any part of these terms is found unenforceable, the rest stays in effect. If we don’t enforce a term straight away, we haven’t given up the right to enforce it later. These terms, with our [privacy policy](/privacy) and [cookie policy](/cookies), are the whole agreement between you and us about your use of the site.",
        ],
      },
      contact,
    ],
  },
} as const satisfies Record<string, LegalDocument>;
