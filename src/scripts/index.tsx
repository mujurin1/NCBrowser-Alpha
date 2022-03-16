import { Button, Input } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import {
  ItemLayout,
  VirtualListLayoutManager,
} from "./components/VirtualList/VirtualListLayoutManager";
import { Fn } from "./types";
import { VirtualListView } from "./components/VirtualList/VirtualList";
import { DemoLivePlatform } from "./__demo__/DemoLivePlatform";
import { LivePlatformManager } from "./LivePlatform/LivePlatformManager";
import { ChatStore } from "./LivePlatform/ChatStore";
import { NcbComment } from "./LivePlatform/NcbComment";
import { UpdateVariation } from "./LivePlatform/LivePlatform";

import "../styles/index.css";

const demoPlatform = new DemoLivePlatform();
LivePlatformManager.initialize(demoPlatform);

let auto = false;
setInterval(() => {
  if (auto) {
    demoPlatform.newComment();
  }
}, 20);

function LivePlatformComments() {
  const [viewHeight, setViewHeight] = useState(500);

  const layoutManager = useMemo(
    () => new VirtualListLayoutManager(20, ChatStore.comments.length),
    []
  );

  useEffect(() => {
    const handler = (
      variation: UpdateVariation,
      ...updateComments: NcbComment[]
    ) => {
      layoutManager.setRowCount(ChatStore.comments.length);
    };
    LivePlatformManager.allChangeComments.add(handler);
    return () => LivePlatformManager.allChangeComments.delete(handler);
  }, [ChatStore.comments]);

  const onChangeColumn = useCallback(
    (index: number) => {
      layoutManager.setRowHeight(index, 100);
    },
    [layoutManager]
  );
  const resize = useCallback(
    (height: number) => {
      layoutManager.setViewportSize(600, height);
      setViewHeight(height);
    },
    [layoutManager]
  );
  const addComment = useCallback(() => {
    auto = !auto;
  }, []);

  return (
    <>
      <ChangeComponent onChange={(num) => onChangeColumn(num)} />
      <ChangeComponent onChange={(num) => resize(num)} />
      <ChangeComponent onChange={(_) => addComment()} />
      <VirtualListView
        layoutManager={layoutManager}
        width={600}
        height={viewHeight}
        rowRender={Row}
      />
    </>
  );
}

type RowProps = {
  key: string;
  itemLayout: ItemLayout;
};

function Row({ key, itemLayout: { height, index, top } }: RowProps) {
  return (
    <div key={key} className="list-view-row" style={{ top, height }}>
      {`key-${key},i-${index},${ChatStore.comments.at(index)?.content?.text}`}
    </div>
  );
}

// function _TestComponent() {
//   const [viewHeight, setViewHeight] = useState(500);

//   const items = useMemo(() => {
//     const items: string[] = [];
//     for (let i = 0; i < 0; i++) {
//       items.push(`Item-${i}`);
//     }
//     return items;
//   }, []);

//   const layoutManager = useMemo(
//     () => new VirtualListLayoutManager(20, items.length),
//     []
//   );

//   const onChangeColumn = useCallback(
//     (index: number) => {
//       layoutManager.setRowHeight(index, 100);
//     },
//     [layoutManager]
//   );
//   const resize = useCallback(
//     (height: number) => {
//       layoutManager.setViewportSize(600, height);
//       setViewHeight(height);
//     },
//     [layoutManager]
//   );

//   return (
//     <>
//       <ChangeComponent onChange={(num) => onChangeColumn(num)} />
//       <ChangeComponent onChange={(num) => resize(num)} />
//       <VirtualListView
//         layoutManager={layoutManager}
//         width={600}
//         height={viewHeight}
//       >
//         {({ key, itemLayout: { height, index: itemIndex, top } }) => {
//           return (
//             <div
//               key={key}
//               className="list-view-row"
//               style={{
//                 top,
//                 height,
//                 background: itemIndex % 2 === 1 ? "#f0f0f0" : "#ffffff",
//               }}
//             >
//               {items[itemIndex]}, DOM-{key}
//             </div>
//           );
//         }}
//       </VirtualListView>
//     </>
//   );
// }

