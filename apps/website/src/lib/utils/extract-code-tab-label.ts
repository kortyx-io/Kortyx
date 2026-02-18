export function extractCodeTabLabel(
  metaValue: string | undefined,
): string | null {
  if (!metaValue) return null;

  const keyMatch = /(?:tab|label|manager|pm)=["']([^"']+)["']/i.exec(metaValue);
  if (!keyMatch?.[1]) return null;

  const value = keyMatch[1].trim();
  if (!value) return null;

  return value;
}
