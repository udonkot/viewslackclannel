
// �W���p�b�P�[�W���C���|�[�g
let http = require('http');
let fs = require('fs');

// SlackSDK�p�b�P�[�W���C���|�[�g
const { WebClient, LogLevel } = require("@slack/web-api");


// �g�[�N�����p�����[�^��Slack(Bolt)��WebClient����
const client = new WebClient(process.env.SLACK_TOKEN, {
  // ���O���x�����`
  logLevel: LogLevel.DEBUG
});

/**
 * �T�[�o�����X�N���v�g
 * index.html��ǂݍ��݁AAzureFunction�̌��ʂ𔽉f���ă|�[�g3080�ŋN������B
 */
 
http.createServer(function( req, res) {  

  // index.html��ǂݍ���
  fs.readFile('./index.html','UTF-8',function( err, data) {
  
    // SlackAPI���R�[��
    populateConversationStore().then( function(result) {
    // console.log(conversationsList.join(''));

    // HTTP�w�b�_���Z�b�g
    res.writeHead(200, {'Contents-Type': 'text/plain', 'Access-Control-Allow-Origin': '*'});
    
    // �擾���ʂ�html�ɔ��f�Bjoin�ɂ��Ĕz��𕶎���ɕϊ�
    data = data.replace('<%=selectList %>', conversationsList.join(''));
    // console.log(data);
    
    // �{�f�B�ɃZ�b�g
    res.write(data);
    
    // �I��
    res.end();
    
    });
  });

}).listen(3080, 'localhost');

// SlackAPI�擾���ʊi�[�p
let conversationsList = [];

/**
 * populateConversationStore()
 *
 */
async function populateConversationStore() {
  try {
    // ���Ɋi�[�ς݂̏ꍇ�͉������Ȃ��B
    // console.log("size:" + conversationsList.length);
    if( conversationsList.length > 0 ) {
      return "";
    }
    
    // �p�����[�^�ݒ�(�A�[�J�C�u�`�����l���͏���)  
    const param = {
      exclude_archived: true
    };
  
    // conversations.list���R�[�����ă`�����l�����̃R�����g�ꗗ���擾
    const result = await client.conversations.list(param);
    
    // �擾���ʂ��i�[
    saveConversations(result.channels);
  }
  catch (error) {
    // �G���[���̓G���[���O���o��
    console.error(error);
  }
}

/**
 * saveConversations(conversationsArray)
 * SlackAPI�̌��ʂ��p�����[�^��<option>�^�O�𐶐�����B
 */
function saveConversations(conversationsArray) {
  // �`�����l�����X�g��1��������  
  conversationsArray.forEach(function(conversation){
    // option�^�O�𐶐����A�Z�b�g
    conversationsList.push(createOptionData(conversation));
  });
}

/**
 * createOptionData(conversation)
 * id��name���p�����[�^��option�^�O�𐶐����ԋp����
 */
function createOptionData(conversation) {
  console.log(conversation["id"] + ":" + conversation["name"]);
  return "<option value=\"" + conversation["id"] + "\">" + conversation["name"] + "</option>"
  
}
