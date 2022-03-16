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
export type ListViewLayout = {
  /** スクロールするエリアの高さ */
  readonly scrollHeight: number;
  /** 表示する行の数 */
  readonly visibleRowCount: number;
  /** 各行レイアウトの配列 */
  readonly rowLayouts: RowLayout[];
};

export class VirtualListLayoutManager {
  /** リストビューの幅 */
  #viewportWidht = 0;
  /** リストビューの高さ */
  #viewportHeight = 0;
  /** スクロール位置 */
  #scrollTop = 0;

  /** 行の最小幅.デフォルトの高さとしても利用する */
  #minHeight: number;
  /** アイテムのレイアウトの配列 */
  #itemLayouts: ItemLayout[] = [];
  // /** 表示する行レイアウト配列 */
  // #rowLayouts: RowLayout[] = [];
  /** リストビュー全体のレイアウト */
  #listViewLayout: ListViewLayout = {
    scrollHeight: 0,
    visibleRowCount: 0,
    rowLayouts: [],
  };

  public get listViewLayout() {
    return this.#listViewLayout;
  }

  /**
   * 自動スクロール\
   * 自動で`True`になる条件  一番下の行が表示される\
   * 自動で`False`になる条件 `setScrollPosition`が呼ばれる
   */
  public autoScroll: boolean = true;

  readonly #onRecomputedLayout = new Trigger();
  readonly #onScroll = new Trigger<[number]>();

  /**
   * リストビュー全体のレイアウトが変更されたら呼ばれる
   */
  public readonly onRecomputedLayout =
    this.#onRecomputedLayout.asSetOnlyTrigger();
  /**
   * スクロール位置が変更されたら呼ばれる
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
    this.recomputeLayoutItems(true);
  }

  /**
   * リストビューのサイズを変更する
   * @param width 幅
   * @param height 高さ
   */
  public setViewportSize(width: number, height: number): void {
    if (width === this.#viewportWidht && height === this.#viewportHeight)
      return;
    this.#viewportWidht = width;
    this.#viewportHeight = height;
    this.recomputeLayoutItems(true);
  }

  /**
   * 指定位置までスクロールする
   * @param top スクロール座標
   */
  public setScrollPosition(top: number): void {
    if (top === this.#scrollTop) return;
    this.autoScroll = false;
    this.#scrollTop = top;
    this.recomputeLayoutItems(false);
  }

  /**
   * 行の高さの最小値をセットする
   * @param minHeight 最小の高さ
   */
  public setMinRowHeight(minHeight: number) {
    if (minHeight === this.#minHeight) return;
    this.#minHeight = minHeight;
    // ほんとに再計算する必要があるか計算するのが勿体ないくらい殆どの場合はレイアウトが変更される。
    // が、レイアウトが変更されない場合もある
    this.recomputeLayoutItems(false);
  }

  /**
   * 行の数をセットする
   * @param rowCount 行の数
   */
  public setRowCount(rowCount: number) {
    this.#itemLayouts = createItemLayout(
      rowCount,
      this.#minHeight,
      this.#itemLayouts
    );

    this.recomputeLayoutItems(true);

    if (this.autoScroll) {
      this.#onScroll.fire(Number.MAX_SAFE_INTEGER);
      // this.#onScroll.fire(lastItem.top);
    }
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

    const firstRow = this.#listViewLayout.rowLayouts.at(0);
    assert(firstRow != null);
    if (itemIndex < firstRow.itemLayout.index) {
      this.#scrollTop += dif;
      // 先にレイアウト変更イベントを呼んで貰うため
      setTimeout(() => {
        this.#onScroll.fire(this.#scrollTop);
      }, 0);
    }

    this.recomputeLayoutItems(true);
  }

  /**
   * レイアウトを再計算する\
   * `isEaualityLayout`が`True`の時レイアウトが変更されるかチェックする\
   * 変更する必要が無ければレイアウトは変わらず`onRecomputedLayout`も呼ばれない
   * @param isEaualityLayout レイアウトが同じ可能性があるか
   */
  private recomputeLayoutItems(isEaualityLayout: boolean) {
    const rowLayouts = this.#listViewLayout.rowLayouts;
    const linenupTop = this.#scrollTop;
    const linenupBottom = linenupTop + this.#viewportHeight;

    const indexFrom = binarySearch(this.#itemLayouts, linenupTop);
    const indexTo = binarySearch(this.#itemLayouts, linenupBottom);
    const visibleRowCount = indexTo - indexFrom + 1;
    const numViews = Math.max(rowLayouts.length, visibleRowCount);

    this.autoScroll =
      this.autoScroll || this.#itemLayouts.at(-1)?.index === indexTo;

    // 最適化のため、レイアウトを更新するかチェック
    if (
      !(
        isEaualityLayout &&
        rowLayouts.length === numViews &&
        rowLayouts.at(0)?.itemLayout?.index === indexFrom &&
        this.#listViewLayout.visibleRowCount === visibleRowCount
      )
    ) {
      // レイアウトを更新する
      const rowLayouts = [];

      for (let i = indexFrom; i < indexFrom + numViews; i++) {
        if (i <= indexTo && this.#itemLayouts[i] != null) {
          rowLayouts.push({
            key: `${i % numViews}`,
            itemLayout: {
              ...this.#itemLayouts[i],
              top: this.#itemLayouts[i].top - linenupTop,
            },
          });
        } else {
          rowLayouts.push({
            key: `${i % numViews}`,
            itemLayout: { index: -1, height: 0, top: 0 },
          });
        }
      }
      this.#listViewLayout = {
        ...this.#listViewLayout,
        visibleRowCount,
        rowLayouts,
      };
    }

    this.setScrollHeight();
  }

  /**
   * スクロールエリアサイズを再計算し、更新を呼ぶ
   */
  private setScrollHeight() {
    const lastItem = this.#itemLayouts.at(-1);
    this.#listViewLayout = {
      ...this.#listViewLayout,
      scrollHeight: lastItem == null ? 0 : lastItem.top + lastItem.height,
    };
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
