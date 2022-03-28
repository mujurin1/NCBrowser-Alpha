// ==============================================================
// =========== open_id の取得はfunctions で行っている ===========
// ==============================================================

// import { NiconamaApiResponseBody } from "./common";
// import { fetchApiRequest, fetchNOAuthApiRequest } from "./_common";

// export interface NiconamaNOAuthGetIdTokensResponse
//   extends NiconamaApiResponseBody {
//   data?: NiconamaIdToken;
// }

/**
 * ログインしているユーザーの情報やAPI Token情報
 */
export interface NiconamaIdToken {
  /** OAuth Domain */
  iss: string;
  /** ニコニコユーザーID */
  sub: string;
  /** トークンの発行先クライアントID */
  aud: string[];
  /** このID Tokenの発行日時（UNIX TIME） */
  lat: number;
  /** このID Tokenの失効日時（UNIX TIME） */
  exp: number;
  /**
   * このユーザーの全開の認証日時\
   * 発行時に`max_age`が与えられた時に現れる
   */
  auth_time: number;
  /**
   * 発行時に与えたnonce\
   * ID Token発行時にリクエストで与えたnonce文字列がある時に、その内容
   */
  nonce?: string;
  at_hash?: string;
}

// const requestUrl = (id_token: string) =>
//   `https://oauth.nicovideo.jp/v1/id_tokens/${id_token}.json`;

// /**
//  * OAuth API id_token を検証し内容を得る\
//  * [ニコ生ワークショップ](https://github.com/niconamaworkshop/websocket_api_document/blob/master/pdf/API/NOAUTH-GET_id_tokens.pdf)
//  * @param idToken OAuth id_token
//  */
// export function NiconamaNOAuthGetIdTokens(
//   idToken: string
// ): Promise<NiconamaNOAuthGetIdTokensResponse> {
//   return fetchNOAuthApiRequest(requestUrl(idToken), "GET", true);
// }
