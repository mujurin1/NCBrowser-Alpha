/**
 * （このアプリ内で共通の）ユーザーの形式
 */
export type NcbUser = {
  /** 全配信プラットフォームで固有のユーザーID */
  readonly globalId: string;
  /** このユーザーの配信プラットフォームID */
  readonly livePlatformId: string;
  /** ユーザーの状態 */
  readonly state: NcbUserState;
};

/**
 * ユーザーの状態\
 * コメビュの表現力に繋がる
 */
export type NcbUserState = {
  /** ユーザー名 */
  readonly name: string;
  /** アイコンURL */
  readonly iconUrl?: string;
};
