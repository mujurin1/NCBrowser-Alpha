import { getNicoApiUseToken, NiconamaApiResponseBody } from "./common";

/**
 * このプロジェクト内部でのみ利用するもの
 */

/** 絶対に必須なヘッダー */
const defaultHeader = {
  "Content-type": "application/json",
};

/** トークンが必要な場合に必須なヘッダー */
const tokenHeader = () => ({
  ...defaultHeader,
  Authorization: `Bearer ${getNicoApiUseToken()}`,
});

/**
 * ニコニコOAuth APIリクエストを行う
 * @param baseUrl リクエストベースURL（?クエリ無し）
 * @param method HTTP Request method
 * @param useToken OAuth Tokenが必要か
 * @param query  URL末尾?のクエリ
 * @param body リクエストボディ
 */
export function fetchApiRequest(
  baseUrl: string,
  method: string,
  useToken: boolean,
  query?: Record<string, string | number | undefined>,
  body?: Record<string, string | number | undefined>
): Promise<NiconamaApiResponseBody> {
  const url = concatQuery(baseUrl, query);

  return fetch(url, {
    method: method,
    headers: useToken ? tokenHeader() : defaultHeader,
    body: JSON.stringify(body),
  })
    .then((res) => res.text())
    .then((json) => JSON.parse(json));
}

/**
 * ニコニコ NOAuth APIリクエストを行う\
 * https://github.com/niconamaworkshop/websocket_api_document/tree/master/pdf
 * @param baseUrl リクエストベースURL（?クエリ無し）
 * @param method HTTP Request method
 * @param useToken OAuth Tokenが必要か
 */
export function fetchNOAuthApiRequest(
  baseUrl: string,
  method: string,
  useToken: boolean
): Promise<NiconamaApiResponseBody> {
  const headers: any = useToken
    ? { Authorization: `Bearer ${getNicoApiUseToken()}` }
    : {};
  return fetch(baseUrl, { method, headers })
    .then((res) => res.text())
    .then((json) => JSON.parse(json));
}

function concatQuery(
  url: string,
  query?: Record<string, string | number | undefined>
): string {
  if (query == null) return url;
  url += "?";
  for (const [key, value] of Object.entries(query))
    if (value != null) url += `${key}=${value}&`;
  return url;
}
