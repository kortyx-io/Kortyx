export function extractCodeFileLabel(
  metaValue: string | undefined,
): string | null {
  if (!metaValue) return null;

  const keyMatch = /(?:title|file|filename|path)=["']([^"']+)["']/i.exec(
    metaValue,
  );
  if (keyMatch?.[1]) return keyMatch[1];

  const token = metaValue
    .split(/\s+/)
    .map((entry) => entry.trim().replace(/^["']|["']$/g, ""))
    .find(
      (entry) =>
        Boolean(entry) &&
        !entry.includes("=") &&
        (entry.includes("/") || entry.includes(".")),
    );

  return token ?? null;
}
