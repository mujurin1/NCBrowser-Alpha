import { NiconamaApiResponseBody } from "./common";
import { fetchApiRequest } from "./_common";

export interface NiconamaPutUnamaProgramsExtensionProp {
  query: {
    /**
     * ユーザーID
     * @example 2525
     */
    userId: number;
    /**
     * 番組ID
     * @example lv123456789
     */
    nicoliveProgramId: string;
  };
  body: {
    /** 延長する時間(分). 30の倍数 */
    minutes: number;
    /**
     * 指定されたとき、延長後の長さがこれを超えないかチェックされます\
     * 通常多重リクエストを防ぐために使われます
     */
    totalDurationMinutes?: number;
  };
}

export interface NiconamaPutUnamaProgramsExtensionResponse
  extends NiconamaApiResponseBody {
  data?: {
    /** 延長操作後の番組終了時刻です(ISO 8601形式) */
    endTime: string;
  };
}

const requestUrl =
  "https://api.live2.nicovideo.jp/api/v1/unama/programs/extension";

/**
 * 番組を延長します\
 * ユーザー生放送の場合最大360分、チャンネル生放送の場合最大1440分まで延長できます\
 * [ニコ生ワークショップ](https://github.com/niconamaworkshop/api/blob/master/oauth/_PUT_unama_programs_extension.md)
 */
export function NiconamaPutUnamaProgramsExtension({
  query,
  body,
}: NiconamaPutUnamaProgramsExtensionProp): Promise<NiconamaPutUnamaProgramsExtensionResponse> {
  return fetchApiRequest(requestUrl, "GET", true, query, body);
}
