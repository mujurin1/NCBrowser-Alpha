import {
  CommentCollection,
  ReadonlyCommentCollection,
} from "./CommentCollection";
import { ReadonlyUserCollection, UserCollection } from "./UserCollection";
import { UpdateVariation } from "../model/LivePlatform";
import { NcbComment } from "../model/NcbComment";
import { NcbUser } from "../model/NcbUser";

/**
 * LivePlatformManager が返すチャット情報のストア\
 * ユーザーとコメント
 */
export class ChatStore {
  static #comments = new CommentCollection();
  static #users = new UserCollection();

  public static get comments(): ReadonlyCommentCollection {
    return ChatStore.#comments;
  }
  public static get users(): ReadonlyUserCollection {
    return ChatStore.#users;
  }

  public static changeComments(
    valiation: UpdateVariation,
    ...comments: NcbComment[]
  ) {
    if (valiation === "Add" || valiation === "Update") {
      ChatStore.addComments(...comments);
    } else if (valiation === "Delete") {
    }
  }

  public static changeUsers(valiation: UpdateVariation, ...users: NcbUser[]) {
    if (valiation === "Add" || valiation === "Update") {
      ChatStore.addUsers(...users);
    } else if (valiation === "Delete") {
    }
  }

  private static addComments(...comments: NcbComment[]) {
    ChatStore.#comments.set(...comments);
  }
  private static addUsers(...users: NcbUser[]) {
    ChatStore.#users.set(...users);
  }
}
