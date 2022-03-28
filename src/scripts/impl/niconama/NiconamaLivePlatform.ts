import {
  assertNiconamaResponse,
  NiconamaChat,
  NiconamaCommentRoom,
  NiconamaCommentWs,
  NiconamaGetUnamaProgramsRooms,
} from "@ncb/niconama-api";
import { nanoid } from "nanoid";
import { Trigger } from "../../common/Trigger";
import { LivePlatform, UpdateVariation } from "../../model/LivePlatform";
import { LiveState } from "../../model/LiveState";
import { NcbComment } from "../../model/NcbComment";
import { NcbUser } from "../../model/NcbUser";

export class NiconamaLivePlatform implements LivePlatform {
  /** ニコ生ユーザー情報 */
  #users: Record<string, NiconamaUser> = {};
  /** ニコ生コメント情報 */
  #comments: Record<string, NiconamaComment> = {};
  /** ニコ生コメント取得用ウェブソケット */
  #niconamaCommentWs?: NiconamaCommentWs;
  /** コメントの部屋 */
  #rooms: NiconamaCommentRoom[] = [];

  readonly #updateLiveState = new Trigger<[LiveState]>();
  readonly #updateComments = new Trigger<[UpdateVariation, ...NcbComment[]]>();
  readonly #updateUsers = new Trigger<[UpdateVariation, ...NcbUser[]]>();

  #connecting: boolean = false;
  #liveState?: LiveState;
  public get connecting() {
    return this.#connecting;
  }
  public get liveState() {
    return this.#liveState;
  }

  public static readonly id = "Niconama";
  public static readonly platformName = "ニコ生";
  public readonly id = NiconamaLivePlatform.id;
  public readonly platformName = NiconamaLivePlatform.platformName;

  readonly updateLiveState = this.#updateLiveState.asSetOnlyTrigger();
  readonly changeComments = this.#updateComments.asSetOnlyTrigger();
  readonly changeUsers = this.#updateUsers.asSetOnlyTrigger();

  public constructor() {}

  /**
   * 放送に接続する
   * @param useId 視聴者のニコニコユーザーID
   * @param liveId 放送ID
   */
  public async connectLive(useId: number, liveId: string) {
    if (this.#connecting) return;
    this.#connecting = true;
    const { meta, data } = await NiconamaGetUnamaProgramsRooms({
      query: {
        userId: useId,
        nicoliveProgramId: liveId,
      },
    });
    assertNiconamaResponse("NiconamaLivePlatform.connectLive", { meta, data });
    this.#rooms = data!;

    this.#niconamaCommentWs = new NiconamaCommentWs(
      this.#rooms[0],
      this.receiveChat.bind(this)
    );
    this.#niconamaCommentWs.opendCall(this.connected.bind(this));
    this.#niconamaCommentWs.onReceiveChat = this.receiveChat.bind(this);
  }

  /**
   * ニコ生コメント用ウェブソケットが開通したら呼ばれる
   */
  private connected() {
    this.#niconamaCommentWs!.connectLive(100);
  }

  /**
   * チャット受信
   * @params chats ニコ生コメント配列
   */
  private receiveChat(...chats: NiconamaChat[]) {
    console.log("receiveChat", chats);

    // 新規コメント・新規ユーザー
    const comments: NcbComment[] = [];
    const users: NcbUser[] = [];
    for (let chat of chats) {
      const comment = niconamaChatToComment(chat);
      this.#comments[comment.globalId] = comment;
      let user = this.#users[comment.globalId];
      if (user == null) {
        user = createUser(comment);
        this.#users[user.globalId] = user;
        users.push(toNcbUser(user));
      }
      comments.push(toNcbComment(comment, user));
    }
    if (users.length > 0) this.#updateUsers.fire("Add", ...users);
    this.#updateComments.fire("Add", ...comments);
  }
}

function toNcbComment(
  comment: NiconamaComment,
  user: NiconamaUser
): NcbComment {
  return {
    globalId: comment.globalId,
    userGlobalId: user.globalId,
    content: {
      text: comment.content,
      time: comment.date,
    },
    livePlatformId: NiconamaLivePlatform.id,
  };
}
function toNcbUser(user: NiconamaUser): NcbUser {
  return {
    globalId: user.globalId,
    livePlatformId: NiconamaLivePlatform.id,
    status: {
      name: user.name,
      iconUrl: user.iconUrl,
    },
  };
}

function niconamaChatToComment(chat: NiconamaChat): NiconamaComment {
  return {
    date: chat.date,
    date_usec: chat.date_usec,
    content: chat.content,
    globalId: nanoid(),
    userId: chat.user_id,
    anonymity: chat.anonymity === 1,
    premium: chat.premium === 1 || chat.premium === 3,
    sender:
      chat.premium !== 3 ? "listner" : chat.anonymity ? "system" : "liver",
  };
}

function createUser(comment: NiconamaComment): NiconamaUser {
  return {
    globalId: nanoid(),
    id: comment.userId,
    name: comment.userId,
    iconUrl: undefined,
  };
}

/**
 * NCBrowserで利用するニコ生ユーザー型
 */
export interface NiconamaUser {
  /** 全配信プラットフォームで固有のユーザーID */
  globalId: string;
  /** ユーザー名 */
  name: string;
  /** ニコ生ユーザーID */
  id: string;
  /** ユーザーアイコンURL */
  iconUrl?: string;
}

/**
 * NCBrowserで利用するニコ生コメント型
 */
export interface NiconamaComment {
  /** 全配信プラットフォームで固有のコメントID */
  globalId: string;
  /** NiconamaUser.id */
  userId: string;
  /** コメント番号. ニコニコ公式放送には存在しない */
  no?: number;
  /** コメント時刻 UNIX時刻(UTC+9) */
  date: number;
  /** コメント時刻 秒未満 */
  date_usec: number;
  /** コマンド */
  mail?: string;
  /** 1:自分自身のコメント */
  yourpost?: number;
  /** コメント内容 */
  content: string;
  /** プレ垢 */
  premium: boolean;
  /** 匿名 */
  anonymity: boolean;
  /**
   * コメントをした人の種類\
   * * listner: リスナー
   * * liver: 運営・生主
   * * system: システム
   */
  sender: "listner" | "liver" | "system";
}
