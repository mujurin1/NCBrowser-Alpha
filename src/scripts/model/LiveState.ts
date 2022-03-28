import { NcbUser } from "./NcbUser";

/**
 * 接続している放送の状態
 */
export interface LiveState {
  /** 視聴可能か */
  readonly canViewing: boolean;
  /** 放送開始時刻 UTC */
  readonly startTime: number;
  /** 放送タイトル */
  readonly title: string;
  /** 放送者のユーザー */
  readonly liverId: NcbUser;
  /** ログインしているか? */
  readonly isLogin: boolean;
  /** ログインしているID */
  readonly viewUserId?: NcbUser;
  /** リアルタイムか */
  readonly isReal: boolean;
  /** コメント可能か */
  readonly canComment: boolean;
}
