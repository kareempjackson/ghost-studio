import type { Metadata } from "next";
import { arial, dmSans } from "@/app/fonts";
import { dmSansDisplay } from "./fonts";
import "./portal.css";

export const metadata: Metadata = {
  title: { default: "Client portal", template: "%s — Ghost Savvy portal" },
  description: "Where Ghost Savvy Studios and its clients work together.",
  /* Private by nature: nothing here belongs in a search index. */
  robots: { index: false, follow: false },
};

/**
 * The portal's own root layout, beside the site's and the Studio's. None of
 * the site's chrome, intro or page transition: the portal is a tool, and its
 * navigation is its own. Moving between the site and the portal is a full
 * page load, which is what two root layouts mean.
 */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${dmSans.variable} ${arial.variable} ${dmSansDisplay.variable} h-full antialiased`}
    >
      <body className="gs-desk min-h-full text-[0.875rem] leading-normal text-primary">
        {children}
      </body>
    </html>
  );
}
