import { NcbComment } from "../LivePlatform/NcbComment";
import { Fn } from "../types";

export interface ReadonlyCommentCollection extends Iterable<NcbComment> {
  length: number;

  at(index: number): NcbComment | undefined;

  get(key: string): NcbComment | undefined;

  /**
   * コメントをフィルタして新しいCommentCollectionを返す
   * @param fn 欲しいコメントの場合に`True`を返す関数
   * @returns UserCollection
   */
  filter(fn: Fn<[NcbComment], boolean>): CommentCollection;

  /**
   * 最初に一致するコメントを返す
   * @param fn 欲しい値の時`True`を返す条件式
   * @returns NcbComment | undefined
   */
  find(fn: Fn<[NcbComment], boolean>): NcbComment | undefined;
}

/**
 * NcbComment用のコレクション
 *
 * 順序保証   追加順\
 * キー       string(NcbComment.globalId)\
 * 挿入       なし\
 * ソート     なし\
 *
 * 機能\
 *    カウント、イテレータ、フィルタ
 */
export class CommentCollection implements ReadonlyCommentCollection {
  #array: NcbComment[];
  #map: Map<string, NcbComment>;

  public get length(): number {
    return this.#array.length;
  }

  public constructor() {
    this.#array = [];
    this.#map = new Map();
  }

  [Symbol.iterator](): Iterator<NcbComment, any, undefined> {
    return this.#array.values();
  }

  public set(...comments: NcbComment[]) {
    comments.forEach((comment) => {
      this.#map.set(comment.globalId, comment);
      this.#array.push(comment);
    });
  }

  public at(index: number): NcbComment | undefined {
    return this.#array.at(index);
  }

  public get(key: string): NcbComment | undefined {
    return this.#map.get(key);
  }

  /**
   * ユーザーをフィルタして新しいCommentCollectionを返す
   * @param fn 欲しいユーザーの場合に`True`を返す関数
   * @returns CommentCollection
   */
  public filter(fn: Fn<[NcbComment], boolean>): CommentCollection {
    const collection = new CommentCollection();
    this.#array.forEach((comment) => {
      if (fn(comment)) collection.set(comment);
    });
    return collection;
  }

  /**
   * 最初に一致する要素を返す
   * @param fn 欲しい値の時`True`を返す条件式
   * @returns NcbComment | undefined
   */
  public find(fn: Fn<[NcbComment], boolean>): NcbComment | undefined {
    for (const comment of this.#array) {
      if (fn(comment)) return comment;
    }
  }
}
