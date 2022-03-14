import {
  CommentCollection,
  ReadonlyCommentCollection,
} from "../components/CommentCollection";
import {
  ReadonlyUserCollection,
  UserCollection,
} from "../components/UserCollection";
import { UpdateVariation } from "./LivePlatform";
import { NcbComment } from "./NcbComment";
import { NcbUser } from "./NcbUser";

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
