import {
  NiconamaCommentFont,
  NiconamaCommentPosition,
  NiconamaCommentSize,
  NiconamaStreamSelect,
} from "../index";

/**
 * システム用ウェブソケットが送信するメッセージJsonデータタイプ
 *
 * [システムウェブソケットの各メッセージに関する説明](https://github.com/niconamaworkshop/websocket_api_document/blob/master/watch_server_to_client.md)
 *
 * [ウェブソケットに関する説明](https://github.com/niconamaworkshop/websocket_api_document)
 */
export type NiconamaSystemWsSendMessage =
  | NiconamaStartWatching
  | NiconamaKeepSeat
  | NiconamaGetAkashic
  | NiconamaChangeStream
  | NiconamaAnswerEnquete
  | NiconamaPong
  | NiconamaPostComment
  | NiconamaGetTaxonomy
  | NiconamaGetStreamQualities
  | NiconamaGetEventState;

/**
 * 視聴開始時に必要な情報を求めるメッセージです\
 * 成功の場合、ストリームやメッセージサーバー情報など
 * 複数メッセージが順番で返されます\
 * 失敗の場合、エラーメッセージが返されます
 * @example `{
 *   "type": "startWatching",
 *   "data": {
 *     "stream": {
 *       "quality": "abr",
 *       "limit": "super_high",
 *       "latency": "low",
 *       "chasePlay": false
 *     },
 *     "reconnect": false
 *   }
 * }`
 */
export type NiconamaStartWatching = {
  type: "startWatching";
  data: {
    /**
     * 視聴ストリーム関係\
     * サーバー負荷軽減のため、
     * 映像が不必要のときは必ず省略してください
     */
    stream?: NiconamaStreamSelect;
    /**
     * 座席再利用するかどうかの真偽値。省略時は`false`\
     * `true`の場合、前回取得したストリームを再利用する
     */
    reconnect?: boolean;
  };
};

/**
 * 座席を維持するためのハートビートメッセージ\
 * 継続に視聴するため、
 * 定期に(NiconamaSeat.keepIntervalSecごとに)サーバーに送る必要がある
 * @example `{
 *   "type": "keepSeat"
 * }`
 */
export type NiconamaKeepSeat = {
  type: "keepSeat";
};

/**
 * 新市場機能、生放送ゲームを起動するための情報を
 * 取得するためのメッセージです
 * @example`{
 *   "type": "getAkashic",
 *   "data": {
 *     "chasePlay": false
 *   }
 * }`
 */
export type NiconamaGetAkashic = {
  type: "getAkashic";
  data: {
    /**
     * 追っかけ再生かどうか
     * @default false
     */
    chasePlay: boolean;
  };
};

/**
 * 視聴ストリームの送信をサーバーに求めるメッセージです\
 * 有効な視聴セッションが既に存在する場合には
 * 作成しなおして返します。
 * @example `{
 *   "type": "changeStream",
 *   "data": {
 *     "quality": "high",
 *     "limit": "super_high",
 *     "latency": "low",
 *     "chasePlay": false
 *   }
 * }`
 */
export type NiconamaChangeStream = {
  type: "changeStream";
  data: NiconamaStreamSelect;
};

/**
 * アンケートの回答を送信するメッセージです
 * @example `{
 *   "type": "answerEnquete",
 *   "data": {
 *     "answer": 1
 *   }
 * }`
 */
export type NiconamaAnswerEnquete = {
  type: "answerEnquete";
  data: {
    /** 回答番号 (0から8までのインデックス) */
    answer: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  };
};

/**
 * websocket接続維持のための応答メッセージです
 * @example { "type": "pong" }
 */
export type NiconamaPong = { type: "pong" };

/**
 * コメントを投稿するためのメッセージです
 * @example `{
 *   "type": "postComment",
 *   "data": {
 *     "text": "テストコメントです",
 *     "vpos": 15801121,
 *     "isAnonymous": false,
 *     "size": "small",
 *     "color": "red"
 *   }
 * }`
 */
export type NiconamaPostComment = {
  type: "postComment";
  data: {
    /**
     * コメントの本文\
     * (通常75文字まで。isAnonymous: false のときは1024文字まで)
     */
    text: string;
    /** コメントの投稿位置 (0.01秒単位) */
    vpos: number;
    /** 匿名(184)で投稿するか */
    isAnonymous: boolean;
    /**
     * コメントサイズ\
     * @default "medium"
     */
    size?: NiconamaCommentSize;
    /**
     * コメント色。以下のいずれかの値を指定する\
     * 既定値あるいはカラーコード(#AA08FD, #A80)なので定義不能なため`string`\
     * [公式リファレンス](https://github.com/niconamaworkshop/websocket_api_document/blob/master/watch_client_to_server.md#フィールドの詳細-4)
     * @default "white"
     */
    color?: string;
    /**
     * コメント位置
     * @default "naka"
     */
    position?: NiconamaCommentPosition;
    /**
     * コメントのフォント
     * @default "defont"
     */
    font?: NiconamaCommentFont;
  };
};

/**
 * 番組のカテゴリ・タグを取得するためのメッセージ\
 * 送信すると`NiconamaTaxonomy`メッセージが返ってきます\
 * 更新されたタグの情報は`tagUpdated`で非同期に送られてくるため、
 * 視聴開始時に1回だけ使用する想定です。
 * @example `{ "type": "getTaxonomy" }`
 */
export type NiconamaGetTaxonomy = { type: "getTaxonomy" };

/**
 * 視聴可能画質一覧を取得するためのメッセージです\
 * 送信すると`NiconamaStreamQualities`メッセージが返ってきます\
 * 取得した一覧は`NiconamaChangeStream`で使用します
 * @example `{ "type": "getStreamQualities" }`
 */
export type NiconamaGetStreamQualities = { type: "getStreamQualities" };

/**
 * Liveの視聴開始時に復元用の状態を取得するためのメッセージです\
 * 送信すると`NiconamaEventState`メッセージが返ってきます\
 * （なぜか`data`は空なのに明示されている）\
 * [公式リファレンス](https://github.com/niconamaworkshop/websocket_api_document/blob/master/watch_client_to_server.md#geteventstate)
 * @example `{
 *   "type": "getEventState",
 *   "data": {}
 * }`
 */
export type NiconamaGetEventState = {
  type: "getEventState";
  data: {};
};
