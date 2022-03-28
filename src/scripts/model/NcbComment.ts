/**
 * （このアプリ内で共通の）コメントの形式
 */
export interface NcbComment {
  /** 全配信プラットフォームで固有のコメントID */
  readonly globalId: string;
  /** このコメントの配信プラットフォームID */
  readonly livePlatformId: string;
  /** コメントをしたユーザーのID */
  readonly userGlobalId: string;
  /** コメント内容 */
  readonly content: NcbCommentContent;
}

/**
 * コメント内容\
 * コメビュの表現力に直結する
 */
export interface NcbCommentContent {
  /** テキスト */
  readonly text: string;
  /** 投稿時刻 UTC */
  readonly time: number;
  /** コメント番号 */
  readonly no?: number;
}
