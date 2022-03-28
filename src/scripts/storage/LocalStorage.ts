import { NiconamaIdToken } from "@ncb/niconama-api";
import { NicoTokenData } from "../../niconama/types";

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

/**
 * ストレージの初期値
 */
export const initialStorageData: StorageData = {
  nico: {},
};

/**
 * `chrome.storage.local`に保存するデータを扱う
 */
export class ChromeStorage {
  /** StorageData */
  static storage: StorageData = initialStorageData;

  /**
   * 初期化
   */
  public static async initialize() {
    await ChromeStorage.loadStorage();
  }

  /**
   * ストレージから全情報を取得する
   */
  public static async loadStorage(): Promise<void> {
    ChromeStorage.storage = await getAllStorage();
  }

  /**
   * `LocalStorage.storage`の情報をストレージへ保存する
   */
  public static async saveStorage(): Promise<void> {
    await setAllStorage(ChromeStorage.storage);
  }
}

/**
 * ストレージ全情報を取得する
 * @returns Promise<StorageData>
 */
async function getAllStorage(): Promise<StorageData> {
  return (await chrome.storage.local.get(undefined)) as StorageData;
}

/**
 * ストレージ全情報を保存(上書き)する
 * @param storage StorageData
 */
async function setAllStorage(storage: StorageData): Promise<void> {
  await chrome.storage.local.set(storage);
}
