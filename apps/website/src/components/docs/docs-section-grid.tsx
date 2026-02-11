import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SectionItem = {
  href: string;
  title: string;
  description: string;
};

type DocsSectionGridProps = {
  title: string;
  items: SectionItem[];
};

export function DocsSectionGrid(props: DocsSectionGridProps) {
  const { title, items } = props;

  return (
    <section className="max-w-5xl pb-20">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
        {title}
      </h1>
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full cursor-pointer border-zinc-200 transition-colors hover:border-zinc-300 hover:bg-zinc-50">
              <CardHeader>
                <CardTitle className="text-4xl font-semibold tracking-tight text-zinc-900">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl leading-9 text-zinc-700">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
