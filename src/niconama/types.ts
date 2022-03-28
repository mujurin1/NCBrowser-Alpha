import { ChromeStorage } from "../scripts/storage/LocalStorage";
import { saveNicoOAuth } from "./storage";

/**
 * ニコ生API Response Bodyが共有する形式\
 * ニコ生APIは JSON ペイロードを使用する
 *
 * APIによっては200を常に返す場合があるが、
 * `NicoApiResponseBody.meta`から本来の値を取得できる。
 */
export interface NicoApiCommonResponseBody {
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
}

/**
 * ニコニコのトークン\
 * https://github.com/niconamaworkshop/websocket_api_document/blob/master/pdf/NOAUTH-Tokenendpoint.pdf
 */
export interface NicoTokenData {
  /**
   * トークンが切れる時間（UNIX時間）\
   * この値は検証用に作成するため、本来のトークンには存在しない
   */
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
}
