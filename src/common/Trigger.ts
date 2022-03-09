export type Fn<T extends any[] = []> = (...arg: T) => void;

/**
 * トリガーへ関数の追加・削除のみさせるインターフェース
 */
export interface SetOnlyTrigger<T extends any[] = []> {
  add(fn: Fn<T>): void;
  addOnce(fn: Fn<T>): void;
  delete(fn: Fn<T>): void;
}

/**
 * 関数を登録して、呼び出してもらうやつ
 * @template T 登録する関数の引数型
 */
export class Trigger<T extends any[] = []> implements SetOnlyTrigger<T> {
  private readonly funcSet = new Set<Fn<T>>();

  /**
   * 外部へ公開するためのセット専用トリガー
   */
  public asSetOnlyTrigger(): SetOnlyTrigger<T> {
    return this;
  }

  /**
   * `fire`されたら実行される関数を追加する
   * @param fn 関数
   */
  public add(fn: Fn<T>) {
    this.funcSet.add(fn);
  }

  /**
   * `fire`されたら１度だけ実行される関数を追加する
   * @param fn 関数
   */
  public addOnce(fn: Fn<T>) {
    const onceFn = (...args: T) => {
      fn(...args);
      this.delete(onceFn);
    };
    this.add(onceFn);
  }

  /**
   * 追加した関数を削除する
   * @param fn 関数
   */
  public delete(fn: Fn<T>) {
    this.funcSet.delete(fn);
  }

  /**
   * セットされている関数を全て実行する
   * @param {T} args 実行する関数の引数
   */
  public fire(...args: T) {
    this.funcSet.forEach((fn) => fn(...args));
  }
}
