import { SetOnlyTrigger } from "../common/Trigger";
import { LiveState } from "./LiveState";
import { NcbComment } from "./NcbComment";
import { NcbUser } from "./NcbUser";

/**
 * 配信プラットフォーム（放送サイト）インターフェース\
 */
export interface LivePlatform {
  /** `LivePlatform`固有値 */
  readonly id: string;
  /** 配信プラットフォーム名 */
  readonly platformName: string;
  /**
   * 放送に接続しているか\
   * （コメントを取得・送信等プラットフォームからのイベントが発生しうる状態か）
   */
  readonly connecting: boolean;
  /** 接続している放送の状態 */
  readonly liveState?: LiveState;

  /** 放送の状態変更通知 */
  readonly updateLiveState: SetOnlyTrigger<[LiveState]>;
  /**
   * コメントが変化（追加・更新・削除）したことを通知する\
   * 通知を送信する時点で`comment.globalUserId`のユーザーは`changeUsers`により通知されていることを保証する
   */
  readonly changeComments: SetOnlyTrigger<[UpdateVariation, ...NcbComment[]]>;
  /** ユーザーが変化（追加・更新・削除）したことを通知する */
  readonly changeUsers: SetOnlyTrigger<[UpdateVariation, ...NcbUser[]]>;
}

/**
 * コメント・ユーザーの更新の種類
 */
export type UpdateVariation = "Add" | "Update" | "Delete";
