import {
  NiconamaTag,
  NiconamaCategory,
  NiconamaStreamQualitieType,
  NiconamaOperatorCommentState,
  NiconamaCommentState,
  NiconamaEnquete,
  NiconamaJump,
  NiconamaTrialWatchState,
  NiconamaDisconnectReasonType,
  NiconamaAkashicState,
} from "../index";

/**
 * システム用ウェブソケットが受信するメッセージJsonデータタイプ
 *
 * [システムウェブソケットの各メッセージに関する説明](https://github.com/niconamaworkshop/websocket_api_document/blob/master/watch_server_to_client.md)
 *
 * [ウェブソケットに関する説明](https://github.com/niconamaworkshop/websocket_api_document)
 */
export type NiconamaSystemWsReceiveMessage =
  | NiconamaSeat
  | NiconamaAkashic
  | NiconamaStream
  | NiconamaRoom
  | NiconamaServerTime
  | NiconamaStatistics
  | NiconamaSchedule
  | NiconamaSystemPing
  | NiconamaDisconnect
  | NiconamaReconnect
  | NiconamaPostCommentResult
  | NiconamaTagUpdated
  | NiconamaTaxonomy
  | NiconamaStreamQualities
  | NiconamaEventState;

/**
 * 新市場機能、生放送ゲームを起動するための情報
 * @example `{
 *   "type": "akashic",
 *   "data": {
 *     "status": "ready",
 *     "playId": "4712973",
 *     "token": "<some token>",
 *     "playerId": "43500561",
 *     "contentUrl": "https://hogehoge.json",
 *     "logServerUrl": "wss://fugafuga:4003"
 *   }
 * }`
 */
export interface NiconamaAkashic {
  type: "akashic";
  data: {
    /** Akashicのプレーの状態 */
    status: NiconamaAkashicState;
    /**
     * AkashicプレーのID\
     * `status`が`"ready"`の時のみ返される
     */
    playId?: string;
    /**
     * プレートークン\
     * `status`が`"ready"`の時のみ返される
     */
    token?: string;
    /**
     * AGVに渡すプレーヤーID\
     * `status`が`"ready"`の時のみ返される
     */
    playerId?: string;
    /**
     * AGVに渡すcontentUrl（エンジン設定ファイルを取得できる）\
     * `status`が`"ready"`の時のみ返される
     */
    contentUrl: string;
    /**
     * 接続先となるプレーログサーバー ウェブソケットUrl\
     * `status`が`"ready"`の時のみ返される
     */
    logServerUrl: string;
  };
}

/**
 * 接続すべきコメントの部屋情報を通知するメッセージです\
 *
 * 別で
 * [部屋情報取得API](https://github.com/niconamaworkshop/api/blob/master/oauth/_GET_unama_programs_rooms.md)
 * があるのでそっちを使ったほうが良いと思われる\
 * というか、コメント取得目的ならそもそも`NiconamaSystemWs`を使わなくて良い
 * @example `{
 *   "type": "room",
 *   "data": {
 *     "messageServer": {
 *       "uri": "wss://hoge.live2.nicovideo.jp/u13230/websocket",
 *       "type": "niwavided"
 *     },
 *     "name": "アリーナ",
 *     "threadId": "hoge",
 *     "isFirst": true,
 *     "waybackkey":"<some key token>",
 *     "yourPostKey": "<some key token>"
 *   }
 * }
 */
export interface NiconamaRoom {
  type: "room";
  data: {
    /** 部屋名 */
    name: string;
    /** コメントサーバー接続用データ？ */
    messageServer: {
      /** メッセージサーバーのURI (WebSocket) ※ XMLSocketのURIはありません */
      uri: string;
      /** メッセージサーバの種類 (現在常に`"niwavided"`) */
      type: string;
    };
    /** 多分昔のアリーナなどの部屋IDのなごり？ */
    threadId: string;
    /**
     * メッセージサーバーから受信するコメント（chatメッセージ）にyourpostフラグを付けるためのキー\
     * threadメッセージのthreadkeyパラメータに設定する
     */
    yourPostKey: string;
    /** (互換性確保のためのダミー値, 現在常に`true`) */
    isFirst: boolean;
    /** (互換性確保のためのダミー文字列, 現在常に`"waybackkey"`) */
    waybackkey: string;
    /**
     * ChatData.vpos の基準時刻(枠開始時刻？)\
     * vposを計算する基準(vpos:0)となる時刻。 (ISO8601形式)
     */
    vposBaseTime: string;
  };
}

/**
 * 放送開始,延長時に受信する\
 * システムウェブソケットが受信する
 * @example `{
 *  "type": "schedule",
 *  "data": {
 *    "begin": "2022-02-10T13:23:06+09:00",
 *    "end": "2022-02-10T14:23:06+09:00"
 *  }
 * }`
 */
