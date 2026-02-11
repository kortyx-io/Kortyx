import path from "node:path";

export type DocsConfig = {
  versions: string[];
  latestVersion: string;
  docsRoot: string;
};

export const docsConfig: DocsConfig = {
  // Keep this list explicit so version ordering/cutovers are intentional.
  versions: ["v0"],
  latestVersion: "v0",
  docsRoot: path.join(process.cwd(), "src", "docs"),
};

if (!docsConfig.versions.includes(docsConfig.latestVersion)) {
  throw new Error(
    `Invalid docs config: latestVersion "${docsConfig.latestVersion}" is not in versions.`,
  );
}
