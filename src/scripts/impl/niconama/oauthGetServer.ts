import { ChromeStorage } from "../../storage/LocalStorage";
import { saveNicoOAuth } from "./storage";
import { NicoTokenData } from "./types";

// https://github.com/niconamaworkshop/api/blob/master/oauth/README.md

export const MY_SERVER =
  "https://us-central1-ncbrowseroauth.cloudfunctions.net";

/** ニコニコのトークン取得ページURL */
export const GetNicoTokenUrl = `${MY_SERVER}/auth`;
/**
 * ニコニコのトークンリフレッシュページURL\
 * bodyに`refresh_token={リフレッシュトークン}`が必要
 */
export const RefreshTokenUrl = `${MY_SERVER}/refresh`;

/**
 * ニコ生API OAuth Tokenをチェック・再取得する\
 * トークンの寿命の1分前を過ぎていたら再取得する
 */
export async function checkTokenRefresh() {
  const oauth = ChromeStorage.storage?.nico?.oauth;
  if (oauth == null) {
    openNewTabGetNicoTokenPage();
  } else if (oauth.time - Date.now() / 1000 <= 60) {
    await refreshNicoToken(oauth.refresh_token);
  }
}

/**
 * ニコニコのトークン取得ページを新しいタブで開く
 */
export function openNewTabGetNicoTokenPage() {
  window.open(GetNicoTokenUrl, "get_nico_oauth");
}

/**
 * ニコニコのトークンを再設定する
 * @param refresh_token リフレッシュトークン
 */
export async function refreshNicoToken(refresh_token: string) {
  const tokenData: NicoTokenData = await fetch(RefreshTokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `refresh_token=${refresh_token}`,
  })
    .then((res) => res.text())
    .then(async (res) => {
      const json = JSON.parse(res);
      return { ...json, time: Date.now() / 1000 + json.expires_in };
    });

  await saveNicoOAuth(tokenData);
}
