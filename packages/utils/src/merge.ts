type PlainObject = Record<string, unknown>;

const isPlainObject = (value: unknown): value is PlainObject =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * Deep merge helper that:
 * - merges plain objects recursively
 * - overwrites arrays from the right-hand side
 * - overwrites scalars from the right-hand side
 */
export function deepMergeWithArrayOverwrite<T extends PlainObject>(
  ...sources: T[]
): T {
  const result: PlainObject = {};

  for (const src of sources) {
    if (!isPlainObject(src)) continue;
    for (const [key, value] of Object.entries(src)) {
      const prev = result[key];

      if (Array.isArray(prev) && Array.isArray(value)) {
        result[key] = [...value];
      } else if (isPlainObject(prev) && isPlainObject(value)) {
        result[key] = deepMergeWithArrayOverwrite(
          prev as PlainObject,
          value as PlainObject,
        );
      } else {
        result[key] = value;
      }
    }
  }

  return result as T;
}
