import { Button, Slider } from "@mui/material";
import { height } from "@mui/system";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { ChatStore } from "../impl/ChatStore";
import { UpdateVariation } from "../model/LivePlatform";
import { ChatNotify } from "../impl/ChatNotify";
import { NcbComment } from "../model/NcbComment";
import { RowRenderProps, VirtualListView } from "./VirtualList/VirtualList";
import { VirtualListLayoutManager } from "./VirtualList/VirtualListLayoutManager";

export interface CommentViewProps {
  height: number;
  width: number;
  layoutManager: VirtualListLayoutManager;
}

export function CommentView(props: CommentViewProps) {
  const layoutManager = props.layoutManager;
  layoutManager.setViewportHeight(props.height);

  useEffect(() => {
    const handler = (
      variation: UpdateVariation,
      ...updateComments: NcbComment[]
    ) => {
      if (variation === "Add") {
        layoutManager.setRowCount(ChatStore.comments.length);
      } else if (variation === "Delete" || variation === "Update") {
        throw new Error(
          "VirturalListView コメントの更新：コメントの「削除・更新」は未実装です"
        );
      }
    };
    ChatNotify.allChangeComments.add(handler);
    return () => ChatNotify.allChangeComments.delete(handler);
  }, [ChatStore.comments, layoutManager]);

  return (
    <VirtualListView
      layoutManager={layoutManager}
      width={props.width}
      height={props.height}
      rowRender={Row}
    />
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
  const state = user.status;
  return (
    <div key={key} className="list-view-row" style={style}>
      {/* {`key-${key},i-${index},${ChatStore.comments.at(index)?.content?.text}`} */}
      {/* <div className="list-view-row-no">{content.no ?? "--"}</div> */}
      <div className="list-view-row-no">{`inde:${index}-key:${key}`}</div>
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
