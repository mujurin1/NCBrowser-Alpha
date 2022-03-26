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
  | { thread: NiconamaCommentReceiveThread };

/**
 * コメントデータ型\
 * コメントウェブソケットが受信する
 * @example `{"chat":{...}}`
 */
export interface NiconamaChat {
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
}

/**
 * 送信したpingはそのまま返される\
 * コメント取得開始～終了の確認に利用される
 * @example `{"ping":{"content":"ps:0"}}`
 */
export interface NiconamaCommentPing {
  /** 実際はなんでも良いのだが、ここではstringに限定させてもらう */
  content: string;
}

/**
 * [資料PDF](https://niconama-workshop.slack.com/files/UBT6MQUJJ/F01M3711DLN/cached_message_server.pdf)
 * より
 * > キャッシュサーバとしての技術的制約により、
 * > threadの`last_res`,`ticket`は正確ではない
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
export interface NiconamaCommentReceiveThread {
  resultcode: number;
  thread: string;
  revision: number;
  server_time: number;
  last_res: number;
  ticket: string;
}
