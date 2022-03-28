import { Button, Slider } from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { VirtualListLayoutManager } from "./components/VirtualList/VirtualListLayoutManager";
import { DemoLivePlatform } from "./__demo__/DemoLivePlatform";
import { LivePlatformManager } from "./LivePlatform/LivePlatformManager";
import { ChatStore } from "./LivePlatform/ChatStore";
import { CommentView } from "./components/CommentView";
import { ChromeStorage } from "./storage/LocalStorage";
import { NiconamaLivePlatform } from "../niconama/NiconamaLivePlatform";
import { niocnamaApiInitialize } from "../niconama/initialize";

import "../styles/index.css";

// ストレージ初期化後に実行する
ChromeStorage.initialize().then(async () => {
  niocnamaApiInitialize();
});

const demoPlatform = new DemoLivePlatform();
const niconama = new NiconamaLivePlatform();
LivePlatformManager.initialize(demoPlatform, niconama);

let auto = false;
setInterval(() => {
  if (auto) {
    demoPlatform.newComments(10);
  }
}, 20);

function LivePlatformComments() {
  const [viewSize, setViewSize] = useState({ widht: 500, height: 500 });

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
    console.log(ChromeStorage.storage.nico.idTokens?.sub);
    niconama.connectLive(
      Number(ChromeStorage.storage.nico.idTokens?.sub),
      "lv336289320"
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
