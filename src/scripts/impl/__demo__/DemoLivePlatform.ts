import { nanoid } from "nanoid";
import { Trigger } from "../../common/Trigger";
import { LivePlatform, UpdateVariation } from "../../model/LivePlatform";
import { LiveState } from "../../model/LiveState";
import { NcbComment } from "../../model/NcbComment";
import { NcbUser } from "../../model/NcbUser";
import { assert } from "../../common/util";

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

  #connecting: boolean = false;
  #liveState?: LiveState;
  public get connecting() {
    return this.#connecting;
  }
  public get liveState() {
    return this.#liveState;
  }

  readonly updateLiveState = this.#updateLiveState.asSetOnlyTrigger();
  readonly changeComments = this.#updateComments.asSetOnlyTrigger();
  readonly changeUsers = this.#updateUsers.asSetOnlyTrigger();

  public constructor() {}

  public newComments(plus: number): NcbComment[] {
    const comments: NcbComment[] = [];
    const users: NcbUser[] = [];
    for (let i = 0; i < plus; i++) {
      const comment = createComment();
      this.#demoComments[comment.globalId] = comment;

      let user = this.#demoUsers[comment.userInnerId];
      if (user == null) {
        user = createUser(comment.userInnerId);
        this.#demoUsers[user.innerId] = user;
        users.push(toNcbUser(user));
      }
      comments.push(toNcbComment(comment, user));
    }
    if (users.length > 0) this.#updateUsers.fire("Add", ...users);
    this.#updateComments.fire("Add", ...comments);
    return comments;
  }
}

interface DemoUser {
  /** 全配信プラットフォームで固有のユーザーID */
  globalId: string;
  /** デモプラットフォーム内でのユーザーID */
  innerId: string;
  /** ユーザー名 */
  name: string;
}

interface DemoComment {
  /** 全配信プラットフォームで固有のコメントID */
  globalId: string;
  /** デモプラットフォーム内でのコメントID */
  innerId: string;
  /** コメントしたユーザーの（デモプラットフォーム内での）ID */
  userInnerId: string;
  /** コメント内容 */
  comment: string;
}

let demoComments = 0;
const demoUsers = [
  { id: "1", name: "デモ　Ａ" },
  {
    id: "2",
    name: "デモ　Ｂ",
  },
  {
    id: "3",
    name: "デモ　Ｃ",
  },
  {
    id: "4",
    name: "デモ　Ｄ",
  },
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
    // comment: `userId:${user.id}, name: ${user.name}`,
    comment: randomComment(),
  };
}
function randomComment(): string {
  const text = "テストテキストです";
  const cnt = Math.random() * 10;
  let comment = "";
  for (let i = 0; i < cnt; i++) comment += text;
  return comment;
}

const createUser = (userId: string): DemoUser => {
  const user = demoUsers.find((user) => user.id === userId);
  assert(user != null);
  return {
    globalId: nanoid(),
    innerId: user.id,
    name: user.name,
  };
};

const toNcbUser = (user: DemoUser): NcbUser => ({
  globalId: user.globalId,
  livePlatformId: DemoLivePlatform.id,
  status: {
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
