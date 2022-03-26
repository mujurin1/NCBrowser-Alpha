import { MY_SERVER } from "../common";
import { ChromeStorage } from "../storage/LocalStorage";
import { saveNicoOAuth } from "../storage/nico";

// https://github.com/niconamaworkshop/api/blob/master/oauth/README.md

/** ニコ生APIドメイン */
export const NicoDomain = "https://api.live2.nicovideo.jp";
/** ニコニコのトークン取得ページURL */
export const GetNicoTokenUrl = `${MY_SERVER}/auth`;
/**
 * ニコニコのトークンリフレッシュページURL\
 * bodyに`refresh_token={リフレッシュトークン}`が必要
 */
export const RefreshTokenUrl = `${MY_SERVER}/refresh`;

/**
 * ニコ生API Response Bodyが共有する形式\
 * ニコ生APIは JSON ペイロードを使用する
 *
 * APIによっては200を常に返す場合があるが、
 * `NicoApiResponseBody.meta`から本来の値を取得できる。
 */
export type NicoApiCommonResponseBody = {
  /** 本来のレスポンスステータスコードやエラーメッセージを含むメタ情報 */
  meta: {
    /**
     * 本来のレスポンスステータスコード\
     * [common http status codes](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes)と同じ
     */
    status: number;
    /**
     * エラーの種類\
     * https://github.com/niconamaworkshop/api/blob/master/oauth/README.md#common-error-codes
     */
    errorCode: string;
    /** エラーの詳細メッセージ */
    errorMessage?: string;
  };
  /** 普通の HTTP レスポンスと同様のペイロード */
  data?: any;
};

/**
 * ニコニコのトークン\
 * https://github.com/niconamaworkshop/websocket_api_document/blob/master/pdf/NOAUTH-Tokenendpoint.pdf
 */
export type NicoTokenData = {
  /** トークンが切れる時間（UNIX時間） */
  time: number;
  /** トークン */
  access_token: string;
  /** トークンの寿命（秒） */
  expires_in: number;
  /** リフレッシュトークン */
  refresh_token: string;
  /** スコープ */
  scope: string;
  /** ID TOKEN */
  id_token: string;
};

/**
 * トークンの寿命 -5分を過ぎていたらトークンをリセットする
 */
export async function checkTokenRefresh() {
  const oauth = ChromeStorage.storage.nico.oauth;
  if (oauth == null) {
    openNewTabGetNicoTokenPage();
  } else if (oauth.time - Date.now() <= 300) {
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
  await fetch(RefreshTokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `refresh_token=${refresh_token}`,
  })
    .then((res) => res.text())
    .then(async (res) => {
      const json = JSON.parse(res);
      await saveNicoOAuth(json);
    });
}
