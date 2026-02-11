import Link from "next/link";
import type { SidebarSection } from "@/lib/docs";
import { cn } from "@/lib/utils/cn";
import { DocsVersionSelector } from "./docs-version-selector";

type VersionTarget = {
  version: string;
  href: string;
  isLatest: boolean;
};

type DocsSidebarProps = {
  sidebar: SidebarSection[];
  currentSectionSlug: string | null;
  currentDocSlug: string | null;
  versionTargets: VersionTarget[];
  selectedVersion: string;
};

export function DocsSidebar(props: DocsSidebarProps) {
  const {
    sidebar,
    currentSectionSlug,
    currentDocSlug,
    versionTargets,
    selectedVersion,
  } = props;

  return (
    <aside className="md:sticky md:top-4 md:h-[calc(100vh-2rem)] md:overflow-hidden">
      <div className="flex h-full flex-col">
        <DocsVersionSelector
          options={versionTargets}
          selectedVersion={selectedVersion}
        />

        <nav className="min-h-0 flex-1 space-y-4 overflow-y-auto mt-6 px-2">
          {sidebar.map((section) => (
            <div key={section.slug}>
              <h3 className="mb-1">
                <Link
                  href={section.href}
                  className={cn(
                    "text-sm font-semibold",
                    section.slug === currentSectionSlug
                      ? "text-zinc-900"
                      : "text-blue-700 hover:text-blue-800",
                  )}
                >
                  {section.label}
                </Link>
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = item.slug === currentDocSlug;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "block rounded px-2 py-1 text-sm",
                          isActive
                            ? "bg-zinc-900 text-white"
                            : "text-zinc-700 hover:bg-zinc-100",
                        )}
                      >
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
