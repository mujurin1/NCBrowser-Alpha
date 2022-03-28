/**
 * （このアプリ内で共通の）ユーザーの形式
 */
export interface NcbUser {
  /** 全配信プラットフォームで固有のユーザーID */
  readonly globalId: string;
  /** このユーザーの配信プラットフォームID */
  readonly livePlatformId: string;
  /** ユーザーの状態 */
  readonly status: NcbUserState;
}

/**
 * ユーザーの状態\
 * コメビュの表現力に繋がる
 */
export interface NcbUserState {
  /** ユーザー名 */
  readonly name: string;
  /** アイコンURL */
  readonly iconUrl?: string;
}
