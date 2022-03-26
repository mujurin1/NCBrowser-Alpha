import { NiconamaCommentPing } from "../index";

/*
 * [資料PDF](https://niconama-workshop.slack.com/files/UBT6MQUJJ/F01M3711DLN/cached_message_server.pdf)
 */

export const NiconamaCommentThreadVersion = "20061206";

export type NiconamaCommentWsSendMessage =
  | { thread: NiconamaCommentThreadLive }
  | { thread: NiconamaCommentThreadTSVarB }
  | { thread: NiconamaCommentThreadTSVarC }
  | { ping: NiconamaCommentPing };

/**
 * ライブコメント取得用スレッドデータ定義\
 * > このメッセージを送るとウェブソケットに`thread`,`chat`メッセージがレスポンスとして返ります\
 * > 新しく投稿されたコメントも随時返ります
 */
export interface NiconamaCommentThreadLive {
  /** 接続先のスレッド */
  thread: string;
  /**
   * 最近N件分のコメントを取得する\
   * `-256`から`0`までの値
   */
  res_from: number;
  /** 20061206固定 */
  version: typeof NiconamaCommentThreadVersion;
  /**
   * 自分の投稿に`yourpost`を付加する場合に利用する\
   * `NiconamaRoom.yourPostKey`
   *
   * > なお、このキーはスレッドごとに異なり、
   * > `store`スレッドのキーを取得する方法は存在しない
   */
  threadkey?: string;
}

/**
 * ライブコメント取得用スレッドデータ定義\
 * 時刻`when`を基準に過去方向へ`re_from`件分のコメントを取得する\
 * > キャッシュを利用しないため乱用は避けてください
 */
export interface NiconamaCommentThreadTSVarB extends NiconamaCommentThreadLive {
  /** 基準時刻 UnixTime */
  when: number;
  /**
   * `when`から過去方向へ取得するコメント件数\
   * `-1000`から`0`までの値
   */
  res_from: number;
}

/**
 * ライブコメント取得用スレッドデータ定義\
 * コメ番`res_from`から時刻`when`までの間のコメントを取得する\
 * （ただし、コメント数は最大1000件まで。それ以降はDropする）
 * > キャッシュを利用しないため乱用は避けてください
 */
export interface NiconamaCommentThreadTSVarC extends NiconamaCommentThreadLive {
  /** 基準時刻 UnixTime */
  when: number;
  /**
   * 取得開始するコメント番号\
   * `1`以上の値
   */
  res_from: number;
}
