import React, {
  useState,
  useLayoutEffect,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { Fn } from "../../common/util";
import {
  RowLayout,
  VirtualListLayoutManager,
} from "./VirtualListLayoutManager";

import "./style.css";

export interface RowRenderProps {
  /** 表示する行のレイアウト */
  rowLayout: RowLayout;
}

export interface VirtualListViewProps {
  layoutManager: VirtualListLayoutManager;
  width: number;
  height: number;
  rowRender: Fn<[RowRenderProps], JSX.Element>;
}

export function VirtualListView(props: VirtualListViewProps) {
  const layoutManager = props.layoutManager;

  const [layout, setLayout] = useState(layoutManager.listViewLayout);

  // レイアウトの初期化
  useEffect(() => {
    layoutManager.setViewportHeight(props.height);
  }, [layoutManager, props.height]);

  // レイアウトの更新
  useLayoutEffect(() => {
    const handler = () => setLayout(layoutManager.listViewLayout);
    layoutManager.onRecomputedLayout.add(handler);
    return () => {
      layoutManager.onRecomputedLayout.delete(handler);
    };
  }, [layoutManager]);

  const viewportRef = useRef<HTMLDivElement | null>(null);

  // レイアウトからのスクロール位置更新
  useEffect(() => {
    const handler = (top: number) => {
      const viewport = viewportRef.current;
      if (viewport === null) return;
      viewport.scrollTop = top;
    };

    layoutManager.onScroll.add(handler);
    return () => layoutManager.onScroll.delete(handler);
  }, [viewportRef]);

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
      const viewport = viewportRef.current;
      if (viewport === null || viewport.scrollTop === layoutManager.scrollTop)
        return;
      layoutManager.setScrollPosition(viewport.scrollTop);
    },
    [layoutManager, viewportRef]
  );

  return (
    <div
      ref={viewportRef}
      className="list-view"
      onScroll={onScroll}
      style={{
        width: props.width,
        height: props.height,
      }}
    >
      <div
        className="list-view-scroll"
        style={{ height: layout.scrollHeight }}
      />
      <Lineup
        layoutManager={layoutManager}
        rowLayouts={layout.rowLayouts}
        rowRender={props.rowRender}
      />
    </div>
  );
}

interface LineupProps {
  layoutManager: VirtualListLayoutManager;
  rowLayouts: RowLayout[];
  rowRender: Fn<[RowRenderProps], JSX.Element>;
}

function _Lineup(props: LineupProps) {
  const layoutManager = props.layoutManager;
  const linenupRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const lineup = linenupRef.current;
    if (lineup === null || layoutManager.listViewLayout.visibleRowCount === 0)
      return;

    const newValues: [number, number][] = [];
    for (let i = 0; i < layoutManager.listViewLayout.visibleRowCount; i++) {
      const child = lineup.children[i];
      newValues.push([
        layoutManager.listViewLayout.rowLayouts[0].itemLayout.index + i,
        child.clientHeight,
      ]);
    }
    layoutManager.changeRowHeight(newValues);
  }, [linenupRef, props.rowLayouts]);

  return (
    <div ref={linenupRef} className="list-view-lineup">
      {props.rowLayouts.map((rowLayout) => {
        if (rowLayout.itemLayout.index === -1)
          return <div key={rowLayout.key} style={{ visibility: "hidden" }} />;
        else return props.rowRender({ rowLayout });
      })}
    </div>
  );
}
const Lineup = React.memo(_Lineup) as typeof _Lineup;

// export function Linenup<TItem>({ layout, items }: LinenupProps<TItem>) {
//   return (
//     <>
//       {layout.rows.map(
//         ({ key, itemLayout: { height, index: itemIndex, top } }) => {
//           if (itemIndex === -1) {
//             return (
//               <div
//                 key={key}
//                 // className="list-view-row-hidden"
//                 // style={{
//                 //   background: itemIndex % 2 === 1 ? "#f0f0f0" : "#ffffff",
//                 //   top,
//                 //   height,
//                 // }}
//               />
//             );
//           } else {
//             return (
//               <div
//                 key={key}
//                 className="list-view-row"
//                 style={{
//                   top,
//                   height,
//                   background: itemIndex % 2 === 1 ? "#f0f0f0" : "#ffffff",
//                 }}
//               >
//                 {items[itemIndex]}, DOM-{key}
//               </div>
//             );
//           }
//         }
//       )}
//     </>
//   );
// }
