import { NicoTokenData } from "../nico/oauth";

/**
 * `chrome.storage.local`\
 * ストレージ全体の型
 */
export type StorageData = {
  /** ニコニコ生放送 */
  nico: {
    /** ニコニコのOAuth情報 */
    oauth: NicoTokenData | undefined;
  };
};

/**
 * ストレージの初期値
 */
export const initialStorageData: StorageData = {
  nico: {
    oauth: undefined,
  },
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
