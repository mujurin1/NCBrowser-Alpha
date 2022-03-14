/**
 * `False`なら例外を出す。nullチェック
 * @param condition
 */
export function assert<T>(condition: T): asserts condition {
  if (!condition) throw new Error("Assertion Failed");
}
