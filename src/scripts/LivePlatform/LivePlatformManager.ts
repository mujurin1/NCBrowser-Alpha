import { SetOnlyTrigger, Trigger } from "../common/Trigger";
import { LivePlatform, UpdateVariation } from "./LivePlatform";
import { LiveState } from "./LiveState";
import { NcbComment } from "./NcbComment";
import { NcbUser } from "./NcbUser";

export class LivePlatformManager {
  public readonly livePlatforms: ReadonlyArray<LivePlatform>;

  /** 全配信プラットフォームの放送の状態変更通知 */
  readonly #allUpdateLiveState = new Trigger<[LiveState]>();
  /** 全配信プラットフォームのコメント通知（追加・更新） */
  readonly #allUpdateComments = new Trigger<
    [UpdateVariation, ...NcbComment[]]
  >();
  /** 全配信プラットフォームのユーザー更新通知（追加・更新） */
  readonly #allUpdateUsers = new Trigger<[UpdateVariation, ...NcbUser[]]>();

  /** 全配信プラットフォームの放送の状態変更通知 */
  readonly allUpdateLiveState = this.#allUpdateLiveState.asSetOnlyTrigger();
  /**
   * 全配信プラットフォームのコメント通知（追加・更新）\
   * コメント通知を送信する時点で、そのコメントをしたユーザーは`updateUsers`により通知されていることは保証されている
   */
  readonly allUpdateComments = this.#allUpdateComments.asSetOnlyTrigger();
  /** 全配信プラットフォームのユーザー更新通知（追加・更新） */
  readonly allUpdateUsers = this.#allUpdateUsers.asSetOnlyTrigger();

  constructor(...livePlatforms: LivePlatform[]) {
    this.livePlatforms = livePlatforms;

    this.livePlatforms.forEach((platform) => {
      platform.updateLiveState.add((state) =>
        this.#allUpdateLiveState.fire(state)
      );
      platform.updateUsers.add((user) => this.#allUpdateUsers.fire(user));
      platform.updateComments.add((comment) =>
        this.#allUpdateComments.fire(comment)
      );
    });
  }

  public get(id: string): LivePlatform {
    return this.livePlatforms.find((platform) => platform.id === id);
  }
}
