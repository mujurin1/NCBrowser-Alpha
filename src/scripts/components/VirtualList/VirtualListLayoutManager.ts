import { minHeight } from "@mui/system";
import { Trigger } from "../../common/Trigger";
import { assert } from "../../utils/util";

/**
 * リストに表示する要素のレイアウト
 */
export type ItemLayout = {
  /** アイテムのインデックス */
  readonly index: number;
  /** アイテムのTOP位置 */
  readonly top: number;
  /** アイテムの高さ */
  readonly height: number;
};

/**
 * 実際に並べる行のレイアウト
 */
export type RowLayout = {
  /** 行のキー */
  readonly key: string;
  /** アイテム */
  readonly itemLayout: ItemLayout;
};

/**
 * リストの実際に並べる行全体のレイアウト
 */
export type LineupLayout = {
  /** 全行の高さの合計 */
  readonly height: number;
  /** 各行レイアウトの配列 */
  readonly rows: RowLayout[];
};

export class VirtualListLayoutManager {
  /** リストビューの幅 */
  #viewportWidht = 0;
  /** リストビューの高さ */
  #viewportHeihgt = 0;
  /** スクロール位置 */
  #scrollTop = 0;

  /** 行の最小幅.デフォルトの高さとしても利用する */
  #minHeight: number;
  /** アイテムのレイアウトの配列 */
  #itemLayouts: ItemLayout[] = [];
  /** 表示する行レイアウト配列 */
  #rowLayouts: RowLayout[] = [];

  readonly #onRecomputedLayout = new Trigger();
  readonly #onScroll = new Trigger<[number]>();

  /**
   * レイアウトが変更された
   */
  public readonly onRecomputedLayout =
    this.#onRecomputedLayout.asSetOnlyTrigger();
  /**
   * スクロール位置が変更された
   */
  public readonly onScroll = this.#onScroll.asSetOnlyTrigger();

  /**
   * コンストラクタ
   * @param minRowHeight 最小の行の高さ.デフォルトの高さとしても利用される
   * @param itemCount アイテムの数
   */
  public constructor(minRowHeight: number, itemCount: number) {
    this.#minHeight = minRowHeight;
    this.#itemLayouts = createItemLayout(itemCount, this.#minHeight);
    this.recomputeLayoutItems();
  }

  /**
   * リストビューを描画するのに必要なレイアウトを返す
   * @returns
   */
  public getLayout(): LineupLayout {
    const lastItem = this.#itemLayouts.at(-1);
    if (lastItem == null) {
      return { height: 0, rows: this.#rowLayouts };
    }
    return {
      height: lastItem.top + lastItem.height,
      rows: this.#rowLayouts,
    };
  }

  /**
   * リストビューのサイズを変更する
   * @param width 幅
   * @param height 高さ
   */
  public setViewportSize(width: number, height: number): void {
    if (width === this.#viewportWidht && height === this.#viewportHeihgt)
      return;
    this.#viewportWidht = width;
    this.#viewportHeihgt = height;
    this.recomputeLayoutItems();
  }

  /**
   * 指定位置までスクロールする
   * @param top スクロール座標
   */
  public setScrollPosition(top: number): void {
    if (top === this.#scrollTop) return;
    this.#scrollTop = top;
    this.recomputeLayoutItems();
  }

  /**
   * 行の高さの最小値をセットする
   * @param minHeight 最小の高さ
   */
  public setMinRowHeight(minHeight: number) {
    if (minHeight === this.#minHeight) return;
    this.#minHeight = minHeight;
    this.recomputeLayoutItems();
  }

  /**
   * アイテムの数をセットする
   * @param itemCount アイテムの数
   */
  public setItemCount(itemCount: number) {
    this.#itemLayouts = createItemLayout(
      itemCount,
      this.#minHeight,
      this.#itemLayouts
    );

    this.recomputeLayoutItems();
  }

  /**
   * 指定アイテム行の高さをセットする
   * @param itemIndex セットするアイテムのインデックス
   * @param height 高さ
   */
  public setRowHeight(itemIndex: number, height: number): void {
    const dif = height - this.#itemLayouts[itemIndex].height;
    if (dif === 0) return;
    this.#itemLayouts[itemIndex] = {
      ...this.#itemLayouts[itemIndex],
      height,
    };
    for (let i = itemIndex + 1; i < this.#itemLayouts.length; i++) {
      this.#itemLayouts[i] = {
        ...this.#itemLayouts[i],
        top: this.#itemLayouts[i].top + dif,
      };
    }

    const lastRow = this.#rowLayouts.at(0);
    assert(lastRow != null);
    if (itemIndex < lastRow.itemLayout.index) {
      this.#onScroll.fire(this.#scrollTop + dif);
    }

    this.recomputeLayoutItems();
  }

  /**
   * レイアウトの再計算
   */
  private recomputeLayoutItems() {
    const linenupTop = this.#scrollTop;
    const linenupBottom = linenupTop + this.#viewportHeihgt;

    const indexFrom = binarySearch(this.#itemLayouts, linenupTop);
    const indexTo = binarySearch(this.#itemLayouts, linenupBottom);

    const numViews = Math.max(this.#rowLayouts.length, indexTo - indexFrom + 1);
    this.#rowLayouts = [];

    for (let i = indexFrom; i < indexFrom + numViews; i++) {
      if (i <= indexTo && this.#itemLayouts[i] != null) {
        this.#rowLayouts.push({
          key: `${i % numViews}`,
          itemLayout: {
            ...this.#itemLayouts[i],
            top: this.#itemLayouts[i].top - this.#scrollTop,
          },
        });
      } else {
        this.#rowLayouts.push({
          key: `${i % numViews}`,
          itemLayout: { index: -1, height: 0, top: 0 },
        });
      }
    }

    this.#onRecomputedLayout.fire();
  }
}

/**
 * アイテムのレイアウトを生成する\
 * すでにあるレイアウトに追加で生成もできる
 * @param itemCount アイテムの数
 * @param height 高さ
 * @param layouts 指定するとすでにあるレイアウトの続きから生成する
 */
function createItemLayout(
  itemCount: number,
  height: number,
  layouts?: ItemLayout[]
): ItemLayout[] {
  let itemLayouts: ItemLayout[];
  let top = 0;

  if (layouts == null || layouts.length == 0) {
    itemLayouts = [];
  } else if (itemCount < layouts.length) {
    return layouts.splice(0, itemCount);
  } else {
    itemLayouts = layouts;
    const lastItem = itemLayouts.at(-1);
    assert(lastItem != null);
    top = lastItem.top + height;
  }

  for (let i = itemLayouts.length; i < itemCount; i++) {
    itemLayouts[i] = { index: i, height, top };
    top += height;
  }

  return itemLayouts;
}

/**
 * `itemLayouts`から`y`を超えない限界の値のインデックスを返す
 * @param itemLayouts
 * @param y
 */
function binarySearch(itemLayouts: ItemLayout[], y: number): number {
  let from = 0;
  let to = itemLayouts.length;

  while (to > from + 1) {
    const mid = Math.floor((from + to) / 2);

    if (itemLayouts[mid].top === y) return mid;
    if (itemLayouts[mid].top > y) to = mid;
    else from = mid;
  }
  return from;
}
