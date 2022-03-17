import { Trigger } from "../../common/Trigger";
import { assert, defaultValueArray } from "../../utils/util";

/* ListView 表示されるビュー
 * Row      リストの行
 * Item     リストの要素。アイテム
 *
 */

/**
 * リストに表示する要素。アイテムのレイアウト
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
 * 実際に表示する並べる行のレイアウト
 */
export type RowLayout = {
  /** 行のキー */
  readonly key: string;
  /** アイテム */
  readonly itemLayout: ItemLayout;
};

/**
 * リストビュー
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

  /** リストビュー全体のレイアウト */
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
    this.#itemLayouts = createItemLayouts(itemCount, this.#minHeight);
    this.#listViewLayout = {
      scrollHeight: 0,
      visibleRowCount: 1,
      rowLayouts: [
        { key: "0", itemLayout: { index: -10, height: -10, top: -10 } },
      ],
    };

    this.recomputeListViewLayout(true, this.autoScroll);
  }

  /**
   * リストビューの高さを変更する
   * @param height 高さ
   */
  public setViewportHeight(height: number): void {
    if (height === this.#viewportHeight) return;
    const dif = height - this.#viewportHeight;
    this.#viewportHeight = height;

    this.#scrollTop -= dif;
    if (this.#scrollTop < 0) this.#scrollTop = 0;

    this.recomputeListViewLayout(false, this.autoScroll);
  }

  /**
   * 指定位置までスクロールする
   * @param top スクロール座標
   */
  public setScrollPosition(top: number): void {
    if (top === this.#scrollTop) return;

    const scrollUp = this.#scrollTop > top;

    this.#scrollTop = top;
    this.recomputeListViewLayout(false, scrollUp ? false : undefined);
  }

  /**
   * 新しい行の数をセットする
   * @param rowCount 新しい行の数
   * @param heights 行の幅.指定しないと minHeight でされる
   */
  public setRowCount(rowCount: number, heights?: number[]) {
    const plus = rowCount - this.#itemLayouts.length;
    if (plus === 0) return;
    if (plus < 0) {
      heights = [];
      this.#itemLayouts = this.#itemLayouts.splice(0, rowCount);
    } else {
      if (heights == null) heights = defaultValueArray(plus, this.#minHeight);
      this.#itemLayouts = addItemLayouts(this.#itemLayouts, heights);
    }

    if (this.autoScroll) {
      this.#scrollTop += plus * this.#minHeight;
      // if (this.#scrollTop < 0) this.#scrollTop = 0;
    }
    this.recomputeListViewLayout(true, this.autoScroll);
  }

  /**
   * 指定アイテム行の高さを変更する
   * @param array [変更するインデックス, 新しい高さ][]
   */
  public changeRowHeight(array: [number, number][]): void {
    if (array.length === 0) return;

    let scrollHeightDif = 0;
    let changeMinIndex = array[0][0];
    let changeMaxIndex = changeMinIndex;
    let recomputeFlag = false;
    // アイテムの新しい高さを設定する
    for (const [index, height] of array) {
      const layout = this.#itemLayouts[index];
      const dif = height - layout.height;
      if (dif === 0) continue;
      scrollHeightDif += dif;

      this.#itemLayouts[index] = { ...layout, height };
      if (index < changeMinIndex) changeMinIndex = index;
      else if (index > changeMaxIndex) changeMaxIndex = index;
      recomputeFlag = true;
    }
    if (!recomputeFlag) return;

    // アイテムの高さを再計算する
    this.#itemLayouts = recomputeTopItemLayout(
      this.#itemLayouts,
      changeMinIndex
    );

    // スクロール計算
    const firstRowItem = this.#listViewLayout.rowLayouts.at(0)?.itemLayout;
    const lastRowItem = this.#listViewLayout.rowLayouts.at(-1)?.itemLayout;
    assert(firstRowItem != null && lastRowItem != null);

    let layoutMayBeSame = false;
    if (changeMinIndex < firstRowItem.index) {
      this.#scrollTop += scrollHeightDif;
      layoutMayBeSame = true;
      // 先にレイアウト変更イベントを呼んで貰うため
      setTimeout(() => {
        this.#onScroll.fire(this.#scrollTop);
      }, 0);
    } else if (changeMaxIndex < lastRowItem.index) {
      this.#scrollTop += scrollHeightDif;
      // 先にレイアウト変更イベントを呼んで貰うため
      setTimeout(() => {
        this.#onScroll.fire(this.#scrollTop);
      }, 0);
    } else {
      layoutMayBeSame = true;
    }

    // リストビューレイアウト計算
    // MEMO: layoutMayBeSame が true なら絶対変わらない
    this.recomputeListViewLayout(layoutMayBeSame);

    // リストビューのレイアウトを再計算する

    // const dif = height - this.#itemLayouts[itemIndex].height;
    // if (dif === 0) return;

    // this.#itemLayouts[itemIndex] = {
    //   ...this.#itemLayouts[itemIndex],
    //   height,
    // };
    // for (let i = itemIndex + 1; i < this.#itemLayouts.length; i++) {
    //   this.#itemLayouts[i] = {
    //     ...this.#itemLayouts[i],
    //     top: this.#itemLayouts[i].top + dif,
    //   };
    // }

    // let layoutMayBeSame = false;

    // // 画面外のアイテムの高さが変わる可能性があるコード
    // // 今表示している最下行より上のエリアが変更された
    // const firstRowItem = this.#listViewLayout.rowLayouts.at(0)?.itemLayout;
    // const lastRowItem = this.#listViewLayout.rowLayouts.at(-1)?.itemLayout;
    // assert(firstRowItem != null && lastRowItem != null);
    // if (itemIndex < firstRowItem.index) {
    //   this.#scrollTop += dif;
    //   layoutMayBeSame = true;
    // } else if (itemIndex < lastRowItem.index) {
    //   this.#scrollTop += dif;
    //   // 先にレイアウト変更イベントを呼んで貰うため
    //   setTimeout(() => {
    //     this.#onScroll.fire(this.#scrollTop);
    //   }, 0);
    // } else {
    //   layoutMayBeSame = true;
    // }
    // // MEMO: layoutMayBeSame が true なら絶対変わらない
    // this.recomputeLayoutItems(layoutMayBeSame);
  }

  /**
   * レイアウトを再計算する\
   * `isCheckEaualityLayout`が`True`の時レイアウトが変更されるかチェックする\
   * 変更する必要が無ければレイアウトは変わらず`onRecomputedLayout`も呼ばれない
   * @param layoutMayBeSame レイアウトが同じ可能性がある
   * @param isAutoScroll 自動スクロールするか?.指定しなければ状況に自動スクロールするか計算する
   */
  private recomputeListViewLayout(
    layoutMayBeSame: boolean,
    isAutoScroll?: boolean
  ) {
    const oldVisibleRowCount = this.#listViewLayout.visibleRowCount;
    const oldRowLayouts = this.#listViewLayout.rowLayouts;

    if (isAutoScroll === true) {
      this.autoScroll = true;
    } else if (isAutoScroll === false) {
      this.autoScroll = false;
    } else {
      const lastItem = this.#itemLayouts.at(-1)!;
      this.autoScroll =
        lastItem.top + lastItem.height - this.#viewportHeight <=
        this.#scrollTop;
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
    const numViews = Math.max(oldRowLayouts.length, visibleRowCount);
    // 最適化のため、レイアウトを更新するかチェック
    if (
      layoutMayBeSame &&
      oldRowLayouts.length === numViews &&
      oldRowLayouts[0].itemLayout.index === firstRowIndex &&
      oldRowLayouts[oldVisibleRowCount - 1].itemLayout.index === lastRowIndex &&
      visibleRowCount <= oldVisibleRowCount
    ) {
      // レイアウトを更新しない
    } else {
      // レイアウトを更新する
      const newRowLayouts: RowLayout[] = [];

      for (let i = firstRowIndex; i < firstRowIndex + numViews; i++) {
        if (i <= lastRowIndex && this.#itemLayouts[i] != null) {
          newRowLayouts.push({
            key: `${i % numViews}`,
            itemLayout: {
              ...this.#itemLayouts[i],
              top: this.#itemLayouts[i].top - this.#scrollTop,
            },
          });
        } else {
          newRowLayouts.push({
            key: `${i % numViews}`,
            itemLayout: { index: -1, height: 0, top: 0 },
          });
        }
      }
      this.#listViewLayout = {
        ...this.#listViewLayout,
        visibleRowCount,
        rowLayouts: newRowLayouts,
      };
    }

    this.setScrollHeight();

    if (this.autoScroll) {
      this.#onScroll.fire(this.#scrollTop);
    }
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
 * アイテムのレイアウトを生成する
 * @param itemCount アイテムの数
 * @param height 高さ
 */
function createItemLayouts(itemCount: number, height: number): ItemLayout[] {
  const layouts: ItemLayout[] = [];
  let top = 0;

  for (let i = layouts.length; i < itemCount; i++) {
    layouts[i] = { index: i, height, top };
    top += height;
  }

  return layouts;
}

/**
 * アイテムのレイアウトの開始位置を再計算する
 * @param layouts 元となるレイアウト
 * @param startIndex 計算を開始するインデックス。default 0
 */
function recomputeTopItemLayout(
  layouts: ItemLayout[],
  startIndex = 0
): ItemLayout[] {
  let top =
    startIndex === 0
      ? 0
      : layouts[startIndex - 1].top + layouts[startIndex - 1].height;
  for (let i = startIndex; i < layouts.length; i++) {
    layouts[i] = { ...layouts[i], top };
    top += layouts[i].height;
  }
  return layouts;
}

/**
 * 渡されたアイテムのレイアウトに新しい行を追加して再計算する
 * @param layouts 元となるレイアウト
 * @param heights 追加する行の高さの配列
 */
function addItemLayouts(
  layouts: ItemLayout[],
  heights: number[]
): ItemLayout[] {
  if (heights.length === 0) return layouts;

  let top = 0;
  const lastItem = layouts.at(-1);
  if (lastItem != null) top = lastItem.top + lastItem.height;
  const bottom = layouts.length;
  for (let i = 0; i < heights.length; i++) {
    layouts.push({ index: bottom + i, height: heights[i], top });
    top += heights[i];
  }

  return layouts;
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
