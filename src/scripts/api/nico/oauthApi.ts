import { ChromeStorage } from "../storage/LocalStorage";
import { NicoApiCommonResponseBody } from "./oauth";

/* https://github.com/niconamaworkshop/api/blob/master/oauth/README.md
 *
 * 延長リクエストの例
 * curl 'https://api.live2.nicovideo.jp/api/v1/unama/program/extension?userId=2525&nicoliveProgramId=lv123456789'
 *     -X PUT
 *     -H 'User-Agent: A Neat Comment Viewer'
 *     -H 'Authorization: Bearer <your access token>'
 *     -H 'Content-type: application/json'
 *     -d '{"minutes": 30}'
 *
 * API共通フォーマット・命名規則
 * https://github.com/niconamaworkshop/websocket_api_document/blob/master/pdf/NOAUTH-APIレスポンス共通情報.pdf
 */

const defaultHeaders = {
  "Content-type": "application/json",
};
function autorizationHeaders() {
  return {
    ...defaultHeaders,
    Authorization: `Bearer ${ChromeStorage.storage.nico.oauth!.access_token}`,
  };
}

/**
 * ニコ生APIに`fetch`する
 * @param url APIのURL
 * @param isAuthorize トークンが必要なら`True`
 * @returns NicoApiCommonResponseBody
 * @throws レスポンスのステータスが異常
 */
async function fetchNicoApi(
  url: string,
  isAuthorize: boolean
): Promise<NicoApiCommonResponseBody> {
  let headers: HeadersInit = defaultHeaders;
  if (isAuthorize) headers = { ...headers, ...autorizationHeaders() };

  return fetch(url, { headers })
    .then((res) => res.json())
    .then((body: NicoApiCommonResponseBody) => {
      if (body.meta.status !== 200)
        throw new Error(`${body.meta.errorCode}:${body.meta.errorMessage}`);
      return body;
    });
}

/**
 * ニコ生視聴用ウェブソケットURLを取得する
 * @param liveId 放送ID
 * @param userId 視聴者ID
 * @returns 視聴用WsUrl
 */
export async function nicoApiGetLiveWsUrl(
  liveId: string,
  userId: string
): Promise<string> {
  const url = `https://api.live2.nicovideo.jp/api/v1/wsendpoint?nicoliveProgramId=${liveId}&userId=${userId}`;
  // body = { url: ウェブソケットURL }
  return fetchNicoApi(url, true).then((body) => body.data.url);
}
