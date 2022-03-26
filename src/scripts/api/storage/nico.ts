import { ChromeStorage } from "./LocalStorage";

/**
 * ニコニコOAuth情報を保存する
 * @param json Omit<NicoTokenData, "time">
 */
export async function saveNicoOAuth(json: any) {
  if (
    typeof json.access_token === "string" &&
    typeof json.expires_in === "number" &&
    (typeof json.id_token === "string" ||
      typeof json.id_token === "undefined") &&
    typeof json.refresh_token === "string" &&
    typeof json.scope === "string"
  ) {
    ChromeStorage.storage.nico.oauth = {
      ...json,
      time: Date.now() + json.expires_in,
    };
  } else {
    throw new Error(
      `引数は有効なNicoTokenDataではありません\n${JSON.stringify(json)}`
    );
  }
}
