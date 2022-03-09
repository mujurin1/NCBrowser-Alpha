import React from "react";
import { useEffect, useMemo, useState } from "react";
import { FixedSizeList } from "react-window";
import { NeedChatViewTool } from "../LiveCycle/ChatMediation";
import { Chat } from "../LiveCycle/ChatTypes";

export type DemoChatViewerProps = {
  tool: NeedChatViewTool;
};

export function DemoChatViewer(props: DemoChatViewerProps) {
  const tool = useMemo(() => props.tool, [props.tool]);
  const itemData = useMemo(() => [], [props.tool]);
  const [refleshFlag, setRefleshFlag] = useState(0);

  useEffect(() => {
    itemData.push(...tool.getChatAllLiveManager());
    tool.onAddLiveManager.add((id) => {
      itemData.push(...tool.getChatSelectLiveManager(id));
    });
    tool.onChatUpdate.add((chatId) => {
      itemData.push(tool.getChatFromId(chatId));
      setRefleshFlag((oldValue) => oldValue + 1);
    });
  }, [props.tool]);

  const view = useMemo(
    () => (
      <FixedSizeList<Chat[]>
        height={600}
        width={700}
        itemCount={itemData.length}
        itemData={itemData}
        itemSize={30}
      >
        {(arg) => {
          const item = arg.data[arg.index];
          return (
            <div style={arg.style} className="comment-view-row">
              <div>{`${item.no}`}</div>&ensp;
              <div>{`${item.iconUrl}`}</div>&ensp;
              <div>{`${item.userName}`}</div>&ensp;
              <div>{`${item.time}`}</div>&ensp;
              <div>{`${item.content.text}`}</div>
            </div>
          );
        }}
      </FixedSizeList>
    ),
    [refleshFlag]
  );

  return view;
}
