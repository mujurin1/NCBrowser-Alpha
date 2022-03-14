import { SetOnlyTrigger, Trigger } from "../common/Trigger";
import { ChatStore } from "./ChatStore";
import { LivePlatform, UpdateVariation } from "./LivePlatform";
import { LiveState } from "./LiveState";
import { NcbComment } from "./NcbComment";
import { NcbUser } from "./NcbUser";

export class LivePlatformManager {
  static #livePlatforms: ReadonlyArray<LivePlatform>;
  public static get livePlatforms() {
    return LivePlatformManager.#livePlatforms;
  }

  static readonly #allUpdateLiveState = new Trigger<[LiveState]>();
  static readonly #allChangeComments = new Trigger<
    [UpdateVariation, ...NcbComment[]]
  >();
  static readonly #allChangeUsers = new Trigger<
    [UpdateVariation, ...NcbUser[]]
  >();

  /** いずれかの配信プラットフォームの放送の状態が更新されたことを通知する */
  static readonly allUpdateLiveState =
    LivePlatformManager.#allUpdateLiveState.asSetOnlyTrigger();
  /**
   * いずれかの配信プラットフォームのコメントが変化（追加・更新・削除）したことを通知する\
   * 通知を送信する時点で`comment.globalUserId`のユーザーは`allChangeUsers`により通知されていることを保証する
   */
  static readonly allChangeComments =
    LivePlatformManager.#allChangeComments.asSetOnlyTrigger();
  /** 全配信プラットフォームのユーザー更新通知（追加・更新・削除）を受信 */
  static readonly allChangeUsers =
    LivePlatformManager.#allChangeUsers.asSetOnlyTrigger();

  public static initialize(...livePlatforms: LivePlatform[]) {
    LivePlatformManager.#livePlatforms = livePlatforms;
    // ChatStoreの情報を更新呼び出しを追加する
    LivePlatformManager.allChangeComments.add((valiation, ...comments) => {
      ChatStore.changeComments(valiation, ...comments);
    });
    LivePlatformManager.allChangeUsers.add((valiation, ...users) => {
      ChatStore.changeUsers(valiation, ...users);
    });

    // 各配信プラットフォーム通知に全配信通知呼び出しを追加する
    LivePlatformManager.livePlatforms.forEach((platform) => {
      platform.updateLiveState.add((state) => {
        LivePlatformManager.#allUpdateLiveState.fire(state);
      });
      platform.changeUsers.add((valiation, user) =>
        LivePlatformManager.#allChangeUsers.fire(valiation, user)
      );
      platform.changeComments.add((valiation, comment) => {
        LivePlatformManager.#allChangeComments.fire(valiation, comment);
      });
    });
  }

  public get(id: string): LivePlatform | undefined {
    return LivePlatformManager.livePlatforms.find(
      (platform) => platform.id === id
    );
  }
}
