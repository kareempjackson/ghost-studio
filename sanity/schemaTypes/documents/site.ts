/**
 * What every page carries: the address, the header and menu, the orange
 * band and the footer, and the chat window. One document each.
 */

import { defineArrayMember, defineField, defineType } from "sanity";
import {
  action,
  colour,
  href,
  lines,
  list,
  num,
  object,
  para,
  plain,
  text,
} from "../fields";

const link = [text("label"), href()];

/** An ID the ad platforms give as a number, kept as text so nothing rounds it. */
const digits = (name: string, title: string, description: string, o: { group?: string; fieldset?: string } = {}) =>
  defineField({
    name,
    type: "string",
    title,
    description,
    ...o,
    validation: (r) => r.regex(/^\d+$/, { name: "number, digits only" }),
  });

const ADS_POLICY =
  "The privacy and cookie policies say the site runs no advertising: update them, and the cookie banner's message, before adding it.";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  groups: [
    { name: "site", title: "Site", default: true },
    { name: "tracking", title: "Tracking" },
  ],
  fieldsets: [
    {
      name: "leads",
      title: "Calls and credentials",
      description:
        "Where the site's booking and deck links lead. Link to /book or /deck from any button or link, and they go wherever these say.",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "search",
      title: "Search engines",
      description: "How Google and Bing know the site is yours, so its sitemap and search performance can be read there.",
    },
    {
      name: "analytics",
      title: "Analytics",
      description: "What counts the site's visits and conversions. An empty ID is that tool off.",
    },
    {
      name: "ads",
      title: "Advertising",
      description:
        "The pixels that let LinkedIn and Meta count conversions from ads and build audiences. Each loads only with the visitor's consent. An empty ID is that pixel off.",
    },
    {
      name: "consent",
      title: "Cookie consent",
      description: "Who is asked before a tracking cookie is set, and in what words. Shown only while a tool above is on.",
    },
  ],
  fields: [
    text("title", {
      group: "site",
      description:
        "The site's name: after the page's name in the title of every page without a meta title of its own, and on share cards.",
    }),
    plain("description", {
      group: "site",
      title: "Default meta description",
      description: "The line under the title in search results and on share cards, for a page without a meta description of its own.",
    }),
    defineField({
      name: "email",
      type: "string",
      group: "site",
      description: "The studio's address: the contact page, the footer, the chat and the forms all use it.",
      validation: (r) => r.required().email(),
    }),
    text("forYouLabel", {
      group: "site",
      required: false,
      title: "For you mark",
      description:
        "The mark on what fits a visitor: the way of working for what they need, an insight for who they are, and over a case study's summary written for them. No mark if empty.",
    }),
    defineField({
      name: "studioTimeZone",
      type: "string",
      title: "Studio time zone",
      group: "site",
      description:
        "Where the studio's clock is, as a time zone name such as America/New_York: the time {studioTime} gives in the home page's moments, and what “Hours apart” is measured from. America/New_York if empty, which keeps daylight saving.",
      initialValue: "America/New_York",
      validation: (r) =>
        r.custom((zone?: string) => {
          if (!zone) return true;
          try {
            new Intl.DateTimeFormat("en-GB", { timeZone: zone });
            return true;
          } catch {
            return "Not a time zone. Use a name like America/New_York or America/Jamaica.";
          }
        }),
    }),
    list(
      "social",
      [
        defineField({
          name: "id",
          type: "string",
          title: "Network",
          options: { list: ["instagram", "linkedin"] },
          description: "Picks the icon.",
          validation: (r) => r.required(),
        }),
        ...link,
      ],
      { group: "site", preview: { select: { title: "label", subtitle: "href" } } },
    ),
    action("headerAction", {
      group: "site",
      title: "Header action",
      description: "The button at the right of the header.",
    }),
    defineField({
      name: "bookingUrl",
      type: "url",
      title: "Booking link",
      group: "site",
      fieldset: "leads",
      description:
        "The page where a call is booked, on Cal.com, Calendly or the like. /book goes here, and each visit to it is counted. Empty, /book goes to the contact page.",
      validation: (r) => r.uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "credentialsDeck",
      type: "file",
      title: "Credentials deck",
      group: "site",
      fieldset: "leads",
      description:
        "The PDF for RFPs and procurement: /deck downloads it, and each download is counted. Anyone with the link can open it. Empty, /deck goes to the contact page.",
      options: { accept: "application/pdf" },
    }),

    /* ---- Tracking ---- */

    defineField({
      name: "googleSiteVerification",
      type: "string",
      title: "Google Search Console code",
      group: "tracking",
      fieldset: "search",
      description:
        "Proves the site is yours to Google Search Console: add the site as a URL-prefix property, choose the HTML tag method, and paste the content value of the tag it gives, without the quotes. Not needed when the site is verified by DNS or through Google Analytics.",
    }),
    defineField({
      name: "bingSiteVerification",
      type: "string",
      title: "Bing Webmaster Tools code",
      group: "tracking",
      fieldset: "search",
      description:
        "Proves the site is yours to Bing, which also feeds ChatGPT and Copilot search: add the site, choose the meta tag method, and paste the content value of the msvalidate.01 tag it gives. Not needed when the site is imported from Google Search Console.",
    }),
    defineField({
      name: "gaMeasurementId",
      type: "string",
      title: "Google Analytics measurement ID",
      group: "tracking",
      fieldset: "analytics",
      description:
        "GA4's ID for the site, like G-ABC123XYZ: in Google Analytics, Admin › Data streams › the web stream.",
      validation: (r) => r.regex(/^G-[A-Z0-9]+$/, { name: "GA4 measurement ID, like G-ABC123XYZ" }),
    }),
    defineField({
      name: "posthogKey",
      type: "string",
      title: "PostHog project key",
      group: "tracking",
      fieldset: "analytics",
      description:
        "The project API key, starting phc_: in PostHog, Settings › Project › General. Turn on cookieless mode in the same settings, or the visits of people who decline cookies are dropped.",
      validation: (r) => r.regex(/^phc_[A-Za-z0-9]+$/, { name: "PostHog project key, starting phc_" }),
    }),
    defineField({
      name: "posthogRegion",
      type: "string",
      title: "PostHog cloud",
      group: "tracking",
      fieldset: "analytics",
      description: "Where the project lives, as in its address: us.posthog.com or eu.posthog.com.",
      options: {
        list: [
          { title: "US", value: "us" },
          { title: "EU", value: "eu" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "us",
    }),
    defineField({
      name: "sessionReplays",
      type: "boolean",
      title: "Record sessions",
      group: "tracking",
      fieldset: "analytics",
      description:
        "PostHog's recordings of visits, with everything typed masked, for visitors who allow cookies; each enquiry links to the visit it came from. Session replay must be on in PostHog's project settings too.",
      initialValue: true,
    }),
    digits(
      "linkedinPartnerId",
      "LinkedIn Insight Tag partner ID",
      `From the Insight Tag's code in LinkedIn Campaign Manager: the number it sets as _linkedin_partner_id. ${ADS_POLICY}`,
      { group: "tracking", fieldset: "ads" },
    ),
    object(
      "linkedinConversions",
      [
        digits("enquiry", "Enquiry sent", "From the contact form or the site guide."),
        digits("newsletter", "Newsletter sign-up", "From the footer."),
        digits("booking", "Booking page opened", "Any link to /book."),
        digits("deck", "Credentials deck downloaded", "Any link to /deck."),
      ],
      {
        title: "LinkedIn conversions",
        group: "tracking",
        fieldset: "ads",
        description:
          "Optional. For each conversion made in Campaign Manager to be counted by an event, its conversion ID: LinkedIn counts it each time the site's event happens.",
        collapsed: true,
      },
    ),
    digits(
      "metaPixelId",
      "Meta Pixel ID",
      `In Meta Events Manager, the pixel's ID (Meta calls it a dataset). Enquiries reach Meta as Lead, newsletter sign-ups as CompleteRegistration, case studies read as ViewContent, and booking pages opened and decks downloaded as BookingOpened and DeckDownload. ${ADS_POLICY}`,
      { group: "tracking", fieldset: "ads" },
    ),
    defineField({
      name: "consentScope",
      type: "string",
      title: "Who is asked",
      group: "tracking",
      fieldset: "consent",
      description:
        "Whoever isn't asked is tracked from the first page, and can still say no from Cookie settings in the footer.",
      options: {
        list: [
          { title: "Visitors in the EEA, the UK and Switzerland", value: "regions" },
          { title: "Every visitor", value: "everyone" },
        ],
        layout: "radio",
      },
      initialValue: "regions",
    }),
    object(
      "cookieBanner",
      [
        text("message", { description: "One or two sentences: what the cookies are for." }),
        object("link", link, { description: "After the message: the cookie policy, usually." }),
        text("accept"),
        text("decline", { description: "Shown the same size as Accept: saying no must be as easy." }),
        text("settings", {
          title: "Settings link",
          description: "Among the footer's legal links, to open the banner again, e.g. Cookie settings.",
        }),
      ],
      {
        title: "Cookie banner",
        group: "tracking",
        fieldset: "consent",
        description: "Asked of the visitors above before any tracking cookie is set, and of anyone who opens it from the footer.",
        collapsed: true,
      },
    ),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});

export const navigation = defineType({
  name: "navigation",
  title: "Navigation",
  type: "document",
  fields: [
    list(
      "items",
      [
        ...link,
        defineField({
          name: "inHeader",
          type: "boolean",
          title: "In the header",
          description: "Also set inline in the header on wide screens.",
          initialValue: false,
        }),
        defineField({
          name: "audiences",
          type: "boolean",
          title: "Open onto the audiences",
          description:
            "Lists the audiences from the Who we serve page under this item, so the menu and the page cannot disagree.",
          initialValue: false,
        }),
        object(
          "intro",
          [text("label", { required: false }), text("deck", { required: false })],
          { description: "A heading and a line over the routes when the item opens.", collapsed: true },
        ),
        list("children", link, {
          description: "Routes under this one. The item becomes a toggle in the menu.",
          preview: { select: { title: "label", subtitle: "href" } },
        }),
      ],
      {
        title: "Routes",
        description: "In order. The menu numbers them by position.",
        preview: { select: { title: "label", subtitle: "href" } },
      },
    ),
    object("ventures", [
      text("label"),
      list("links", [...link, colour("ground"), colour("ink")], {
        preview: { select: { title: "label", subtitle: "href" } },
      }),
    ]),
    text("contactLabel", { description: "The menu's bottom corner." }),
    text("featureLabel", { description: "Over the one piece of work the menu carries." }),
    defineField({
      name: "feature",
      type: "reference",
      title: "Featured project",
      to: [{ type: "project" }],
      description:
        "The project on the menu's card, shown with its card picture or film. The first project in the home page's Selected work if empty.",
    }),
    text("openLabel", { description: "The menu button, for screen readers." }),
  ],
  preview: { prepare: () => ({ title: "Navigation" }) },
});

export const footer = defineType({
  name: "footer",
  title: "Footer",
  type: "document",
  fields: [
    object(
      "contactBand",
      [
        text("eyebrow"),
        lines("heading"),
        action(),
        object(
          "returning",
          [
            num("after", {
              required: false,
              title: "From visit",
              description: "The visit it is shown from, this one counted: 3 is someone on their third visit. 3 if empty.",
            }),
            text("eyebrow", { required: false, description: "The eyebrow above is kept if empty." }),
            lines("heading", { required: false, description: "One entry per line, as the design breaks it. Off if empty." }),
          ],
          {
            title: "For returning visitors",
            description:
              "What the band says instead to someone who keeps coming back, counted in their browser (the home page's moments count the same visits). The action stays the same.",
            collapsed: true,
          },
        ),
        list(
          "forTracks",
          [
            defineField({
              name: "track",
              type: "string",
              options: { list: ["build", "engage", "integrate"] },
              validation: (r) => r.required(),
            }),
            text("eyebrow", { required: false, description: "The eyebrow above is kept if empty." }),
            lines("heading"),
          ],
          {
            title: "For what they need",
            description:
              "What the band says instead to a visitor whose need leads to this way of working (lib/interest.ts). Someone back on their third visit is told the returning words first.",
            preview: { select: { title: "track", subtitle: "heading.0" } },
          },
        ),
      ],
      {
        title: "Contact band",
        description: "The orange band at the foot of most pages.",
      },
    ),
    object("explore", [
      text("label"),
      list("links", link, { preview: { select: { title: "label", subtitle: "href" } } }),
    ]),
    object("newsletter", [
      text("heading"),
      text("placeholder"),
      text("inputLabel", { description: "The field's name, for screen readers." }),
      text("action"),
      object("note", [
        text("before"),
        object("link", link),
        text("after"),
      ]),
      text("done", { description: "Once the address is on the list." }),
      text("invalid", { description: "When what was typed isn't an email address." }),
      text("failed", { description: "When the address couldn't be added: try again." }),
      object(
        "welcome",
        [
          text("subject"),
          plain("body", { description: "The letter. A blank line starts a new paragraph." }),
          lines("signoff"),
        ],
        {
          title: "Welcome email",
          description: "Sent to each new subscriber, the moment they sign up.",
        },
      ),
    ]),
    list("legal", link, { preview: { select: { title: "label", subtitle: "href" } } }),
    text("top", { description: "The back-to-top link." }),
  ],
  preview: { prepare: () => ({ title: "Footer" }) },
});

const field = (name: string) => object(name, [text("label"), text("placeholder")]);

/** The kinds of page the panel can open on, for the questions it offers there. */
export const STARTER_PLACES = [
  { title: "Any page", value: "any" },
  { title: "Home", value: "home" },
  { title: "Home, for someone back who has read our work", value: "returning" },
  { title: "A case study", value: "work" },
  { title: "An insight", value: "insights" },
  { title: "Services and the tracks", value: "services" },
  { title: "Who we serve", value: "audiences" },
  { title: "Our approach", value: "approach" },
];

/**
 * The site guide: the pill in the corner and the panel it opens. Two
 * questions narrow the work to a shortlist, the guide answers in its own
 * words from what the site says (app/api/guide), and a brief goes to the
 * studio as an enquiry, as the contact form's do.
 *
 * Stored as `chat`, the type's name since it was a chat window: a document's
 * type cannot be renamed in place.
 */
export const chat = defineType({
  name: "chat",
  title: "Site guide",
  type: "document",
  groups: [
    { name: "panel", title: "Panel", default: true },
    { name: "shortlist", title: "Shortlist" },
    { name: "ask", title: "Questions" },
    { name: "brief", title: "Brief" },
  ],
  fields: [
    object(
      "launcher",
      [text("open"), text("close"), text("label", { description: "For screen readers." })],
      { group: "panel" },
    ),
    text("heading", { group: "panel" }),
    text("disclosure", {
      group: "panel",
      description: "Under the heading: what the guide is, in a line. Say that its answers are written by AI.",
    }),
    para("intro", { group: "panel", description: "Over the two questions." }),
    text("closeLabel", { group: "panel", description: "For screen readers." }),
    object(
      "picker",
      [
        text("audienceLabel", { description: "Over the audiences, which are the ones on Who we serve." }),
        text("other", { description: "The chip after the audiences, for anyone else." }),
        text("needLabel"),
        list(
          "needs",
          [
            text("label"),
            defineField({
              name: "track",
              type: "reference",
              to: [{ type: "trackPage" }],
              description: "The way of working this points to: its terms are shortlisted.",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "discipline",
              type: "reference",
              weak: true,
              to: [{ type: "discipline" }],
              description: "Optional. Work of this kind is shortlisted first.",
            }),
            defineField({
              name: "topic",
              type: "reference",
              weak: true,
              to: [{ type: "insightTopic" }],
              description: "Optional. An insight on this topic is shortlisted; the newest one if empty.",
            }),
          ],
          { preview: { select: { title: "label", subtitle: "track.title" } } },
        ),
        text("unsure", {
          description: "The last need, for someone who doesn't know yet. It shortlists the first phase of Our approach.",
        }),
        text("skip", { description: "The way past the two questions, straight to asking." }),
        text("resultLabel", { description: "Over the shortlist." }),
        object("kinds", [text("work"), text("track"), text("insight"), text("page")], {
          description: "The label on each kind of card.",
        }),
        text("audienceLink", {
          description: "{audience}: the audience's name. The link to its page under the shortlist.",
        }),
        text("restart"),
      ],
      { group: "shortlist" },
    ),
    defineField({
      name: "exclude",
      title: "Never recommend",
      type: "array",
      group: "shortlist",
      description:
        "Work the guide never shortlists or points to: demo projects, or anything not ready to be shown off.",
      /* Weak, so a project on the list can still be deleted: the demo work is meant to be. */
      of: [defineArrayMember({ type: "reference", weak: true, to: [{ type: "project" }] })],
    }),
    list(
      "starters",
      [
        defineField({
          name: "where",
          type: "string",
          options: { list: STARTER_PLACES },
          validation: (r) => r.required(),
        }),
        lines("prompts", { description: "One question per line, as the visitor would ask it." }),
      ],
      {
        group: "ask",
        description:
          "Questions offered as chips, by the kind of page the panel is opened on. Any page is used where nothing else matches.",
        preview: { select: { title: "where", subtitle: "prompts.0" } },
      },
    ),
    object(
      "ask",
      [
        text("placeholder"),
        text("send", { description: "For screen readers: the arrow." }),
        text("reading", { description: "While an answer is being written." }),
        text("you", { description: "For screen readers: before each of the visitor's messages." }),
        text("guide", { description: "For screen readers: before each answer." }),
        text("error", { description: "When an answer could not be written." }),
        text("busy", { description: "When too many questions arrive at once." }),
        text("limit", { description: "When a conversation has run as long as it can." }),
      ],
      { group: "ask" },
    ),
    object(
      "brief",
      [
        text("open", { description: "The link at the foot of the panel." }),
        text("review", { description: "Under an answer that drafted a brief: the way to it." }),
        text("heading"),
        para("lead"),
        field("name"),
        field("email"),
        field("company"),
        field("summary"),
        text("optional", { description: "After an optional field's label." }),
        text("send"),
        text("sending"),
        text("sent", { description: "{email}: the sender's address." }),
        text("failed", { description: "{email}: the studio's address." }),
        text("note", { description: "Under the button: what happens to the conversation." }),
        text("back"),
      ],
      { group: "brief" },
    ),
  ],
  preview: { prepare: () => ({ title: "Site guide" }) },
});
