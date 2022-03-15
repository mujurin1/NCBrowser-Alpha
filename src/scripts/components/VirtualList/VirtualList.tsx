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

export interface VirtualListViewProps {
  layoutManager: VirtualListLayoutManager;
  width: number;
  height: number;
  children: Fn<[RowLayout], JSX.Element>;
}

export function VirtualListView(props: VirtualListViewProps) {
  const layoutManager = props.layoutManager;

  const [layout, setLayout] = useState(layoutManager.getLayout());

  // レイアウトの更新
  useLayoutEffect(() => {
    const handler = () => setLayout(layoutManager.getLayout());
    layoutManager.onRecomputedLayout.add(handler);
    return () => {
      layoutManager.onRecomputedLayout.delete(handler);
    };
  }, [layoutManager]);

  const viewportRef = useRef<HTMLDivElement | null>(null);

  // レイアウトからのスクロール位置更新
  useEffect(() => {
    const handler = (scrollDif: number) =>
      viewportRef.current?.scrollTo({ top: scrollDif });

    layoutManager.onScroll.add(handler);
    return () => layoutManager.onScroll.delete(handler);
  }, [viewportRef]);

  // レイアウトサイズのセット
  const notifyViewPortSize = useCallback(() => {
    const viewport = viewportRef.current;
    if (viewport === null) return;
    layoutManager.setViewportSize(viewport.clientWidth, viewport.clientHeight);
  }, [layoutManager]);

  useLayoutEffect(notifyViewPortSize, [notifyViewPortSize]);

  const onScroll = useCallback(() => {
    const viewport = viewportRef.current;
    if (viewport === null) return;
    layoutManager.setScrollPosition(viewport.scrollTop);
  }, [layoutManager]);

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
      <div className="list-view-scroll" style={{ height: layout.height }} />
      <div className="list-view-lineup">
        {/* <Linenup layout={layout} items={props.items} /> */}
        {/* {props.children({ layout, items: props.items })} */}
        {layout.rows.map((row) => {
          if (row.itemLayout.index === -1)
            return <div key={row.key} style={{ visibility: "hidden" }} />;
          else return props.children(row);
        })}
      </div>
    </div>
  );
}

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
