
// 標準パッケージをインポート
let http = require('http');
let fs = require('fs');

// SlackSDKパッケージをインポート
const { WebClient, LogLevel } = require("@slack/web-api");


// トークンをパラメータにSlack(Bolt)のWebClient生成
const client = new WebClient(process.env.SLACK_TOKEN, {
  // ログレベルを定義
  logLevel: LogLevel.DEBUG
});

/**
 * サーバ生成スクリプト
 * index.htmlを読み込み、AzureFunctionの結果を反映してポート3080で起動する。
 */
 
http.createServer(function( req, res) {  

  // index.htmlを読み込み
  fs.readFile('./index.html','UTF-8',function( err, data) {
  
    // SlackAPIをコール
    populateConversationStore().then( function(result) {
    // console.log(conversationsList.join(''));

    // HTTPヘッダをセット
    res.writeHead(200, {'Contents-Type': 'text/plain', 'Access-Control-Allow-Origin': '*'});
    
    // 取得結果をhtmlに反映。joinにして配列を文字列に変換
    data = data.replace('<%=selectList %>', conversationsList.join(''));
    // console.log(data);
    
    // ボディにセット
    res.write(data);
    
    // 終了
    res.end();
    
    });
  });

}).listen(3080, 'localhost');

// SlackAPI取得結果格納用
let conversationsList = [];

/**
 * populateConversationStore()
 *
 */
async function populateConversationStore() {
  try {
    // 既に格納済みの場合は何もしない。
    // console.log("size:" + conversationsList.length);
    if( conversationsList.length > 0 ) {
      return "";
    }
    
    // パラメータ設定(アーカイブチャンネルは除く)  
    const param = {
      exclude_archived: true
    };
  
    // conversations.listをコールしてチャンネル内のコメント一覧を取得
    const result = await client.conversations.list(param);
    
    // 取得結果を格納
    saveConversations(result.channels);
  }
  catch (error) {
    // エラー時はエラーログを出力
    console.error(error);
  }
}

/**
 * saveConversations(conversationsArray)
 * SlackAPIの結果をパラメータに<option>タグを生成する。
 */
function saveConversations(conversationsArray) {
  // チャンネルリストを1件ずつ処理  
  conversationsArray.forEach(function(conversation){
    // optionタグを生成し、セット
    conversationsList.push(createOptionData(conversation));
  });
}

/**
 * createOptionData(conversation)
 * idとnameをパラメータにoptionタグを生成し返却する
 */
function createOptionData(conversation) {
  console.log(conversation["id"] + ":" + conversation["name"]);
  return "<option value=\"" + conversation["id"] + "\">" + conversation["name"] + "</option>"
  
}
