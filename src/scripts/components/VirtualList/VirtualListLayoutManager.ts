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
  /** リストビュー全体のレイアウト */
  #listViewLayout: ListViewLayout;

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
    this.#listViewLayout = {
      scrollHeight: 0,
      visibleRowCount: 0,
      rowLayouts: [],
    };

    this.recomputeLayoutItems(true, this.autoScroll);
  }

  /**
   * リストビューのサイズを変更する
   * @param width 幅
   * @param height 高さ
   */
  public setViewportSize(width: number, height: number): void {
    if (width === this.#viewportWidht && height === this.#viewportHeight)
      return;
    const dif = height - this.#viewportHeight;
    this.#viewportWidht = width;
    this.#viewportHeight = height;

    this.#scrollTop -= dif;
    if (this.#scrollTop < 0) this.#scrollTop = 0;

    this.recomputeLayoutItems(false, this.autoScroll);
  }

  /**
   * 指定位置までスクロールする
   * @param top スクロール座標
   */
  public setScrollPosition(top: number): void {
    if (top === this.#scrollTop) return;

    const scrollUp = this.#scrollTop > top;

    this.#scrollTop = top;
    this.recomputeLayoutItems(false, scrollUp ? false : undefined);
  }

  /**
   * 行の高さの最小値をセットする
   * @param minHeight 最小の高さ
   */
  public setMinRowHeight(minHeight: number) {
    if (minHeight === this.#minHeight) return;
    this.#minHeight = minHeight;
    // レイアウトが変更されない場合もあるが、
    // ほんとに再計算する必要があるか計算するのが勿体ないくらい殆どの場合はレイアウトが変更される
    this.recomputeLayoutItems(false);
  }

  /**
   * 行の数をセットする\
   * 減らすことはできない
   * @param rowCount 行の数
   */
  public setRowCount(rowCount: number) {
    const plus = rowCount - this.#itemLayouts.length;
    this.#itemLayouts = createItemLayout(
      rowCount,
      this.#minHeight,
      this.#itemLayouts
    );

    if (this.autoScroll) {
      this.#scrollTop += plus * this.#minHeight;
    }
    this.recomputeLayoutItems(true, this.autoScroll);
  }

  /**
   * 指定アイテム行の高さを変更する\
   * 画面外のアイテムの高さが変わる可能性は無いとする
   * @param itemIndex セットするアイテムのインデックス
   * @param height 高さ
   */
  public changeRowHeight(itemIndex: number, height: number): void {
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

    let layoutMayBeSame = false;

    // 画面外のアイテムの高さが変わる可能性があるコード
    // 今表示している最下行より上のエリアが変更された
    const firstRowItem = this.#listViewLayout.rowLayouts.at(0)?.itemLayout;
    const lastRowItem = this.#listViewLayout.rowLayouts.at(-1)?.itemLayout;
    assert(firstRowItem != null && lastRowItem != null);
    if (itemIndex < firstRowItem.index) {
      this.#scrollTop += dif;
      layoutMayBeSame = true;
    } else if (itemIndex < lastRowItem.index) {
      this.#scrollTop += dif;
      // 先にレイアウト変更イベントを呼んで貰うため
      setTimeout(() => {
        this.#onScroll.fire(this.#scrollTop);
      }, 0);
    } else {
      layoutMayBeSame = true;
    }
    // MEMO: layoutMayBeSame が true なら絶対変わらない
    this.recomputeLayoutItems(layoutMayBeSame);
  }

  /**
   * レイアウトを再計算する\
   * `isCheckEaualityLayout`が`True`の時レイアウトが変更されるかチェックする\
   * 変更する必要が無ければレイアウトは変わらず`onRecomputedLayout`も呼ばれない
   * @param layoutMayBeSame レイアウトが同じ可能性がある | 絶対同じ
   * @param isAutoScroll 自動スクロールするか.指定しなければ状況により変わる
   */
  private recomputeLayoutItems(
    layoutMayBeSame: boolean,
    isAutoScroll?: boolean
  ) {
    const rowLayouts = this.#listViewLayout.rowLayouts;
    /* AutoScroll と (first/last)RowIndex メモ
     * isAutoScroll === true
     *   一番下の行は #itemLayouts の最後の要素
     * isAutoScroll === false
     *   #scrollTop から計算
     * isAutoScroll === undefined
     *   autoScroll は
     *   「#listViewLayout.rowLayouts の最後の行のインデックスが
     *     #itemLayout の最後のアイテムのインデックスと同じ」
     *   かで調べている
     */
    if (isAutoScroll === true) {
      this.autoScroll = true;
    } else if (isAutoScroll === false) {
      this.autoScroll = false;
    } else {
      // isAutoScroll は undefined
      // （この時、アイテムが０個の時はありえないない前提）
      const lastVisibleRowIndex = this.#listViewLayout.visibleRowCount - 1;
      const lastRow = rowLayouts[lastVisibleRowIndex].itemLayout;
      const lastItem = this.#itemLayouts.at(-1)!;
      this.autoScroll = lastRow.index === lastItem.index;
    }

    let firstRowIndex;
    let lastRowIndex;
    if (this.autoScroll) {
      const lastItem = this.#itemLayouts.at(-1);
      if (lastItem == null) {
        firstRowIndex = 0;
        lastRowIndex = 0;
      } else {
        // 一番下の行のインデックスは一番下のアイテムのインデックス
        lastRowIndex = lastItem.index;
        // #scrollTop を計算する
        this.#scrollTop = lastItem.top + lastItem.height - this.#viewportHeight;
        if (this.#scrollTop < 0) this.#scrollTop = 0;
        // 一番上の行のインデックスを計算する
        firstRowIndex = binarySearch(this.#itemLayouts, this.#scrollTop);
      }
    } else {
      firstRowIndex = binarySearch(this.#itemLayouts, this.#scrollTop);
      const linenupBottom = this.#scrollTop + this.#viewportHeight;
      lastRowIndex = binarySearch(this.#itemLayouts, linenupBottom);
    }

    const visibleRowCount = lastRowIndex - firstRowIndex + 1;
    const numViews = Math.max(rowLayouts.length, visibleRowCount);

    // 最適化のため、レイアウトを更新するかチェック
    if (
      !(
        layoutMayBeSame &&
        rowLayouts.length === numViews &&
        rowLayouts.at(0)?.itemLayout?.index === firstRowIndex &&
        visibleRowCount <= this.#listViewLayout.visibleRowCount
      )
    ) {
      // レイアウトを更新する
      const rowLayouts = [];

      for (let i = firstRowIndex; i < firstRowIndex + numViews; i++) {
        if (i <= lastRowIndex && this.#itemLayouts[i] != null) {
          rowLayouts.push({
            key: `${i % numViews}`,
            itemLayout: {
              ...this.#itemLayouts[i],
              top: this.#itemLayouts[i].top - this.#scrollTop,
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
    if (this.autoScroll) this.#onScroll.fire(this.#scrollTop);
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
