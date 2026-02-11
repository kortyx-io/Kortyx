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
    <nav className="mt-4 max-w-3xl border-t border-border pt-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {previousItem ? (
          <Link
            href={previousItem.href}
            className="group rounded-xl border px-4 py-4 transition-colors hover:bg-accent"
          >
            <p className="text-sm text-muted-foreground">Previous</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              <span className="mr-2 text-muted-foreground transition-colors group-hover:text-foreground">
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
            className="group rounded-xl border px-4 py-4 text-left transition-colors hover:bg-accent sm:text-right"
          >
            <p className="text-sm text-muted-foreground">Next</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {nextItem.title}
              <span className="ml-2 text-muted-foreground transition-colors group-hover:text-foreground">
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
