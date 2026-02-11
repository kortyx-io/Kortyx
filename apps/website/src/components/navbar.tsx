import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { ThemeToggle } from "./theme-toggle";

type NavbarProps = {
  className?: string;
};

export function Navbar({ className }: NavbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background px-4",
        className,
      )}
    >
      <nav className="flex items-center gap-6">
        <Link
          href="/"
          className="text-sm font-semibold text-foreground hover:text-muted-foreground"
        >
          Kortyx
        </Link>
        <Link
          href="/docs"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Docs
        </Link>
      </nav>
      <ThemeToggle />
    </header>
  );
}
