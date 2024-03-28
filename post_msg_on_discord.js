const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });
const front = require('../../helpers/front');
const dbHelper = require('../../helpers/db.js');
const { convert } = require('html-to-text');


module.exports = async (context) => {
  const newOutBoundMessage = JSON.parse(context.http.body);
  const conv_link = (newOutBoundMessage["_links"]).related.conversation;
  console.log(`Message : `, newOutBoundMessage?.body);
  if (conv_link) {
    let convId = conv_link.trim().split('/');
    convId = convId[convId.length - 1];
    console.log(`ID: `, convId);
    const threadHistory = await dbHelper.getConversationByConv(convId);
    if (threadHistory) {
      console.log(`In history : `, threadHistory);
      const threadId = threadHistory.threadid;
      // send context first
      if (!!newOutBoundMessage.body) {
        let message = newOutBoundMessage.body;
        message = message.replace(/<a href=".*?" target="_blank" rel="noopener noreferrer">/, '');
        message = message.replace(/<.a>/, '');
        message = convert(message);
        await front.sendDiscordMessage(threadId, message, []);
      }

      const attachments = newOutBoundMessage?.attachments;
      // download attachments
      let downloaded = [];
      for (let key in attachments) {
        const data = await dbHelper.getAttachments(attachments[key].id);
        downloaded.push({
          'file': data,
          'filename': attachments[key].filename,
        })
      }
      if (downloaded.length > 0) {
        await front.sendDiscordMessage(threadId, '', downloaded);
      }
    }
  }
};