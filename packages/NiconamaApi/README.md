ニコ生のAPIを纏めたものです

（リンクはニコ生ワークショップの招待制のGithubへのリンクです）

**types.ts**
* ウェブソケット・APIで利用される型定義ファイル


## api
ニコ生OAuthから利用できるAPI
[OAuth API](https://github.com/niconamaworkshop/api/blob/master/oauth/README.md)\
（中にはOAuth関係なく利用できるAPIもある）


## websocket
ニコ生ワークショップは`niconamaSystemWs`の解説しか見当たらないです…

### niconamaSystemWsXxxx
ニコ生視聴を扱うウェブソケット\
[WebSocket API 外部向け資料](https://github.com/niconamaworkshop/websocket_api_document)

**メモ**\
コメント送受信だけが目的なら、\
`GET https://api.live2.nicovideo.jp/api/v1/unama/programs/rooms`\
のAPIでコメント送受信用のデータを取得できるのでそれを使うと良い?\
[ワークショップリンク](https://github.com/niconamaworkshop/api/blob/master/oauth/_GET_unama_programs_rooms.md)

* niconamaSystemWsReceive.ts
  * 受信するメッセージ定義ファイル
  * NiconamaSystemWsReceiveMessage
  * [ワークショップリンク](https://github.com/niconamaworkshop/websocket_api_document/blob/master/watch_server_to_client.md)
* niconamaSystemWsSend.ts
  * 送信するメッセージ定義ファイル
  * NiconamaSystemWsSendMessage
  * [ワークショップリンク](https://github.com/niconamaworkshop/websocket_api_document/blob/master/watch_client_to_server.md)

### niconamaCommentWsXxxx
ニコ生のコメント取得用ウェブソケット\
[ワークショップ資料なし]

* niconamaCommentWsReceive.ts
  * コメントウェブソケットが受信するメッセージ定義ファイル
  * NiconamaCommentWsReceiveMessage
