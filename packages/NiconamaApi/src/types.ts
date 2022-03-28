type Values<T> = T[keyof T];

/**  通常のタグ配列 */
export interface NiconamaTags {
  /** 更新後の通常タグ一覧 ※ない場合、空配列を返す */
  items: NiconamaTag[];
  /** 全体でロックされているかどうか */
  ownerLocked: boolean;
}

/** 通常のタグの情報 */
export interface NiconamaTag {
  /** タグ内容 */
  text: string;
  /** ロックされているか */
  locked: boolean;
  /** 大百科リンク ※記事がない場合省略 */
  nicopediaArticleUrl?: string;
}

/** カテゴリタグの情報 */
export interface NiconamaCategory {
  /** カテゴリの文字列 */
  text: string;
  /** 大百科リンク ※記事がない場合省略 */
  nicopediaArticleUrl?: string;
}

/** ユーザーコメントの状態 */
export interface NiconamaCommentState {
  /** コメント投稿が禁止されているか */
  locked: boolean;
  /** コメント表示のレイアウト */
  layout: NiconamaCommentLayoutType;
}

/** 運営コメントの状態 */
export interface NiconamaOperatorCommentState {
  /** 本文 */
  body: string;
  /** コテハン ※ないとき省略 */
  name?: string;
  /** リンク ※ないとき省略 */
  link?: string;
  /** 色 ※ないとき省略 */
  decoration?: string;
  /** 固定コメントかどうか */
  isPermanent: boolean;
}
/** アンケート */
export interface NiconamaEnquete {
  /** 質問文 */
  question: string;
  /** 選択肢 */
  results: NiconamaEnqueteResult[];
  /** アンケートの状態 */
  status: NiconamaEnqueteStateType;
}

/** アンケートの選択肢及び回答 */
export interface NiconamaEnqueteResult {
  /** 選択肢本文 */
  item: string;
  /** 選択肢回答率(集計済みの場合のみ) */
  percentage?: number;
}

/**
 * ジャンプ (公式のみ)
 * (放送終了後に移動するやつ?)
 */
export interface NiconamaJump {
  /** ジャンプ時に表示するメッセージ */
  message: string;
  /** ジャンプ先のURL */
  url: string;
  /** ジャンプ先コンテンツメタデータ ※ないとき省略 */
  content: {
    /** コンテンツID */
    id: string;
    /** コンテンツ種別 */
    type: NiconamaContentType;
  };
}

/** チラ見せ状態 */
export interface NiconamaTrialWatchState {
  /** チラ見せが有効かどうか */
  enabled: true;
  /** チラ見せのコメントモード */
  commentMode: NiconamaTrialWatchCommentModeType;
}

/**
 * 視聴ストリーム関係
 */
export interface NiconamaStreamSelect {
  /** 視聴する画質 */
  quality: NiconamaStreamQualitieType;
  /**
   * 視聴する画質の制限（主にabr用、省略時に無制限）
   * 以下のいずれかの値を指定する
   */
  limit: NiconamaStreamQualitieType;
  /** 視聴の遅延を指定する */
  latency: NiconamaStreamLatencyType;
  /**
   * 追っかけ再生用のストリームを取得するかどうか
   * 省略時は`false`\
   * タイムシフトの場合は無視される\
   * 追っかけ再生が無効な番組で`true`だとエラーになる
   */
  chasePlay?: boolean;
}

// ========================== 列挙型定義 ==========================
/** Akashicのプレーの状態 */
export const NiconamaAkashicState = {
  /* akashic起動対象の番組であり、プレーができる状態 */
  ready: "ready",
  /* akashic起動対象の番組であるが、プレーがまだ利用できない状態 */
  prepare: "prepare",
  /* akashic起動対象の番組ではないか、プレーができない状態 */
  none: "none",
} as const;
export type NiconamaAkashicState = Values<typeof NiconamaAkashicState>;

/**
 * コメントサイズ\
 * （`big`はプレミアム専用）
 */
export const NiconamaCommentSize = {
  big: "big",
  medium: "medium",
  small: "small",
} as const;
/**
 * コメントサイズ\
 * （`big`はプレミアム専用）
 */
export type NiconamaCommentSize = Values<typeof NiconamaCommentSize>;

/**
 * コメント位置\
 * `naka`以外はプレミアム専用
 */
export const NiconamaCommentPosition = {
  ue: "ue",
  naka: "naka",
  shita: "shita",
} as const;
/**
 * コメント位置\
 * `naka`以外はプレミアム専用
 */
export type NiconamaCommentPosition = Values<typeof NiconamaCommentPosition>;

/** コメントのフォント*/
export const NiconamaCommentFont = {
  defont: "defont",
  mincho: "mincho",
  gothic: "gothic",
} as const;
/** コメントのフォント */
export type NiconamaCommentFont = Values<typeof NiconamaCommentFont>;

