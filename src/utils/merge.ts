/**
 * Deep‑merge two objects.
 * - When a key exists in both objects:
 *   • If both values are plain objects → merge them recursively.
 *   • If both are arrays → value from `b` replaces value from `a`.
 *   • Otherwise → value from `b` wins.
 */
export function merge<
  A extends Record<string, any>,
  B extends Record<string, any>,
>(a: A, b: B): A & B {
  const isObject = (val: unknown): val is Record<string, any> =>
    val !== null && typeof val === "object" && !Array.isArray(val);

  const result: Record<string, any> = { ...a };

  for (const key of Object.keys(b)) {
    const aVal = (a as any)[key];
    const bVal = (b as any)[key];

    if (isObject(aVal) && isObject(bVal)) {
      result[key] = merge(aVal, bVal);
    } else {
      // arrays, primitives, or mixed types → b wins (arrays are replaced)
      result[key] = bVal;
    }
  }

  return result as A & B;
}
