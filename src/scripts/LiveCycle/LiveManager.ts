import { Chat, ChatID } from "./ChatTypes";

/**
 * 配信毎にコメントやユーザー等を管理する
 */
export interface LiveManager {
  /** 各`LiveManager`固有の値 */
  readonly id: string;
  /** 全ての`Chat`を取得する */
  getAllChat(): Chat[];
  /** `ChatID`から`Chat`を取得する */
  getChatFromId(id: ChatID): Chat;
}