/** 放送の画質の種類 */
export const NiconamaStreamQualitieType = {
  /**
   * アダプティブビットレート\
   * 画質を変更する時に利用される。受信メッセージには存在しない。
   */
  abr: "abr",
  /** 6Mbps, 1080p, 30fps */
  "6Mbps1080p30fps": "6Mbps1080p30fps",
  /** 3Mbps, 720p */
  super_high: "super_high",
  /** 2Mbps, 450p */
  high: "high",
  /** 1Mbps, 450p */
  normal: "normal",
  /** 384kbps, 288p */
  low: "low",
  /** 192kbps, 288p */
  super_low: "super_low",
  /** 放送者用 2Mbps, 450p */
  broadcaster_high: "broadcaster_high",
  /** 放送者用 384kbps, 288p */
  broadcaster_low: "broadcaster_low",
  /** 音声のみ */
  audio_high: "audio_high",
  /** 音声のみ */
  audio_only: "audio_only",
} as const;
/** 放送の画質の種類 */
export type NiconamaStreamQualitieType = Values<
  typeof NiconamaStreamQualitieType
>;

/** ニコ生のコメントが流れるレイアウト */
export const NiconamaCommentLayoutType = {
  /** デフォルト */
  normal: "normal",
  /** 映像を縮小して上部に表示し、下の隙間にコメントを流す (公式のみ) */
  splittop: "splittop",
  /** コメントリストのみに追加して、映像の上にコメントを流さない (公式のみ) */
  background: "background",
} as const;
/** ニコ生のコメントが流れるレイアウト */
export type NiconamaCommentLayoutType = Values<
  typeof NiconamaCommentLayoutType
>;

/** アンケートの状態 */
export const NiconamaEnqueteStateType = {
  /* 回答受付中 */
  open: "open",
  /* 結果表示中 */
  closed: "closed",
} as const;
/** アンケートの状態 */
export type NiconamaEnqueteStateType = Values<typeof NiconamaEnqueteStateType>;

/**
 * コンテンツ種別\
 * (追加・変更予定あり)
 */
export const NiconamaContentType = {
  /** 動画 */
  nicovideo: "nicovideo",
  /** 生放送 */
  nicolive: "nicolive",
  /** 静画 */
  nicoseiga: "nicoseiga",
  /** 漫画 */
  nicomanga: "nicomanga",
} as const;
/**
 * コンテンツ種別\
 * (追加・変更予定あり)
 */
export type NiconamaContentType = Values<typeof NiconamaContentType>;

/**
 * チラ見せのコメントモード\
 * (追加・変更予定あり)
 */
export const NiconamaTrialWatchCommentModeType = {
  /** チラ見せ対象者がコメントできる */
  enabled: "enabled",
  /** チラ見せ対象者がコメントできる */
  transparent: "transparent",
  /** チラ見せ対象者がコメントできない */
  disabled: "disabled",
} as const;
/**
 * チラ見せのコメントモード\
 * (追加・変更予定あり)
 */
export type NiconamaTrialWatchCommentModeType = Values<
  typeof NiconamaTrialWatchCommentModeType
>;

/** `NiconamaDisconnect.data.reason`の種類 */
export const NiconamaDisconnectReasonType = {
  /** 追い出された */
  TAKEOVER: "TAKEOVER",
  /** 座席を取れなかった */
  NO_PERMISSION: "NO_PERMISSION",
  /** 放送が終了した */
  END_PROGRAM: "END_PROGRAM",
  /** 接続生存確認に失敗した */
  PING_TIMEOUT: "PING_TIMEOUT",
  /** 同一ユーザからの接続数上限を越えている */
  TOO_MANY_CONNECTIONS: "TOO_MANY_CONNECTIONS",
  /** 同一ユーザの視聴放送数上限を越えている */
  TOO_MANY_WATCHINGS: "TOO_MANY_WATCHINGS",
  /** 満席 */
  CROWDED: "CROWDED",
  /** メンテナンス中 */
  MAINTENANCE_IN: "MAINTENANCE_IN",
  /** 上記以外の一時的なサーバエラー */
  SERVICE_TEMPORARILY_UNAVAILABLE: "SERVICE_TEMPORARILY_UNAVAILABLE",
} as const;
/** `NiconamaDisconnect.data.reason`の種類 */
export type NiconamaDisconnectReasonType = Values<
  typeof NiconamaDisconnectReasonType
>;

/** 映像の遅延 */
export const NiconamaStreamLatencyType = {
  /** 低遅延 */
  low: "low",
  /** 高遅延 */
  high: "high",
} as const;
/** 映像の遅延 */
export type NiconamaStreamLatencyType = Values<
  typeof NiconamaStreamLatencyType
>;
