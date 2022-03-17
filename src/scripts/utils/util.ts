/**
 * `False`なら例外を出す
 * @param condition
 */
export function assert<T>(condition: T): asserts condition {
  if (!condition) throw new Error("Assertion Failed");
}

export function defaultValueArray<T extends string | number>(
  length: number,
  defaultValue: T
): T[] {
  const array: T[] = [];
  for (let i = 0; i < length; i++) array.push(defaultValue);

  return array;
}
