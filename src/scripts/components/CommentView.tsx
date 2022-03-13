import React, { useEffect, useMemo, useState } from "react";
import { ListChildComponentProps, VariableSizeList } from "react-window";
import { UpdateVariation } from "../LivePlatform/LivePlatform";
import { LivePlatformManager } from "../LivePlatform/LivePlatformManager";
import { NcbComment } from "../LivePlatform/NcbComment";
import { NcbUser } from "../LivePlatform/NcbUser";

export type CommentViewProps = {
  livePlatformManager: LivePlatformManager;
  // width: number;
  // height: number;
  // ref?: React.LegacyRef<VariableSizeList<CommentViewItem[]>>;
  // className?: string;
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

const commentItems: Record<string, NcbComment> = {};
const userItems: Record<string, NcbUser> = {};

const addComments = (...comments: NcbComment[]) => {
  comments.forEach((comment) => {
    commentItems[comment.globalId] = comment;
  });

  // setComments((oldValue) => [...oldValue, ...comments]);
};
const addUsers = (...users: NcbUser[]) => {
  users.forEach((user) => (userItems[user.globalId] = user));
  // const updateUsers: Record<string, NcbUser> = {};
  // users.forEach((user) => (updateUsers[user.globalId] = user));
  // setUsers((oldValue) => ({ ...oldValue, ...updateUsers }));
};

export function CommentView(props: CommentViewProps) {
  // const itemData: CommentViewItem[] = useMemo(() => [], []);
  // const [commentItems, setComments] = useState<NcbComment[]>([]);
  // const [userItems, setUsers] = useState<Record<string, NcbUser>>({});
  // const [itemData, setItemData] = useState<CommentViewItem[]>([]);
  const [updateFlag, setUpdateFlag] = useState({
    updateComment: 0,
    updateUser: 0,
  });

  useEffect(() => {
    const updateComments = (
      valiation: UpdateVariation,
      ...comments: NcbComment[]
    ) => {
      setUpdateFlag((oldValue) => {
        return {
          ...oldValue,
          updateComment: (oldValue.updateComment += 1),
        };
      });
      if (valiation === "Add") {
        addComments(...comments);
      } else if (valiation === "Update") {
      } else if (valiation === "Delete") {
      }
    };
    const updateUsers = (valiation: UpdateVariation, ...users: NcbUser[]) => {
      // setUpdateFlag((oldValue) => ({
      //   ...oldValue,
      //   updateUser: (oldValue.updateUser += 1),
      // }));
      if (valiation === "Add") {
        addUsers(...users);
      } else if (valiation === "Update") {
      } else if (valiation === "Delete") {
      }
    };

    props.livePlatformManager.allUpdateComments.add(updateComments);
    props.livePlatformManager.allUpdateUsers.add(updateUsers);
    return () => {
      props.livePlatformManager.allUpdateComments.delete(updateComments);
      props.livePlatformManager.allUpdateUsers.delete(updateUsers);
    };
  }, [props.livePlatformManager]);

  return React.useMemo(
    () => (
      <>
        updateComment: {updateFlag.updateComment}
        <br />
        updateUser: {updateFlag.updateUser}
        <br />
      </>
      // <VariableSizeList
      //   {...props}
      //   height={600}
      //   width={700}
      //   itemCount={Object.keys(commentItems).length}
      //   itemSize={() => 60}
      // >
      //   {CommentViewRow}
      // </VariableSizeList>
    ),
    [updateFlag, commentItems, userItems]
  );
}

function CommentViewRow(
  props: React.PropsWithChildren<ListChildComponentProps>
) {
  const data = props.data[props.index];
  const no = <div>{data.no}</div>;
  const icon = iconUrlToElement(data.iconUrl);
  const name = <div>{data.userName}</div>;
  const time = timeToElement(data.time);
  const content = contentToElement(data.content);

  return (
    <div style={{ ...props.style, height: 60 }} key={data.id}>
      {no}
      {/* {icon} */}
      {name}
      {time}
      {content}
    </div>
  );
}

const defaultIconUrl =
  "https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/defaults/blank.jpg";

function iconUrlToElement(iconUrl?: string): JSX.Element {
  if (iconUrl == null) return <img src={defaultIconUrl}></img>;
  return <img src={iconUrl} style={{ height: 20, width: 20 }}></img>;
}

function timeToElement(time: number): JSX.Element {
  const h = Math.floor(time / 3600);
  const m = `${Math.floor((time % 3600) / 60)}`.padStart(2, "0");
  const s = `${time % 60}`.padStart(2, "0");
  return <div>{`${h}:${m}:${s}`}</div>;
}

function contentToElement(content: string): JSX.Element {
  return <div>{content}</div>;
}

// export type CommentViewProps = {
//   commentBox: CommentBox;
//   width: number;
//   height: number;
//   ref?: React.LegacyRef<VariableSizeList<CommentViewItem[]>>;
//   className?: string;
// };

// export function CommentView(props: CommentViewProps) {
//   const itemData = React.useMemo(props.commentBox.getComments, [
//     props.commentBox.getComments,
//   ]);

//   return React.useMemo(
//     () => (
//       <VariableSizeList<CommentViewItem[]>
//         {...props}
//         itemData={itemData}
//         itemCount={itemData.length}
//         itemSize={() => 60}
//       >
//         {CommentViewRow}
//       </VariableSizeList>
//     ),
//     [itemData]
//   );
// }

// function CommentViewRow(
//   props: React.PropsWithChildren<ListChildComponentProps<CommentViewItem[]>>
// ) {
//   const data = props.data[props.index];
//   const no = <div>{data.no}</div>;
//   const icon = iconUrlToElement(data.iconUrl);
//   const name = <div>{data.userName}</div>;
//   const time = timeToElement(data.time);
//   const content = contentToElement(data.content);

//   return (
//     <div style={{ ...props.style, height: 60 }} key={data.id}>
//       {no}
//       {/* {icon} */}
//       {name}
//       {time}
//       {content}
//     </div>
//   );
// }

// const defaultIconUrl =
//   "https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/defaults/blank.jpg";

// function iconUrlToElement(iconUrl?: string): JSX.Element {
//   if (iconUrl == null) return <img src={defaultIconUrl}></img>;
//   return <img src={iconUrl} style={{ height: 20, width: 20 }}></img>;
// }

// function timeToElement(time: number): JSX.Element {
//   const h = Math.floor(time / 3600);
//   const m = `${Math.floor((time % 3600) / 60)}`.padStart(2, "0");
//   const s = `${time % 60}`.padStart(2, "0");
//   return <div>{`${h}:${m}:${s}`}</div>;
// }

// function contentToElement(content: string): JSX.Element {
//   return <div>{content}</div>;
// }
