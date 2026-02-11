import Link from "next/link";
import React from "react";

type BreadcrumbItem = {
  label: string;
  href: string;
};

type DocsBreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function DocsBreadcrumbs(props: DocsBreadcrumbsProps) {
  const { items } = props;

  return (
    <nav
      className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-zinc-500"
      aria-label="Breadcrumb"
    >
      {items.map((crumb, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={`${crumb.href}-${crumb.label}`}>
            {index > 0 ? <span className="text-zinc-300">/</span> : null}
            {isLast ? (
              <span className="truncate font-medium text-zinc-700">
                {crumb.label}
              </span>
            ) : (
              <Link href={crumb.href} className="truncate hover:text-zinc-900">
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
