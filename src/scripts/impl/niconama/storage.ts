import { NiconamaIdToken } from "@ncb/niconama-api";
import { ChromeStorage } from "../../storage/LocalStorage";
import { NicoTokenData } from "./types";

/**
 * ニコニコOAuth情報を保存する
 * @param tokenData Omit<NicoTokenData, "time">
 * @param inspectionValue Nico OAuth API id_token 検証値
 */
export async function saveNicoOAuth(
  tokenData: NicoTokenData,
  inspectionValue?: NiconamaIdToken
) {
  if (
    typeof tokenData.access_token === "string" &&
    typeof tokenData.expires_in === "number" &&
    (typeof tokenData.id_token === "string" ||
      typeof tokenData.id_token === "undefined") &&
    typeof tokenData.refresh_token === "string" &&
    typeof tokenData.scope === "string"
  ) {
    ChromeStorage.storage.nico.oauth = tokenData;
    if (inspectionValue) {
      ChromeStorage.storage.nico.idTokens = inspectionValue;
    }
    ChromeStorage.saveStorage();
  } else {
    throw new Error(
      `引数は有効なNicoTokenDataではありません\n${JSON.stringify(tokenData)}`
    );
  }
}
