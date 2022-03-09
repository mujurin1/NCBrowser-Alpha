
## CommentAgency
各[LiveManager](#LiveManager)と[CommentView](#CommentView)を取り次ぐ\
CommentViewが各LiveManagerからコメントを受け取るために利用するイメージ

このクラスをそのまま利用することはない。

CommentViewとLiveManagerでそれぞれ別インターフェース越しに利用する

### CommentAgencyUseCV
CommentViewがCommentAgencyを利用する時のインターフェース

プロパティ
* liveManagers 接続されているLiveManagerリスト
  * id LiveManagerを識別する値
* getComments LiveAgencyからコメントを受け取る
  * (liveAgencyId) => CommentViewItem[]
* onAdd/RemovedLiveManager LiveManagerが追加/削除されたら呼ばれる
  * コールバック関数を登録しておく `(id) => void`
* onUpdatedComment LiveAgencyがコメント表示内容を更新したい時に呼ばれる
  * コールバック関数を登録しておく `(UpdateComment) => void`
* 


CommentViewが利用する機能
* 

LiveManagerが利用する機能
* 表示するコメント情報(LiveViewItem)の追加・更新をする



## CommentBox
このオブジェクトを各LiveManagerに渡してコメントを追加して貰い、\
最後にCommentViewに渡して内容を表示する

プロパティ
* Comments
  * CommentViewで表示する配列
  * 表示順に並んでいる
* Filter
  * 表示するかの条件
  * このフィルタで絞ってCommentsに追加する

## LiveManager
コメントを管理するオブジェクト\
各配信毎に１つ存在して、コメントの取得・送信などを行う\
CommentBoxを受け取り自身の持っているコメントを追加して返す

## CommentView
CommentBoxに入っているコメントを表示する
