import { Button, Slider } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { VirtualListLayoutManager } from "./components/VirtualList/VirtualListLayoutManager";
import {
  RowRenderProps,
  VirtualListView,
} from "./components/VirtualList/VirtualList";
import { DemoLivePlatform } from "./__demo__/DemoLivePlatform";
import { LivePlatformManager } from "./LivePlatform/LivePlatformManager";
import { ChatStore } from "./LivePlatform/ChatStore";
import { NcbComment } from "./LivePlatform/NcbComment";
import { UpdateVariation } from "./LivePlatform/LivePlatform";
import { ChromeStorage } from "./api/storage/LocalStorage";
import { checkTokenRefresh } from "./api/nico/oauth";
import { nicoApiGetLiveWsUrl } from "./api/nico/oauthApi";
import {
  NiconamaCommentWs,
  setNicoApiUseToken,
  NiconamaGetUnamaProgramsRooms,
  NiconamaChat,
} from "@ncb/niconama-api";

import "../styles/index.css";

// ストレージ初期化後に実行する
ChromeStorage.initialize().then(async () => {
  // ================= OAuth APIテスト =================
  // ニコニコAPIトークンチェック
  await checkTokenRefresh();

  // API トークン取得関数セット
  setNicoApiUseToken(() => ChromeStorage.storage.nico.oauth!.access_token);

  // 延長
  // await NiconamaPutUnamaProgramsExtension({
  //   query: { userId: 31103661, nicoliveProgramId: "lv336277529" },
  //   body: { minutes: 30 },
  // }).then((res) => {
  //   console.log(res.meta);
  //   console.log(res.data);
  // });

  // コメント取得
  const receiveChat = (chat: NiconamaChat) => {
    console.log("chat");
    console.log(chat);
  };
  const ws = await NiconamaGetUnamaProgramsRooms({
    query: {
      userId: 31103661,
      nicoliveProgramId: "lv336277529",
    },
  }).then((res) => {
    console.log(res.meta);
    console.log(res.data);
    const arena = res.data![0];
    return new NiconamaCommentWs(arena, receiveChat);
  });
  ws.opendCall(() => ws.connectLive(10));
});

const demoPlatform = new DemoLivePlatform();
LivePlatformManager.initialize(demoPlatform);

let auto = false;
setInterval(() => {
  if (auto) {
    demoPlatform.newComments(10);
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
        setViewHeight(height);
        layoutManager.setViewportHeight(height);
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
    itemLayout: { index, style },
  },
}: RowRenderProps) {
  const comment = ChatStore.comments.at(index)!;
  const content = comment.content;
  const user = ChatStore.users.get(comment.userGlobalId)!;
  const state = user.state;
  return (
    <div key={key} className="list-view-row" style={style}>
      {/* {`key-${key},i-${index},${ChatStore.comments.at(index)?.content?.text}`} */}
      {/* <div className="list-view-row-no">{content.no ?? "--"}</div> */}
      <div className="list-view-row-no">{`key-${key}`}</div>
      {RowIcon(state.iconUrl)}
      <div className="list-view-row-name">{state.name}</div>
      {RowTime(content.time)}
      {/* <div className="list-view-row-time">{content.time}</div> */}
      <div className="list-view-row-comment">{content.text}</div>
    </div>
  );
}

function RowIcon(imgSrc?: string) {
  if (imgSrc == null) return <div className="list-view-row-icon" />;
  else return <img className="list-view-row-icon" src={imgSrc} />;
}
function RowTime(time: number) {
  const date = new Date(time);
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  return <div className="list-view-row-time">{`${h}:${m}:${s}`}</div>;
}

ReactDOM.render(
  <React.StrictMode>
    <LivePlatformComments />
  </React.StrictMode>,
  document.getElementById("root")
);
