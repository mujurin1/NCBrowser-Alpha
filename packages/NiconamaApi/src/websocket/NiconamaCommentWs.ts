import {
  NiconamaCommentRoom,
  NiconamaChat,
  NiconamaCommentPing,
  NiconamaCommentReceiveThread,
  NiconamaCommentWsReceiveMessage,
  NiconamaCommentWsSendMessage,
  NiconamaCommentThreadVersion,
} from "../index";

/**
 * ニコ生コメントを取得するためのクラス\
 * [資料PDF](https://niconama-workshop.slack.com/files/UBT6MQUJJ/F01M3711DLN/cached_message_server.pdf)
 * > また、適宜サーバの再起動が行われます\
 * > その際断りなくWebSocketの切断が行われます
 */
export class NiconamaCommentWs {
  /** ライブ接続時コメント取得完了メッセージ */
  static readonly #liveConnectedPing: NiconamaCommentPing = {
    content: "Live",
  };
  /** 過去コメ取得完了 */
  static readonly #tsCommentPing: NiconamaCommentPing = {
    content: "Ts",
  };

  /**
   * 接続中のWebSocket\
   * readyState: [`CONNECTING`,`OPEN`,`CLOSING`,`CLOSED`]
   */
  #ws: WebSocket;

  /** 部屋情報 */
  public readonly room: NiconamaCommentRoom;

  /** 接続しているか */
  public get connecting(): boolean {
    return this.#ws.readyState === 1;
  }
  /** コメント受信時に呼ばれる */
  public onReceiveChat: (chat: NiconamaChat) => void;
  /** スレッド受信時に呼ばれる */
  public onReceiveThread?: (thread: NiconamaCommentReceiveThread) => void;

  /**
   * コンストラクタ
   * @param room 接続部屋情報
   * @param receiveChat チャットを受信した時のコールバック関数
   */
  public constructor(
    room: NiconamaCommentRoom,
    receiveChat: (chat: NiconamaChat) => void
  ) {
    this.room = room;
    this.onReceiveChat = receiveChat;
    this.#ws = new WebSocket(this.room.webSocketUri, ["msg.nicovideo.jp#json"]);
    this.#ws.onmessage = (e) => this.receiveMessage(e);
  }

  /**
   * ウェブソケット開通したら呼ばれる\
   * すでに開通していたらすぐ呼ばれる
   * @param fn 呼んでもらう関数
   */
  public opendCall(fn: () => void) {
    if (this.#ws.readyState === 1) fn();
    else this.#ws.onopen = fn;
  }

  /**
   * ウェブソケットから切断します
   */
  public disconnect() {
    if (this.#ws.readyState >= 2) return;
    this.#ws.close();
  }

  /**
   * リアルタイムコメントの取得を開始します\
   * 以後新規コメントも取得できます\
   * リアルタイム接続時コメントを取得終了すると
   * `NiconamaCommentWs.#liveConnectedPing`が返ってくる
   * @param resFrom 最新順に取得するコメント件数 0 <= N <= 256
   * @param threadkey
   */
  public connectLive(resFrom: number, threadkey?: string) {
    this.sendMessage(
      {
        thread: {
          thread: this.room.threadId,
          res_from: -resFrom,
          version: NiconamaCommentThreadVersion,
          threadkey,
        },
      },
      { ping: NiconamaCommentWs.#liveConnectedPing }
    );
  }

  /**
   * ウェブソケットからメッセージを受信
   * @param e MessageEvent<>
   */
  private receiveMessage(e: MessageEvent<string>) {
    const message = JSON.parse(e.data) as NiconamaCommentWsReceiveMessage;

    if ("chat" in message) {
      this.onReceiveChat(message.chat);
    } else if ("ping" in message) {
      console.log("ping");
      console.log(message.ping);
      this.receivePing(message.ping);
    } else if ("thread" in message) {
      console.log("thread");
      console.log(message.thread);
    }
  }

  /**
   * pingメッセージ受信
   * @param ping NiconamaCommentPing
   */
  private receivePing(ping: NiconamaCommentPing) {
    if (ping === NiconamaCommentWs.#liveConnectedPing) {
      // ライブ接続完了
    } else if (ping === NiconamaCommentWs.#tsCommentPing) {
      // 過去コメ取得完了
    }
  }

  /**
   * メッセージを送信します
   * @param messages 送信するメッセージ配列
   */
  private sendMessage<T extends NiconamaCommentWsSendMessage>(
    ...messages: T[]
  ) {
    if (!this.connecting) return;

    const data = `[${messages.map((x) => JSON.stringify(x))}]`;
    console.log("send");
    console.log(data);

    this.#ws!.send(data);
  }
}
