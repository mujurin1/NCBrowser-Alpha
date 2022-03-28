import { Button, Slider } from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { VirtualListLayoutManager } from "./components/VirtualList/VirtualListLayoutManager";
import { DemoLivePlatform } from "./impl/__demo__/DemoLivePlatform";
import { ChatNotify } from "./impl/ChatNotify";
import { ChatStore } from "./impl/ChatStore";
import { CommentView } from "./components/CommentView";
import { ChromeStorage } from "./storage/LocalStorage";
import { NiconamaLivePlatform } from "./impl/niconama/NiconamaLivePlatform";
import { niocnamaApiInitialize } from "./impl/niconama/initialize";

import "../styles/index.css";

// ストレージ初期化後に実行する
ChromeStorage.initialize().then(async () => {
  niocnamaApiInitialize();
});

// ライブプラットフォームを初期化
const demoPlatform = new DemoLivePlatform();
const niconama = new NiconamaLivePlatform();
ChatNotify.initialize(demoPlatform, niconama);

let auto = false;
setInterval(() => {
  if (auto) {
    demoPlatform.newComments(1);
  }
}, 500);

function LivePlatformComments() {
  const [viewSize, setViewSize] = useState({ widht: 800, height: 500 });

  const layoutManager = useMemo(
    () => new VirtualListLayoutManager(20, ChatStore.comments.length),
    []
  );

  const resize = useCallback(
    (e: Event, height: number | number[]) => {
      if (typeof height === "number") {
        setViewSize((size) => ({ ...size, height }));
        layoutManager.setViewportHeight(height);
      }
    },
    [layoutManager]
  );
  const addComment = useCallback(() => {
    auto = !auto;
  }, []);
  const connectNiconama = useCallback(() => {
    niconama.connectLive(
      Number(ChromeStorage.storage.nico.idTokens?.sub),
      "lv336307088"
    );
  }, []);

  return (
    <>
      <Slider min={100} max={1000} onChange={resize} />
      <Button onClick={addComment} variant="contained">
        自動コメント追加
      </Button>
      <Button onClick={connectNiconama} variant="contained">
        ニコ生接続
      </Button>
      <CommentView
        layoutManager={layoutManager}
        width={viewSize.widht}
        height={viewSize.height}
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
