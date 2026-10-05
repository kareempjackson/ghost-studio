import { Suspense } from "react";
import { Studio } from "./Studio";

export { metadata, viewport } from "next-sanity/studio";

/**
 * The Studio is one client app that routes itself, so every path under
 * /studio renders this page. Cache Components needs at least one param to
 * prerender against: the bare /studio shell.
 */
export function generateStaticParams() {
  return [{ tool: [] }];
}

export default function StudioPage() {
  return (
    <Suspense>
      <Studio />
    </Suspense>
  );
}