export interface NiconamaSchedule {
  type: "schedule";
  data: {
    /** 放送開始時刻 (ISO8601) */
    begin: string;
    /** 放送終了時刻 (ISO8601) */
    end: string;
  };
}

/**
 * @example `{
 *   "type": "seat",
 *   "data": {
 *     "keepIntervalSec": 30
 *   }
 * }`
 */
export interface NiconamaSeat {
  type: "seat";
  data: {
    keepIntervalSec: number;
  };
}

/**
 * @example `{
 *   "type": "serverTime",
 *   "data": {
 *     "currentMs": "2020-07-09T16:36:00.462+09:00"
 *   }
 * }`
 */
export interface NiconamaServerTime {
  type: "serverTime";
  data: {
    /** サーバ時刻 (ISO8601形式、ミリ秒含む) */
    currentMs: string;
  };
}

/**
 * 視聴者・コメント数等情報\
 * 注）ニコ生ワークショップAPIでは`concurrentViewerScale`の説明が省かれている
 * @example `{
 *   "type": "statistics",
 *   "data": {
 *     "viewers": 19,
 *     "comments": 38,
 *     "adPoints": 0,
 *     "giftPoints": 0,
 *     "concurrentViewerScale": 1
 *   }
 * }`
 */
export interface NiconamaStatistics {
  type: "statistics";
  data: {
    /** 累計視聴者数 */
    viewers: number;
    /** 累計コメント数 */
    comments: number;
    /** 累計広告ポイント */
    adPoints: number;
    /** 累計ギフトポイント */
    giftPoints: number;
    /** 同接数? 0:居ない 1:居る */
    concurrentViewerScale: number;
  };
}

/**
 * @example `{
 *   "type": "stream",
 *   "data": {
 *     "uri": "https://xxxxxx.dmc.nico/hlslive/ht2_nicolive/nicolive-production-pgxxxxxxxxx_xxxxxxxxxxxxxx/master.m3u8?ht2_nicolive=xxxxxxxxxxx",
 *     "syncUri": "https://xxxxxx.dmc.nico/hlslive/ht2_nicolive/nicolive-production-pgxxxxxxxxx_xxxxxxxxxxxxxx/stream_sync.json?ht2_nicolive=xxxxxxxxxxx",
 *     "quality": "normal",
 *     "availableQualities":["normal", "high"],
 *     "protocol": "hls"
 *   }
 * }`
 */
export interface NiconamaStream {
  type: "stream";
  data: {
    uri: string;
    syncUri: string;
    quality: string;
    availableQualities: string[];
    protocol: string;
  };
}

/**
 * 30秒に1度送信される\
 * 受信したら`pong`を返さないとwsを切断される
 * @example `{"type":"ping"}`
 */
export interface NiconamaSystemPing {
  type: "ping";
}

/**
 * 視聴終了を通知するメッセージです
 * @example `{
 *   "type": "disconnect",
 *   "data": {
 *     "reason": "TAKEOVER"
 *   }
 * }`
 */
export interface NiconamaDisconnect {
  type: "disconect";
  /** 視聴終了の理由 */
  data: NiconamaDisconnectReasonType;
}

/**
 * WebSocket の再接続要求を通知するメッセージです\
 * 受信後再接続処理を必要とします
 * @example `{
 *   "type": "reconnect",
 *   "data": {
 *     "audienceToken": "<hashedToken>",
 *     "waitTimeSec": 10
 *   }
 * }`
 */
export interface NiconamaReconnect {
  type: "reconnect";
  data: {
    /**
     * 再接続用トークン\
     * WebSocket の URL のクエリパラメータ audience_token をこの値で置き換えてください。
     */
    audienceToken: string;
    /**
     * 再接続するまでの待機時間 (秒)\
     * 再接続するまでこの時間だけ待機してください。
     */
    waitTimeSec: number;
  };
}

/**
 * コメント投稿(postComment)メッセージの結果
 * @example `{
 *   "type": "postCommentResult",
 *   "data": {
 *     "chat": {
 *       "mail": "184",
 *       "anonymity": 1,
 *       "content": "テストコメントです",
 *       "restricted": true
 *     }
 *   }
 * }
 */
export interface NiconamaPostCommentResult {
  type: "postCommentResult";
  data: {
    /** 投稿したコメントの情報 */
    chat: {
      /** コマンド */
      mail?: string;
      /** 1:匿名・運営コメ */
      anonymity: number;
      /** コメント内容 */
      content: string;
      /** コメントを薄く表示するかどうか */
      restricted: boolean;
    };
  };
}

