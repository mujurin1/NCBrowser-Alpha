/**
 * `False`なら例外を出す
 * @param condition
 */
export function assert<T>(condition: T): asserts condition {
  if (!condition) throw new Error("Assertion Failed");
}

export type Fn<A extends any[] = [], R extends any = void> = (...arg: A) => R;
