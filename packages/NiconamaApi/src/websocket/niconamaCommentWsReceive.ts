/**
 * コメント用ウェブソケットが受信するメッセージJsonデータタイプ
 *
 * [コメントウェブソケットの各メッセージに関する説明](https://github.com/niconamaworkshop/websocket_api_document/blob/master/watch_client_to_server.md)
 *
 * [ウェブソケットに関する説明](https://github.com/niconamaworkshop/websocket_api_document)
 */
export type NiconamaCommentWsReceiveMessage =
  | { chat: NiconamaChat }
  | { ping: NiconamaCommentPing }
  | { thread: NiconamaThread };

/**
 * コメントデータ型\
 * コメントウェブソケットが受信する
 * @example `{"chat":{...}}`
 */
export type NiconamaChat = {
  /** 多分昔のアリーナなどの部屋IDのなごり？ */
  thread: string;
  /** コメント番号。公式放送は`undefined` */
  no: number;
  /** コメント時刻 枠取得からの経過時刻 (vpos/100 => 秒) */
  vpos: number;
  /** コメント時刻 UNIX時刻(UTC+9) */
  date: number;
  /** コメント時刻 秒未満 */
  date_usec: number;
  /** コマンド */
  mail: string | undefined;
  /** ユーザーID */
  user_id: string;
  /** 1:プレ垢 3:運営・主コメ */
  premium: number | undefined;
  /** 1:匿名・運営コメ */
  anonymity: number | undefined;
  /** コメント内容 */
  content: string;
  /** 1:自分自身のコメント */
  yourpost: number | undefined;
};

/**
 * @example `{"ping":{"content":"ps:0"}}`
 */
export type NiconamaCommentPing = {
  content: string;
};

/**
 * @example `{
 *   "thread": {
 *     "resultcode": 0,
 *     "thread": "M.o_CFGPo7SAc7MHN3rYsjFg",
 *     "revision": 1,
 *     "server_time": 1644470192,
 *     "last_res": 54,
 *     "ticket": "df49421a"
 *   }
 * }`
 */
export type NiconamaThread = {
  resultcode: number;
  thread: string;
  revision: number;
  server_time: number;
  last_res: number;
  ticket: string;
};