/**
 * タグに更新があったとき新しいリストを通知するメッセージです\
 * 編集されてから通知まで最大1分程度かかります
 * @example `{
 *   "type": "tagUpdated",
 *   "data": {
 *     "tags": {
 *       "items": [
 *         {
 *           "text": "タグ1",
 *           "locked": false,
 *           "nicopediaArticleUrl": "http://hoge.fuga/タグ1"
 *         },
 *         {
 *           "text": "タグ2",
 *           "locked": true
 *         },
 *         ...
 *       ],
 *       "ownerLocked": false
 *     }
 *   }
 * }
 */
export interface NiconamaTagUpdated {
  type: "tagUpdated";
  data: {
    /** 通常のタグの情報 */
    tags: {
      /** 更新後の通常タグ一覧 ※ない場合、空配列を返す */
      items: NiconamaTag[];
      /** 全体でロックされているかどうか */
      ownerLocked: boolean;
    };
  };
}

/**
 * `NiconamaGetTaxonomy`を送信したときに現在のカテゴリと
 * タグのリストを通知するメッセージです。
 * @example `{
 *   "type": "taxonomy",
 *   "data": {
 *     "categories": {
 *       "main": [
 *         {
 *           "text": "ゲーム",
 *           "nicopediaArticleUrl": "http://hoge.fuga/ゲーム"
 *         },
 *       ],
 *       "sub": []
 *     },
 *     "tags": {
 *       "items": [
 *         {
 *           "text": "タグ1",
 *           "locked": false,
 *           "nicopediaArticleUrl": "http://hoge.fuga/タグ1"
 *         },
 *         {
 *           "text": "タグ2",
 *           "locked": true
 *         },
 *               ...
 *       ],
 *       "ownerLocked": false
 *     }
 *   }
 * }`
 */
export interface NiconamaTaxonomy {
  type: "taxonomy";
  data: {
    /** 放送のカテゴリタグ */
    categories: {
      /** 放送のカテゴリタグ */
      main: NiconamaCategory[];
      /** 放送のサブカテゴリタグ ※ない場合、空配列を返す */
      sub: NiconamaCategory[];
    };
    /**  通常のタグの情報 */
    tags: {
      /** 更新後の通常タグ一覧 ※ない場合、空配列を返す */
      items: NiconamaTag[];
      /** 全体でロックされているかどうか */
      ownerLocked: boolean;
    };
  };
}

/**
 * `getStreamQualities`を送信したときに
 * 放送で使用できる画質のリストを通知するメッセージです。
 * @example `{
 *   "type": "streamQualities",
 *   "data": {
 *     "max": "super_high",
 *     "visible": [ "super_high", "high", ... ]
 *   }
 * }`
 */
export interface NiconamaStreamQualities {
  type: "streamQualities";
  data: {
    /**
     * この放送で視聴可能な最高画質 (追加・変更予定あり)\
     * （最低でも`super_low`）
     */
    max: NiconamaStreamQualitieType;
    /** 視聴者が選択可能な画質 (追加・変更予定あり) */
    visible: NiconamaStreamQualitieType[];
  };
}

/**
 * `getEventState` を送信したときに復元用の状態を通知するためのメッセージです
 * @example `{
 *   "type": "eventState",
 *   "data": {
 *     "commentState": {
 *       "locked": true,
 *       "layout": "background"
 *     },
 *     "operatorComment": {
 *       "body": "テスト",
 *       "name": "コメビュ",
 *       "link": "http://example.com",
 *       "decoration": "red",
 *       "isPermanent": true
 *     },
 *     "enquete": {
 *       "question": "今日の放送はいかがでしたか？",
 *       "results": [
 *         {
 *           "item": "よかった"
 *         },
 *         {
 *           "item": "よくなかった"
 *         }
 *       ],
 *       "status": "open"
 *     },
 *     "jump": {
 *       "message": "jump!!!",
 *       "url": "http://example.com",
 *       "content": {
 *         "id": "lv2525",
 *         "type": "nicolive"
 *       }
 *     },
 *     "trialWatchState": {
 *       "enabled": true,
 *       "commentMode": "enabled"
 *     }
 *   }
 * }`
 */
export interface NiconamaEventState {
  type: "eventState";
  data: {
    /** ユーザーコメントの状態 ※ないとき省略 */
    commentState?: NiconamaCommentState;
    /** 運営コメントの状態 ※ないとき省略 */
    operatorComment?: NiconamaOperatorCommentState;
    /** アンケート ※ないとき省略 */
    enquete?: NiconamaEnquete;
    /**
     * ジャンプ (公式のみ) ※ないとき省略\
     * (放送終了後に移動するやつ?)
     */
    jump?: NiconamaJump;
    /**
     * チラ見せ状態 ※ないとき省略\
     * (チラ見せ状態とは…？)
     */
    trialWatchState?: NiconamaTrialWatchState;
  };
}
