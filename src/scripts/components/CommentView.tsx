import React, { useEffect, useMemo, useState } from "react";
import { ListChildComponentProps, VariableSizeList } from "react-window";
import { ChatStore } from "../LivePlatform/ChatStore";
import { UpdateVariation } from "../LivePlatform/LivePlatform";
import { LivePlatformManager } from "../LivePlatform/LivePlatformManager";
import { NcbComment } from "../LivePlatform/NcbComment";
import { NcbUser } from "../LivePlatform/NcbUser";
import { assert } from "../utils/util";

// export type CommentViewProps = {
//   livePlatformManager: LivePlatformManager;
//   // width: number;
//   // height: number;
//   // ref?: React.LegacyRef<VariableSizeList<CommentViewItem[]>>;
//   // className?: string;
// };

// export function CommentView(props: CommentViewProps) {}

export type CommentViewProps = {
  width: number;
  height: number;
  // ref?: React.LegacyRef<VariableSizeList>;
  className?: string;
};

// export type CommentViewItem = {
//   commentGlobalId: string;
//   userGlobalId: string;
//   no?: number;
//   iconUrl?: string;
//   userName: string;
//   time: number;
//   comment: string;
// };

export function CommentView(props: CommentViewProps) {
  const [updateFlag, setUpdateFlag] = useState({ comment: 0, user: 0 });

  useEffect(() => {
    const updateComments = (
      valiation: UpdateVariation,
      ...comments: NcbComment[]
    ) => {
      setUpdateFlag((oldValue) => ({
        ...oldValue,
        comment: oldValue.comment + 1,
      }));
    };
    const updateUsers = (valiation: UpdateVariation, ...users: NcbUser[]) => {
      setUpdateFlag((oldValue) => ({
        ...oldValue,
        user: oldValue.user + 1,
      }));
    };
    LivePlatformManager.allChangeComments.add(updateComments);
    LivePlatformManager.allChangeUsers.add(updateUsers);
    return () => {
      LivePlatformManager.allChangeComments.delete(updateComments);
      LivePlatformManager.allChangeUsers.delete(updateUsers);
    };
  }, []);

  // console.log(ChatStore.comments.length);
  // <>
  //   updateComment: {updateFlag.comment}
  //   <br />
  //   updateUser: {updateFlag.user}
  //   <br />
  // </>
  return (
    <VariableSizeList
      {...props}
      width={props.width}
      height={props.height}
      itemCount={ChatStore.comments.length}
      itemSize={useMemo(() => () => 30, [])}
    >
      {CommentViewRow}
    </VariableSizeList>
  );
}

const rowCache: Record<string, JSX.Element> = {};

function CommentViewRow(
  props: React.PropsWithChildren<ListChildComponentProps>
) {
  const comment = ChatStore.comments.at(props.index);
  assert(comment != null);

  let row = rowCache[comment.globalId];
  if (row != null) return row;

  const user = ChatStore.users.get(comment.userGlobalId);
  assert(user != null);
  const cContent = comment.content;
  const uState = user.state;

  const no = <div>{cContent.no ?? props.index}</div>;
  const icon = iconUrlToElement(uState.iconUrl);
  const name = <div>{uState.name}</div>;
  const time = timeToElement(cContent.time);
  const content = <div>{cContent.text}</div>;

  const element = (
    <div
      className="comment-view-row"
      style={{ ...props.style }}
      key={comment.globalId}
    >
      {no}
      {/* {icon} */}
      {name}
      {<div style={{ backgroundColor: "gray", width: 2, height: 20 }}></div>}
      {time}
      {<div style={{ backgroundColor: "gray", width: 2, height: 20 }}></div>}
      {content}
    </div>
  );
  rowCache[comment.globalId] = element;

  return element;
}

const defaultIconUrl =
  "https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/defaults/blank.jpg";

function iconUrlToElement(iconUrl?: string): JSX.Element {
  if (iconUrl == null) return <img src={defaultIconUrl}></img>;
  return <img src={iconUrl} style={{ height: 20, width: 20 }}></img>;
}

function timeToElement(time: number): JSX.Element {
  const date = new Date(time);
  return (
    <div>{`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`}</div>
  );
  // const h = Math.floor(time / 3600);
  // const m = `${Math.floor((time % 3600) / 60)}`.padStart(2, "0");
  // const s = `${time % 60}`.padStart(2, "0");
  // return <div>{`${h}:${m}:${s}`}</div>;
}
