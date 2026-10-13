/**
 * Ghost Savvy Studios — `/integrate/managed-services`.
 *
 * IT support as a monthly service, for teams too small for an IT department
 * and too busy to keep doing it themselves. Set from the managed services
 * comp: who it's for, the four things it covers, why it runs best after
 * Integrate, how it's priced, and the questions left over.
 *
 * PLACEHOLDER: the plate under the cover is the comp's photograph (a hand at
 * a laptop, in blue), not exported yet. Upload it to the page's Plate in the
 * Studio; until then the plate shows its ground with the wordmark across it.
 */

export interface ManagedServicesSeed {
  readonly title: string;
  readonly description: string;
  readonly eyebrow: string;
  readonly heading: readonly string[];
  readonly summary: string;
  readonly action: { readonly label: string; readonly href: string };
  readonly plate: { readonly src: string | null; readonly alt: string; readonly ground: string };
  readonly who: {
    readonly heading: string;
    readonly items: readonly { readonly title: readonly string[]; readonly body: string }[];
  };
  readonly included: {
    readonly label: string;
    readonly heading: readonly string[];
    readonly coveredLabel: string;
    readonly services: readonly {
      readonly title: readonly string[];
      readonly quote: string;
      /** Paragraphs, a blank line between them. */
      readonly body: string;
      readonly covered: readonly string[];
    }[];
  };
  readonly setup: { readonly heading: readonly string[]; readonly body: string; readonly aside: string };
  readonly pricing: { readonly heading: string; readonly body: string };
  readonly questions: {
    readonly heading: readonly string[];
    readonly items: readonly { readonly question: string; readonly answer: string }[];
  };
}

export const managedServicesPage = {
  title: "Managed services",
  description:
    "IT support without hiring an IT team. We monitor your systems, support your team and keep your devices and accounts secure.",
  eyebrow: "Work with us / Managed services",
  heading: ["IT support without", "hiring an IT team"],
  summary: "We monitor your systems, support your team and keep your devices and accounts secure.",
  action: { label: "Let’s talk", href: "/contact?model=managed-services" },
  plate: {
    src: null,
    alt: "A hand resting on a laptop in blue light, the Ghost wordmark across it.",
    ground: "#2b4a9e",
  },
  who: {
    heading: "Who this is for",
    items: [
      {
        title: ["Your IT was never", "properly set up"],
        body: "Right now your business works fine and the systems underneath it seem to be holding up. But you know you need someone to take full responsibility to ensure that everything stays that way.",
      },
      {
        title: ["Your team is spread thin", "and nobody handles IT"],
        body: "People are working from different locations and on different devices, so when a login fails or a laptop stops working, it lands on you, because there’s no one else to send it to.",
      },
      {
        title: ["Someone is doing", "IT on the side"],
        body: "There’s a person on your team who became the IT person because they were good with computers. Unfortunately, it’s taking up more of their week than anyone planned, and it isn’t the job you hired them for.",
      },
    ],
  },
  included: {
    label: "What’s included",
    heading: ["Someone to call.", "Systems you can rely on."],
    coveredLabel: "What’s covered",
    services: [
      {
        title: ["Support and", "Monitoring"],
        quote: "I need someone I can actually call.",
        body: [
          "If something breaks, your team has to stop working until it’s fixed. But those little things like managing passwords and installing software updates end up taking longer than you planned.",
          "When someone can’t get into their email twenty minutes before an important client or partner call, they send a request instead of interrupting you, and everything is working before the call starts.",
          "With us, your team gets one place to send problems. We watch your systems so issues get caught early, and updates get done without anyone having to remember them.",
        ].join("\n\n"),
        covered: [
          "Support for your whole team",
          "Monitoring and alerts",
          "Patching and updates",
          "Software licences",
          "Dealing with your vendors",
          "Monthly reporting",
        ],
      },
      {
        title: ["Cloud Infrastructure", "and Workspaces"],
        quote: "Half our files are in someone’s personal Drive.",
        body: [
          "You have files spread across personal accounts, licences that nobody is tracking or a shared drive with no structure, and you’re not sure who still has access to confidential information they shouldn’t.",
          "When a new hire starts on Monday, their email, files and software are ready before they arrive. On the other hand, when someone leaves, their access goes with them the same day.",
          "We set up Microsoft 365 or Google Workspace properly, run your environment on Azure or AWS where you need it, and keep it organised as people join and leave.",
        ].join("\n\n"),
        covered: [
          "Microsoft 365 and Google Workspace",
          "Azure and AWS environments",
          "File access and sharing",
          "Licence management",
          "Backup and recovery planning",
        ],
      },
      {
        title: ["Security &", "Compliance"],
        quote: "I don’t actually know how exposed we are.",
        body: [
          "Small teams get targeted because they usually have less in place. That means you’re more susceptible to a convincing email, a reused password, or an old laptop that nobody wiped.",
          "Someone clicks a link in an email that they thought looked real. The filter blocks the site, the device flags it, and we look into what happened. Then you get a short note explaining everything that happened.",
          "We put the basics in place and keep everything safe. Access controls, protection on every device, training for your team, and continually-tested backups.",
        ].join("\n\n"),
        covered: [
          "Device protection",
          "DNS filtering",
          "Multi-factor authentication and access control",
          "Password management",
          "Phishing training",
          "Backup checks",
          "Incident response planning",
        ],
      },
      {
        title: ["Network and", "Device Management"],
        quote: "I have no idea what’s connected to our network.",
        body: [
          "Laptops, phones, printers, the office Wi-Fi. Most businesses have never written down what they have, let alone checked whether it’s secure.",
          "If someone leaves on bad terms, their laptop is locked, their accounts are closed, and company data is off their phone by the end of the day.",
          "We document everything, lock down what needs it, and manage devices as people come and go.",
        ].join("\n\n"),
        covered: [
          "Network and firewall setup",
          "Wi-Fi security",
          "Laptop and desktop management",
          "Mobile device management",
          "VPN and remote access",
          "Full documentation",
        ],
      },
    ],
  },
  setup: {
    heading: ["If we set it up, we already", "know how it works"],
    body: "Most providers take over a system someone else built and spend the first few months figuring out what’s there. If we did the Integrate work, we start knowing every account, every connection, and why it was set up that way.",
    aside: "If you come to us for this first and the setup needs fixing, we fix that before anything else.",
  },
  pricing: {
    heading: "Pricing",
    body: "It’s a monthly arrangement, scoped to your team and your systems. We look at what you have first and then tell you what you need for your situation and what it costs.",
  },
  questions: {
    heading: ["Common", "questions"],
    items: [
      {
        question: "We already have someone who handles IT. Do we still need this?",
        answer:
          "A lot of teams keep their internal person for the day-to-day and use us for the parts that need specialist time, like security, cloud environments or documenting the network. We can coordinate with your internal IT team to determine the best fit.",
      },
      {
        question: "Do we have to switch everything over?",
        answer:
          "No. We start with what you’re already using. If something needs replacing we’ll tell you why, but we’re not going to move you onto new tools just because we prefer them.",
      },
      {
        question: "What if you didn’t do our original setup?",
        answer:
          "That’s most clients. We go through what’s there first, document it, and fix anything that’s going to cause problems before we take it on.",
      },
      {
        question: "Can you help with compliance?",
        answer:
          "We can put the controls in place that most frameworks ask for, like access management, device protection, backups and documentation.",
      },
      {
        question: "What happens if we want to stop?",
        answer:
          "You keep everything. The accounts are in your name and the documentation is yours, so whoever takes over next has what they need from the start.",
      },
    ],
  },
} as const satisfies ManagedServicesSeed;
