import { SetOnlyTrigger, Trigger } from "../../common/Trigger";
import { Chat, ChatID } from "./ChatTypes";
import { LiveManager } from "./LiveManager";

/**
 * `LiveManager`が利用する\
 * 中身は`ChatMediation`
 */
export interface NeedLiveManageTool {
  /**
   * `LiveManager`を追加する
   * @param manager `LiveManager`
   */
  addLiveManager(manager: LiveManager): void;
  /**
   * `LiveManager`を削除する
   * @param manager `LiveManager`
   */
  deleteLiveManager(manager: LiveManager): void;
  /**
   * チャットが更新されたことを通知する
   * @param chatId `ChatID`
   */
  chatUpdate(chatId: ChatID): void;
}

/**
 * `ChatView`が利用する\
 * 中身は`ChatMediation`
 */
export interface NeedChatViewTool {
  /** チャットの更新を受信する */
  onChatUpdate: SetOnlyTrigger<[ChatID]>;
  /** 接続されている全ての`LiveManager`のID */
  get liveManagerIds(): string[];
  /** `LiveManager`が追加されたら呼ばれる */
  onAddLiveManager: SetOnlyTrigger<[string]>;
  /** `LiveManager`が削除されたら呼ばれる */
  onDeleteLiveManager: SetOnlyTrigger<[string]>;
  /**
   * 全`LiveManager`からチャットを取得する
   * @returns `Chat[]`
   */
  getChatAllLiveManager(): Chat[];
  /**
   * `LiveManager`のチャットを取得する
   * @param id `LiveManager`のID
   */
  getChatSelectLiveManager(id: string): Chat[];
  /**
   * チャットIDからチャットを取得する
   * @param id
   * @returns `Chat`又は`undefined`
   */
  getChatFromId(id: ChatID): Chat;
}

/**
 * このクラスは公開せず、生成したインスタンスを公開する\
 * このファイル最後の行で公開している
 */
class _ChatMediation implements NeedLiveManageTool, NeedChatViewTool {
  // ======================= PRIVATE =======================
  // ============= LiveManager
  #getLiveManager(id: string): LiveManager {
    return this.#liveManagers.find((manager) => manager.id === id);
  }
  readonly #liveManagers: LiveManager[] = [];
  /** `LiveManager`の追加時に実行する */
  readonly #addLiveManager = new Trigger<[string]>();
  /** `LiveManager`の削除時に実行する */
  readonly #deleteLiveManager = new Trigger<[string]>();
  /** チャットの更新時に実行するする */
  readonly #chatUpdate = new Trigger<[ChatID]>();

  // ======================= NeedLiveManageTool =======================
  public readonly onChatUpdate: SetOnlyTrigger<[ChatID]> =
    this.#chatUpdate.asSetOnlyTrigger();
  public addLiveManager(manager: LiveManager): void {
    this.#liveManagers.push(manager);
    this.#addLiveManager.fire(manager.id);
  }
  public deleteLiveManager(manager: LiveManager): void {
    const index = this.#liveManagers.indexOf(manager);
    this.#liveManagers.splice(index, 0);
    this.#addLiveManager.fire(manager.id);
  }
  public chatUpdate(chatId: ChatID): void {
    this.#chatUpdate.fire(chatId);
  }

  // ======================= NeedChatViewTool =======================
  public readonly onAddLiveManager = this.#addLiveManager.asSetOnlyTrigger();
  public readonly onDeleteLiveManager =
    this.#deleteLiveManager.asSetOnlyTrigger();
  get liveManagerIds(): string[] {
    return this.#liveManagers.map((manager) => manager.id);
  }
  public getChatSelectLiveManager(id: string): Chat[] {
    const manager = this.#liveManagers.find((m) => m.id === id);
    return manager.getAllChat();
  }
  public getChatAllLiveManager(): Chat[] {
    const chats: Chat[] = [];
    this.#liveManagers.forEach((manager) =>
      chats.push(...manager.getAllChat())
    );
    return chats;
  }
  public getChatFromId(id: ChatID): Chat {
    const manager = this.#getLiveManager(id.liveManagerId);
    if (manager == null) return undefined;
    return manager.getChatFromId(id);
  }
}

/**
 * `LiveManager`と`ChatView`の仲介役
 */
export const ChatMediation: NeedLiveManageTool & NeedChatViewTool =
  new _ChatMediation();
