import { Button, Input, Slider } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import {
  ItemLayout,
  VirtualListLayoutManager,
} from "./components/VirtualList/VirtualListLayoutManager";
import { Fn } from "./types";
import {
  RowRenderProps,
  VirtualListView,
} from "./components/VirtualList/VirtualList";
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
    demoPlatform.newComments(10);
  }
}, 10);

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
      if (variation === "Add") {
        layoutManager.setRowCount(ChatStore.comments.length);
      } else if (variation === "Delete" || variation === "Update") {
        throw new Error(
          "View  コメントの更新：コメントの「削除・更新」は未実装です"
        );
      }
    };
    LivePlatformManager.allChangeComments.add(handler);
    return () => LivePlatformManager.allChangeComments.delete(handler);
  }, [ChatStore.comments]);

  const resize = useCallback(
    (e: Event, height: number | number[]) => {
      if (typeof height === "number") {
        layoutManager.setViewportHeight(height);
        setViewHeight(height);
      }
    },
    [layoutManager]
  );
  const addComment = useCallback(() => {
    auto = !auto;
  }, []);

  return (
    <>
      <Slider min={100} max={1000} onChange={resize} />
      <Button onClick={addComment} variant="contained">
        自動コメント追加
      </Button>
      <VirtualListView
        layoutManager={layoutManager}
        width={600}
        height={viewHeight}
        rowRender={Row}
      />
    </>
  );
}

function Row({
  rowLayout: {
    key,
    itemLayout: { height, index, top },
  },
}: RowRenderProps) {
  return (
    <div key={key} className="list-view-row" style={{ top, minHeight: height }}>
      {`key-${key},i-${index},${ChatStore.comments.at(index)?.content?.text}`}
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <LivePlatformComments />
  </React.StrictMode>,
  document.getElementById("root")
);
