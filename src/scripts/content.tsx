import { saveNicoOAuth } from "./api/storage/nico";

/* ニコ生OAuthトークンを再設定する\
 * https://github.com/niconamaworkshop/websocket_api_document/blob/master/pdf/NOAUTH-Tokenendpoint.pdf
 */
const token_reset_pathnames = ["/oauthCallback", "/refresh"];
if (
  location.host === "us-central1-ncbrowseroauth.cloudfunctions.net" &&
  token_reset_pathnames.indexOf(location.pathname) >= 0
) {
  const data = document.getElementById("auto-data")?.innerText;
  if (data != null) {
    const json = JSON.parse(data);
    saveNicoOAuth(json);
  }
}
