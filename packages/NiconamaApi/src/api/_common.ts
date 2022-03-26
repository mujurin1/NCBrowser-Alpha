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
 * トークンが必要なAPIリクエストを行う
 * @param method HTTP Request method
 * @param baseUrl リクエストベースURL（?クエリ無し）
 * @param query  URL末尾?のクエリ
 * @param body リクエストボディ
 */
export function fetchApiRequestUseToken(
  baseUrl: string,
  method: string,
  query?: Record<string, string | number | undefined>,
  body?: Record<string, string | number | undefined>
): Promise<NiconamaApiResponseBody> {
  const url = concatQuery(baseUrl, query);
  console.log("fetchApiRequestUseToken url: ", url);

  return fetch(url, {
    method: method,
    headers: tokenHeader(),
    body: JSON.stringify(body),
  })
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
