import Link from "next/link";

type NavItem = {
  href: string;
  title: string;
};

type DocsArticleNavigationProps = {
  previousItem: NavItem | null;
  nextItem: NavItem | null;
};

export function DocsArticleNavigation(props: DocsArticleNavigationProps) {
  const { previousItem, nextItem } = props;

  return (
    <nav className="mt-4 max-w-3xl border-t border-zinc-200 pt-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {previousItem ? (
          <Link
            href={previousItem.href}
            className="group rounded-xl border border-zinc-200 px-4 py-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
          >
            <p className="text-sm text-zinc-500">Previous</p>
            <p className="mt-1 text-lg font-semibold text-zinc-900">
              <span className="mr-2 text-zinc-400 transition-colors group-hover:text-zinc-700">
                ←
              </span>
              {previousItem.title}
            </p>
          </Link>
        ) : (
          <div />
        )}

        {nextItem ? (
          <Link
            href={nextItem.href}
            className="group rounded-xl border border-zinc-200 px-4 py-4 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50 sm:text-right"
          >
            <p className="text-sm text-zinc-500">Next</p>
            <p className="mt-1 text-lg font-semibold text-zinc-900">
              {nextItem.title}
              <span className="ml-2 text-zinc-400 transition-colors group-hover:text-zinc-700">
                →
              </span>
            </p>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </nav>
  );
}
