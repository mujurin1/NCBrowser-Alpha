import React, {
  useState,
  useLayoutEffect,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { Fn } from "../../types";
import {
  RowLayout,
  VirtualListLayoutManager,
} from "./VirtualListLayoutManager";

import "./style.css";

export type VirtualListViewProps = {
  layoutManager: VirtualListLayoutManager;
  width: number;
  height: number;
  rowRender: Fn<[RowLayout], JSX.Element>;
};

export function VirtualListView(props: VirtualListViewProps) {
  const layoutManager = props.layoutManager;

  const [layout, setLayout] = useState(layoutManager.listViewLayout);
  const [scrollFromProgram, setScrollFromProgram] = useState(false);

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
    const handler = (scrollDif: number) => {
      if (viewportRef.current == null) return;
      viewportRef.current.scrollTop = scrollDif;
      setScrollFromProgram(true);
    };

    layoutManager.onScroll.add(handler);
    return () => layoutManager.onScroll.delete(handler);
  }, [viewportRef]);

  // レイアウトサイズのセット
  const notifyViewPortSize = useCallback(() => {
    const viewport = viewportRef.current;
    if (viewport === null) return;
    layoutManager.setViewportHeight(viewport.clientHeight);
  }, [layoutManager]);

  useLayoutEffect(notifyViewPortSize, [notifyViewPortSize]);

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
      if (!scrollFromProgram) {
        const viewport = viewportRef.current;
        if (viewport === null) return;
        layoutManager.setScrollPosition(viewport.scrollTop);
      } else setScrollFromProgram(false);
    },
    [layoutManager, scrollFromProgram]
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
      <div className="list-view-lineup">
        <Lineup rowLayouts={layout.rowLayouts} rowRender={props.rowRender} />
      </div>
    </div>
  );
}

type LineupProps = {
  rowLayouts: RowLayout[];
  rowRender: Fn<[RowLayout], JSX.Element>;
};

function _Lineup(props: LineupProps) {
  return (
    <>
      {props.rowLayouts.map((row) => {
        if (row.itemLayout.index === -1)
          return <div key={row.key} style={{ visibility: "hidden" }} />;
        else return props.rowRender(row);
      })}
    </>
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
