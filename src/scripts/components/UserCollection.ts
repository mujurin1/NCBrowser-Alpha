import { NcbUser } from "../LivePlatform/NcbUser";
import { Fn } from "../types";

export interface ReadonlyUserCollection extends Iterable<NcbUser> {
  length: number;

  get(key: string): NcbUser | undefined;

  /**
   * ユーザーをフィルタして新しいUserCollectionを返す
   * @param fn 欲しいユーザーの場合に`True`を返す関数
   * @returns UserCollection
   */
  filter(fn: Fn<[NcbUser], boolean>): UserCollection;

  /**
   * 最初に一致するユーザーを返す
   * @param fn 欲しい値の時`True`を返す条件式
   * @returns NcbUser | undefined
   */
  find(fn: Fn<[NcbUser], boolean>): NcbUser | undefined;

  keys(): IterableIterator<string>;
  values(): IterableIterator<NcbUser>;
}

/**
 * NcbUser用のコレクション
 *
 * 順序保証   なし\
 * キー       string(NcbUser.globalId)\
 *
 * 機能\
 *    カウント、イテレータ、フィルタ
 */
export class UserCollection implements ReadonlyUserCollection {
  #map: Map<string, NcbUser>;

  public get length(): number {
    return this.#map.size;
  }

  public constructor() {
    this.#map = new Map();
  }

  [Symbol.iterator](): Iterator<NcbUser, NcbUser, undefined> {
    return this.#map.values();
  }

  public set(...users: NcbUser[]) {
    users.forEach((user) => {
      this.#map.set(user.globalId, user);
    });
  }

  public get(key: string): NcbUser | undefined {
    return this.#map.get(key);
  }

  public filter(fn: Fn<[NcbUser], boolean>): UserCollection {
    const collection = new UserCollection();
    this.#map.forEach((user) => {
      if (fn(user)) collection.set(user);
    });
    return collection;
  }

  public find(fn: Fn<[NcbUser], boolean>): NcbUser | undefined {
    for (const [_, user] of this.#map) {
      if (fn(user)) return user;
    }
  }

  public keys(): IterableIterator<string> {
    return this.#map.keys();
  }

  public values(): IterableIterator<NcbUser> {
    return this.#map.values();
  }
}

let users: UserCollection;
