import { setNicoApiUseToken } from "@ncb/niconama-api";
import { ChromeStorage } from "../../storage/LocalStorage";
import { checkTokenRefresh } from "./oauthGetServer";

/**
 * ニコ生APIの初期設定を行う
 */
export async function niocnamaApiInitialize() {
  // API トークン取得関数セット
  setNicoApiUseToken(() => ChromeStorage.storage.nico.oauth!.access_token);

  // ニコニコAPIトークンチェック
  await checkTokenRefresh();
}
