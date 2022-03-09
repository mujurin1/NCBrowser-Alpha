import { nanoid } from "nanoid";
import { NeedLiveManageTool } from "../LiveCycle/ChatMediation";
import { Chat, ChatID } from "../LiveCycle/ChatTypes";
import { LiveManager } from "../LiveCycle/LiveManager";

export type DemoChatType = {
  id: string;
  no: number;
  userId: string;
  time: number;
  comment: string;
};
export type DemoUserType = {
  id: string;
  name: string;
};

export class DemoLiveManager implements LiveManager {
  readonly #tool: NeedLiveManageTool;
  readonly #chats: Record<string, DemoChatType> = {};
  readonly #users: Record<string, DemoUserType> = {};

  readonly id: string;

  public constructor(tool: NeedLiveManageTool) {
    this.id = nanoid();
    this.#tool = tool;
    this.#tool.addLiveManager(this);
  }
  getAllChat(): Chat[] {
    return Object.entries(this.#chats).map(([_, chat]) => {
      return this.toChat(chat);
    });
  }
  getChatFromId(id: ChatID): Chat {
    const chat = this.#chats[id.chatId];
    if (chat == null) return undefined;
    return this.toChat(chat);
  }

  /** チャット受信を発生させる */
  public DEMO_createChat() {
    const chat = this.createDemoChat();
    this.#chats[chat.id] = chat;

    let user = this.#users[chat.userId];
    if (user == null) {
      user = this.crateDemoUser(chat);
      this.#users[user.id] = user;
    }

    this.#tool.chatUpdate({
      liveManagerId: this.id,
      chatId: chat.id,
      userId: chat.userId,
    });
  }

  private toChat(chat: DemoChatType): Chat {
    const user = this.#users[chat.userId];
    return {
      id: {
        liveManagerId: this.id,
        chatId: chat.id,
        userId: user.id,
      },
      no: chat.no,
      userName: user.name,
      time: chat.time,
      content: {
        text: chat.comment,
      },
    };
  }

  #nextChatId = 1;
  private createDemoChat(): DemoChatType {
    return {
      id: `${this.#nextChatId++}`,
      no: this.#nextChatId,
      userId: `${Math.floor(Math.random() * 10) + 1}`,
      time: Date.now(),
      comment: `テストコメント-${randText()}`,
    };
  }
  private crateDemoUser(chat: DemoChatType): DemoUserType {
    return {
      id: chat.userId,
      name: `ユーザー${alphabet[Math.floor(Math.random() * alphabet.length)]}`,
    };
  }
}

const alphabet = "ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ";

const text = [
  "|～ﾟ)ﾁﾗｯ",
  "reactの差分検知が参照ベースだから",
  "あげてない〜〜送るよ",
];
function randText(): string {
  return text[Math.floor(Math.random() * text.length)];
}
