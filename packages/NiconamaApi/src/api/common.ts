/**
 * ニコ生API OAuth Tokenを取得する関数\
 * APIを利用する前にセットしてください
 */
export function setNicoApiUseToken(fn: () => string) {
  getNicoApiUseToken = fn;
}
export let getNicoApiUseToken: () => string;

/**
 * `False`なら例外を出す
 * @param condition
 */
export function assertNiconamaResponse(
  name: string,
  body: NiconamaApiResponseBody
): asserts body {
  const { meta, data } = body;
  if (meta.status === 200) return;
  throw new Error(
    `Error: ${name}\nstatus: ${meta.status}. code: ${meta.errorCode}\n` +
      `Message: ${meta.errorMessage}\n` +
      `data:\n${JSON.stringify(data)}`
  );
}

/**
 * ニコ生のAPIのレスポンス形式\
 * （[例外的なAPI]を除く）\
 * TODO: [例外的なAPI]をリンクにする
 */
export interface NiconamaApiResponseBody {
  /** レスポンスステータス情報 */
  meta: NiconamaApiResponseMeta;
  /** HTTPレスポンス同様のペイロード */
  data?: any;
}

/**
 * API共通のメタ情報
 */
export interface NiconamaApiResponseMeta {
  /**
   * リクエストのレスポンスステータス\
   * [common http status code](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes)
   * と同じもの
   */
  status: number;
  /**
   * エラーの種類\
   * `status`が200以外の場合は必ず存在する\
   * [API共通エラーコード](https://github.com/niconamaworkshop/api/blob/master/oauth/README.md#common-error-codes)
   */
  errorCode?: string;
  /**
   * エラーの詳細メッセージ\
   * `status`が200以外のときでも存在しないときがある
   */
  errorMessage?: string;
}
