import { resolveDocsRoute } from "@/lib/docs";

type DocsMarkdownRouteParams = {
  slug?: string[];
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<DocsMarkdownRouteParams> },
) {
  const routeParams = await params;
  const slug = routeParams.slug ?? [];
  const resolved = await resolveDocsRoute(slug);

  if (!resolved || resolved.routeKind !== "doc") {
    return new Response("Not Found", { status: 404 });
  }

  return new Response(resolved.doc.content, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
