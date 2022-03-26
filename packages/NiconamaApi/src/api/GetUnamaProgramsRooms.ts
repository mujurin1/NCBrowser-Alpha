import { NiconamaApiResponseBody } from "./common";
import { fetchApiRequestUseToken } from "./_common";

export interface NiconamaGetUnamaProgramsRoomsProp {
  query: {
    /**
     * ユーザーID
     * @example 2525
     */
    userId: number;
    /**
     * 番組ID
     * @example lv123456789
     */
    nicoliveProgramId: string;
  };
}

export interface NiconamaGetUnamaProgramsRoomsResponse
  extends NiconamaApiResponseBody {
  data?: NiconamaCommentRoom[];
}

/**
 * ニコ生コメント部屋情報
 *
 * 共通の部屋 (id:0, name:"アリーナ") は
 * フィルタされたコメントのみ受け付けます\
 * 短時間にコメントが多すぎるときはコメントが
 * store (id:1, name:"store") に送られ視聴者に表示されません
 */
export interface NiconamaCommentRoom {
  /** 部屋のID */
  id: number;
  /** メッセージサーバURL */
  webSocketUri: string;
  /** メッセージサーバ上の部屋のスレッドID */
  threadId: string;
  /** 部屋名 */
  name: string;
}

const requestUrl = "https://api.live2.nicovideo.jp/api/v1/unama/programs/rooms";

/**
 * コメントを送受信するために使われる部屋の情報を取得します\
 * [ニコ生ワークショップ](https://github.com/niconamaworkshop/api/blob/master/oauth/_GET_unama_programs_rooms.md)
 */
export function NiconamaGetUnamaProgramsRooms({
  query,
}: NiconamaGetUnamaProgramsRoomsProp): Promise<NiconamaGetUnamaProgramsRoomsResponse> {
  return fetchApiRequestUseToken(requestUrl, "GET", query);
}
