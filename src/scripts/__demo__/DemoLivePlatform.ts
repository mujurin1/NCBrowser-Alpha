import { nanoid } from "nanoid";
import { Trigger } from "../common/Trigger";
import { LivePlatform, UpdateVariation } from "../LivePlatform/LivePlatform";
import { LiveState } from "../LivePlatform/LiveState";
import { NcbComment } from "../LivePlatform/NcbComment";
import { NcbUser } from "../LivePlatform/NcbUser";

/**
 * テスト用デモ配信プラットフォーム
 */
export class DemoLivePlatform implements LivePlatform {
  /** { [globalId]: DemoUser } */
  #demoUsers: Record<string, DemoUser> = {};
  /** { [globalId]: DemoComment } */
  #demoComments: Record<string, DemoComment> = {};

  readonly #updateLiveState = new Trigger<[LiveState]>();
  readonly #updateComments = new Trigger<[UpdateVariation, ...NcbComment[]]>();
  readonly #updateUsers = new Trigger<[UpdateVariation, ...NcbUser[]]>();

  public static readonly id = "DemoLivePlatform";
  public static readonly platformName = "デモ-プラットフォーム";
  readonly id = DemoLivePlatform.id;
  readonly platformName = DemoLivePlatform.platformName;

  connecting: boolean = false;
  liveState?: LiveState;

  readonly updateLiveState = this.#updateLiveState.asSetOnlyTrigger();
  readonly updateComments = this.#updateComments.asSetOnlyTrigger();
  readonly updateUsers = this.#updateUsers.asSetOnlyTrigger();

  public constructor() {}

  public newComment() {
    const comment = createComment();
    this.#demoComments[comment.globalId] = comment;
    let user = this.#demoUsers[comment.userInnerId];
    if (user == null) {
      user = createUser(comment.userInnerId);
      this.#demoUsers[user.globalId] = user;
      this.#updateUsers.fire("Add", toNcbUser(user));
    }
    this.#updateComments.fire("Add", toNcbComment(comment, user));
  }
}

type DemoUser = {
  /** 全配信プラットフォームで固有のユーザーID */
  globalId: string;
  /** デモプラットフォーム内でのユーザーID */
  innerId: string;
  /** ユーザー名 */
  name: string;
};

type DemoComment = {
  /** 全配信プラットフォームで固有のコメントID */
  globalId: string;
  /** デモプラットフォーム内でのコメントID */
  innerId: string;
  /** コメントしたユーザーの（デモプラットフォーム内での）ID */
  userInnerId: string;
  /** コメント内容 */
  comment: string;
};

let demoComments = 0;
const demoUsers = [
  { id: "1", name: "デモ　Ａ" },
  { id: "2", name: "デモ　Ｂ" },
  { id: "3", name: "デモ　Ｃ" },
  { id: "4", name: "デモ　Ｄ" },
  { id: "5", name: "デモ　Ｅ" },
];
const randomUser = () =>
  demoUsers[Math.floor(Math.random() * demoUsers.length)];

function createComment(): DemoComment {
  demoComments += 1;
  const user = randomUser();
  return {
    globalId: nanoid(),
    innerId: `${demoComments}`,
    userInnerId: user.id,
    comment: `userId:${user.id}, name: ${user.name}`,
  };
}
const createUser = (userId: string): DemoUser => {
  const user = demoUsers.find((user) => user.id === userId);
  return {
    globalId: nanoid(),
    innerId: user.id,
    name: user.name,
  };
};

const toNcbUser = (user: DemoUser): NcbUser => ({
  globalId: user.globalId,
  livePlatformId: DemoLivePlatform.id,
  state: {
    name: user.name,
  },
});
const toNcbComment = (comment: DemoComment, user: DemoUser): NcbComment => ({
  globalId: nanoid(),
  livePlatformId: DemoLivePlatform.id,
  userGlobalId: user.globalId,
  content: {
    text: comment.comment,
    time: Date.now(),
  },
});
