/**
 * 投稿者名・コメント内容・投稿時間等の塊\
 * `LiveManager`から`コメビュ`へチャット情報を送信するため型\
 *
 * `LiveManager`は自身の放送のチャット情報からこれを生成して送る
 * `CommentView`は受信したら自身が表示する形式に変換して保持（キャッシュ）する
 */
export type Chat = {
  id: ChatID;
  /** コメント番号 */
  no: number;
  /** ユーザー名 */
  userName: string;
  /** ユーザーのアイコン */
  iconUrl?: string;
  /** コメント投稿時刻 UTC+9 */
  time: number;
  /** コメント内容 */
  content: ChatContent;
};

/**
 * `LiveManager`と`コメビュ`がチャットを元にやり取りをするための識別子
 */
export type ChatID = {
  /** チャット送信元`LiveManager`ID */
  liveManagerId: string;
  /** 各`LiveManager`内で固有ならOK */
  chatId: string;
  /** 各`LiveManager`内で固有ならOK */
  userId: string;
};

/**
 * チャットの内容\
 * これでこのコメビュの表現力が決まる
 */
export type ChatContent = {
  text: string;
  /** @deprecated 現在非対応 */
  iconUrl?: string;
  /** @deprecated 現在非対応 */
  backgroundColor?: string;
  /** @deprecated 現在非対応 */
  font?: string;
  /** @deprecated 現在非対応 */
  fontSize?: number;
};
