import { NiconamaIdToken } from "@ncb/niconama-api";
import { NicoTokenData } from "../impl/niconama/types";

/**
 * `chrome.storage.local`\
 * ストレージ全体の型
 */
export interface StorageData {
  /** ニコニコ生放送 */
  nico: {
    /** ニコニコのOAuth情報 */
    oauth?: NicoTokenData;
    /** ログインしているユーザーの情報やAPI Token情報 */
    idTokens?: NiconamaIdToken;
  };
}

export interface storage {}

// export interface ExtensionStorage {

// }