function ChangeComponent(props: { onChange: Fn<[number]> }) {
  const [text, setText] = useState("");

  const onClick = useCallback(() => {
    const num = parseInt(text);
    if (isNaN(num)) return;

    props.onChange(num);
  }, [text]);

  return (
    <>
      <Button onClick={() => onClick()} variant="contained">
        変更
      </Button>
      &emsp;
      <Input
        onChange={(e) => {
          setText(e.currentTarget.value);
        }}
      />
    </>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <LivePlatformComments />
  </React.StrictMode>,
  document.getElementById("root")
);

/*


*/

// type row = {
//   index: number;
//   div: HTMLDivElement;
// };

// const rowHeight = 20;
// const styleHeight = `${rowHeight}px`;
// const rowLength = 46;

// const [scrollParent, scrollChild] = scrollElemnt();
// const table = document.createElement("div");
// table.className = "table-view";
// scrollParent.appendChild(table);

// const rows = createRows();
// rows.forEach(({ div, index }) => {
//   table.appendChild(div);
// });
// scrollParent.appendChild(scrollChild);

// function createRows(): row[] {
//   const ary = new Array<row>(rowLength);
//   for (let i = 0; i < rowLength; i++) {
//     const div = document.createElement("div");
//     div.className = "table-row";
//     div.style.top = `${i * rowHeight}px`;
//     div.innerText = `row-${i}`;
//     ary[i] = { index: i, div };
//   }

//   return ary;
// }
// (function () {
//   const root = document.getElementById("root");
//   assert(root != null);

//   // const empty = document.createElement("div");
//   // empty.style.height = "150px";
//   // root.appendChild(empty);

//   root.appendChild(scrollParent);
//   root.appendChild(table);

//   scrollParent.addEventListener("scroll", (ev) => {
//     const target = ev.target as HTMLDivElement;
//     const topRowIndex = Math.floor(target.scrollTop / rowHeight);
//     const topDivIndex = topRowIndex % rowLength;
//     const topMinusPx = target.scrollTop % rowHeight;

//     let selectIndex = topDivIndex;
//     for (let i = 0; i < rowLength; i++) {
//       rows[selectIndex].div.style.top = `${i * rowHeight - topMinusPx}px`;
//       rows[selectIndex].div.innerText = `row-${topRowIndex + i}`;

//       selectIndex += 1;
//       selectIndex %= rowLength;
//     }
//   });
// })();

// function scrollElemnt() {
//   const parent = document.createElement("div");
//   parent.className = "scroll-parent";
//   parent.style.height = "800px";

//   const child = document.createElement("div");
//   child.style.height = "200000px";

//   parent.appendChild(child);
//   return [parent, child];
// }

/*



*/

// let auto = false;

// function MainConponent() {
//   const demoLivePlatform = useMemo(() => new DemoLivePlatform(), []);
//   useEffect(() => {
//     LivePlatformManager.initialize(demoLivePlatform);
//   }, []);

//   useEffect(() => {
//     setInterval(() => {
//       if (auto) demoLivePlatform.newComment();
//     }, 5);
//   }, [demoLivePlatform, auto]);

//   return (
//     <div>
//       <div>
//         <Button
//           variant="contained"
//           onClick={() => demoLivePlatform.newComment()}
//         >
//           追加
//         </Button>
//         <Button variant="contained" onClick={() => (auto = !auto)}>
//           A
//         </Button>
//       </div>
//       <CommentView className="" width={600} height={700} />
//     </div>
//   );
// }

// ReactDOM.render(
//   <React.StrictMode>
//     <MainConponent />
//   </React.StrictMode>,
//   document.getElementById("root")
// );
