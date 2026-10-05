/**
 * Ghost Savvy Studios — legal pages.
 *
 * TEST CONTENT, all of it. These are placeholder documents written to the
 * usual shape of a privacy policy, terms of service and cookie policy, so the
 * routes exist and the layout can be reviewed. None of it is legal advice and
 * none of it should ship: each document needs to be written or reviewed by
 * counsel for the jurisdictions the studio operates in. Bracketed values —
 * [Company legal name], [address] and so on — are for the real details.
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

const COMPANY = "[Company legal name]";
const CONTACT = `If you have questions about this document, contact us at ${email} or write to ${COMPANY}, [address].`;

export const legalDocuments = {
  privacy: {
    slug: "privacy",
    title: "Privacy policy",
    description:
      "How Ghost Savvy Studios collects, uses and protects personal information.",
    updated: "Placeholder date",
    intro: `This placeholder policy explains how ${COMPANY} ("Ghost Savvy Studios", "we", "us") collects, uses and protects personal information when you visit this website or work with us. Test content — not for publication.`,
    sections: [
      {
        id: "information-we-collect",
        title: "Information we collect",
        paragraphs: [
          "Placeholder: we collect information you give us directly, and some information automatically when you use the site.",
        ],
        list: [
          "Contact details you provide, such as your name, email address and company.",
          "The content of messages you send us through forms or email.",
          "Technical information, such as your browser type, device and approximate location.",
          "Usage information, such as the pages you visit and how long you stay.",
        ],
      },
      {
        id: "how-we-use-it",
        title: "How we use your information",
        paragraphs: [
          "Placeholder: we use personal information to respond to enquiries, deliver our services, improve the website and meet our legal obligations.",
          "Placeholder: we do not sell personal information.",
        ],
      },
      {
        id: "legal-bases",
        title: "Legal bases for processing",
        paragraphs: [
          "Placeholder: where data protection law requires it, we rely on consent, the performance of a contract, our legitimate interests or a legal obligation.",
        ],
      },
      {
        id: "sharing",
        title: "Sharing your information",
        paragraphs: [
          "Placeholder: we share information only with service providers who help us run the website and our business — for example hosting, analytics and email — and only as needed for them to do so.",
        ],
      },
      {
        id: "retention",
        title: "How long we keep it",
        paragraphs: [
          "Placeholder: we keep personal information only for as long as we need it for the purposes above, then delete or anonymise it.",
        ],
      },
      {
        id: "your-rights",
        title: "Your rights",
        paragraphs: [
          "Placeholder: depending on where you live, you may have the right to:",
        ],
        list: [
          "Access the personal information we hold about you.",
          "Ask us to correct or delete it.",
          "Object to or restrict how we use it.",
          "Withdraw consent where we rely on it.",
          "Complain to your local data protection authority.",
        ],
      },
      {
        id: "security",
        title: "Security",
        paragraphs: [
          "Placeholder: we use appropriate technical and organisational measures to protect personal information, though no system is completely secure.",
        ],
      },
      {
        id: "changes",
        title: "Changes to this policy",
        paragraphs: [
          "Placeholder: we may update this policy from time to time. The date at the top shows when it last changed.",
        ],
      },
      {
        id: "contact",
        title: "Contact us",
        paragraphs: [CONTACT],
      },
    ],
  },

  terms: {
    slug: "terms",
    title: "Terms of service",
    description:
      "The terms that govern use of the Ghost Savvy Studios website.",
    updated: "Placeholder date",
    intro: `These placeholder terms govern your use of this website, operated by ${COMPANY}. By using the site you agree to them. Test content — not for publication.`,
    sections: [
      {
        id: "using-the-site",
        title: "Using the site",
        paragraphs: [
          "Placeholder: you may use this website for lawful purposes only, and not in a way that damages it or interferes with anyone else's use of it.",
        ],
      },
      {
        id: "intellectual-property",
        title: "Intellectual property",
        paragraphs: [
          "Placeholder: the content, design, logos and code on this website belong to us or our licensors. You may not copy or reuse them without permission.",
          "Placeholder: client work shown on the site belongs to the respective clients and is shown with their permission.",
        ],
      },
      {
        id: "services",
        title: "Our services",
        paragraphs: [
          "Placeholder: project work is governed by a separate written agreement between us and each client. These terms do not form part of any such agreement.",
        ],
      },
      {
        id: "third-party-links",
        title: "Third-party links",
        paragraphs: [
          "Placeholder: the site may link to other websites. We are not responsible for their content or practices.",
        ],
      },
      {
        id: "disclaimer",
        title: "Disclaimer",
        paragraphs: [
          "Placeholder: the website is provided as is. We try to keep it accurate and available, but make no guarantees that it will be error-free or uninterrupted.",
        ],
      },
      {
        id: "liability",
        title: "Limitation of liability",
        paragraphs: [
          "Placeholder: to the extent the law allows, we are not liable for any indirect or consequential loss arising from your use of the website.",
        ],
      },
      {
        id: "governing-law",
        title: "Governing law",
        paragraphs: [
          "Placeholder: these terms are governed by the laws of [jurisdiction], and disputes are subject to the courts of [jurisdiction].",
        ],
      },
      {
        id: "changes",
        title: "Changes to these terms",
        paragraphs: [
          "Placeholder: we may update these terms from time to time. Continued use of the site means you accept the updated terms.",
        ],
      },
      {
        id: "contact",
        title: "Contact us",
        paragraphs: [CONTACT],
      },
    ],
  },

  cookies: {
    slug: "cookies",
    title: "Cookie policy",
    description:
      "How the Ghost Savvy Studios website uses cookies and similar technologies.",
    updated: "Placeholder date",
    intro: `This placeholder policy explains how ${COMPANY} uses cookies and similar technologies on this website, and the choices you have. Test content — not for publication.`,
    sections: [
      {
        id: "what-are-cookies",
        title: "What cookies are",
        paragraphs: [
          "Placeholder: cookies are small text files stored on your device when you visit a website. Similar technologies include local and session storage.",
        ],
      },
      {
        id: "cookies-we-use",
        title: "Cookies we use",
        paragraphs: ["Placeholder: we group the cookies we use by purpose."],
        list: [
          "Strictly necessary — required for the site to work, such as remembering that you have seen the intro in this tab.",
          "Analytics — help us understand how visitors use the site so we can improve it.",
          "Preferences — remember choices you make, such as settings.",
        ],
      },
      {
        id: "third-party-cookies",
        title: "Third-party cookies",
        paragraphs: [
          "Placeholder: some cookies are set by services we use, such as analytics providers or embedded video. These are governed by those providers' own policies.",
        ],
      },
      {
        id: "managing-cookies",
        title: "Managing cookies",
        paragraphs: [
          "Placeholder: you can accept or decline non-essential cookies, and you can remove or block cookies in your browser settings. Blocking some cookies may affect how the site works.",
        ],
      },
      {
        id: "changes",
        title: "Changes to this policy",
        paragraphs: [
          "Placeholder: we may update this policy as the cookies we use change. The date at the top shows when it last changed.",
        ],
      },
      {
        id: "contact",
        title: "Contact us",
        paragraphs: [CONTACT],
      },
    ],
  },
} as const satisfies Record<string, LegalDocument>;
