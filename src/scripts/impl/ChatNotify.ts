import { SetOnlyTrigger, Trigger } from "../common/Trigger";
import { ChatStore } from "./ChatStore";
import { LivePlatform, UpdateVariation } from "../model/LivePlatform";
import { LiveState } from "../model/LiveState";
import { NcbComment } from "../model/NcbComment";
import { NcbUser } from "../model/NcbUser";

/**
 * 各配信プラットフォームのチャット受信を通知する\
 */
export class ChatNotify {
  static #livePlatforms: ReadonlyArray<LivePlatform>;
  public static get livePlatforms() {
    return ChatNotify.#livePlatforms;
  }

  static readonly #allChangeComments = new Trigger<
    [UpdateVariation, ...NcbComment[]]
  >();
  static readonly #allChangeUsers = new Trigger<
    [UpdateVariation, ...NcbUser[]]
  >();

  /**
   * いずれかの配信プラットフォームのコメントが変化（追加・更新・削除）したことを通知する\
   * 通知を送信する時点で`comment.globalUserId`のユーザーは`allChangeUsers`により通知されていることを保証する
   */
  static readonly allChangeComments =
    ChatNotify.#allChangeComments.asSetOnlyTrigger();
  /** 全配信プラットフォームのユーザー更新通知（追加・更新・削除）を受信 */
  static readonly allChangeUsers =
    ChatNotify.#allChangeUsers.asSetOnlyTrigger();

  public static initialize(...livePlatforms: LivePlatform[]) {
    ChatNotify.#livePlatforms = livePlatforms;
    // ChatStoreの情報を更新呼び出しを追加する
    ChatNotify.allChangeComments.add((valiation, ...comments) => {
      ChatStore.changeComments(valiation, ...comments);
    });
    ChatNotify.allChangeUsers.add((valiation, ...users) => {
      ChatStore.changeUsers(valiation, ...users);
    });

    // 各配信プラットフォーム通知に全配信通知呼び出しを追加する
    ChatNotify.livePlatforms.forEach((platform) => {
      platform.changeUsers.add((valiation, ...users) =>
        ChatNotify.#allChangeUsers.fire(valiation, ...users)
      );
      platform.changeComments.add((valiation, ...comments) => {
        ChatNotify.#allChangeComments.fire(valiation, ...comments);
      });
    });
  }

  public get(id: string): LivePlatform | undefined {
    return ChatNotify.livePlatforms.find((platform) => platform.id === id);
  }
}
