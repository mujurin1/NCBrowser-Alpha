import { NiconamaIdToken } from "@ncb/niconama-api";
import { saveNicoOAuth } from "../niconama/storage";
import { NicoTokenData } from "../niconama/types";
import { assert } from "./utils/util";

/*
 * ニコ生OAuthトークンを再設定する\
 * https://github.com/niconamaworkshop/websocket_api_document/blob/master/pdf/NOAUTH-Tokenendpoint.pdf
 */
(async function () {
  const token_reset_pathnames = ["/oauthCallback", "/refresh"];
  if (
    location.host === "us-central1-ncbrowseroauth.cloudfunctions.net" &&
    token_reset_pathnames.indexOf(location.pathname) >= 0
  ) {
    const tokenJson = document.getElementById("auto-data")?.innerText;
    const openIdJson = document.getElementById("open-id")?.innerText;
    assert(tokenJson != null && openIdJson != null);
    const tokenData: NicoTokenData = JSON.parse(tokenJson);
    const openIdData: NiconamaIdToken = JSON.parse(openIdJson);
    saveNicoOAuth(tokenData, openIdData);
  }
})();
