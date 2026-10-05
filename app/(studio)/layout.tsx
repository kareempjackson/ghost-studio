/**
 * The Studio's own root layout: none of the site's fonts, intro or page
 * transition, which would only get in the Studio's way.
 */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
