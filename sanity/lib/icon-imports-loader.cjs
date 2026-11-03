/**
 * sanity-plugin-analytics 0.2.0 was built for @sanity/icons 3, which named
 * every icon at the package's root. Version 5, the one Sanity 6 uses, has
 * only Icon there and each icon at a path of its own: SearchIcon is at
 * @sanity/icons/Search. This rewrites the plugin's imports to those paths
 * as it is bundled (turbopack.rules in next.config.ts), so the plugin is
 * left as installed. Drop it once the plugin imports them itself.
 *
 *   import { SearchIcon as SearchIcon2, LaunchIcon } from "@sanity/icons";
 *   →
 *   import { SearchIcon as SearchIcon2 } from "@sanity/icons/Search";
 *   import { LaunchIcon } from "@sanity/icons/Launch";
 */
module.exports = function iconImports(source) {
  return source.replace(/import\s*\{([^}]*)\}\s*from\s*["']@sanity\/icons["'];?/g, (_, names) =>
    names
      .split(",")
      .map((spec) => spec.trim())
      .filter(Boolean)
      .map((spec) => `import { ${spec} } from "@sanity/icons/${spec.split(/\s+as\s+/)[0].replace(/Icon$/, "")}";`)
      .join("\n"),
  );
};
