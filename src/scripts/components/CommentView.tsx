// import React, { useCallback, useEffect, useState } from "react";
// import { ListChildComponentProps, VariableSizeList } from "react-window";
// import { CommentBox, _CommentBox, _UpdateComment } from "../models/CommentBox";
// import { CommentViewItem } from "../models/Views";

// export type _CommentViewProps = {
//   _commentBox: _CommentBox;
//   width: number;
//   height: number;
//   ref?: React.LegacyRef<VariableSizeList<CommentViewItem[]>>;
//   className?: string;
// };

// export function _CommentView(props: _CommentViewProps) {
//   const [itemData, setItemData] = useState<CommentViewItem[]>([]);

//   useEffect(() => {
//     const add = (updateComments: _UpdateComment[]) => {
//       for (const [comment, flag] of updateComments) {
//         if (flag === "A") {
//           setItemData((oldValue) => [...oldValue, ...comment]);
//         } else if (flag === "D") {
//         } else if (flag === "U") {
//         }
//       }
//     };
//     props._commentBox.updated.add(add);
//     return () => props._commentBox.updated.delete(add);
//   }, [props._commentBox, itemData]);

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
