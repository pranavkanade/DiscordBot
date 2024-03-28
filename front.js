const axios = require('axios');
const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });
const dbHelper = require('./db.js');

module.exports = {
  createMessage: async (message_id, channel_id, user_id, subject) => {
    console.log('***** CREATE MSG ON FRONT *****');
    let baseMessage = await lib.discord.channels['@0.3.2'].messages.retrieve({
      channel_id,
      message_id
    });
    const attachments = baseMessage.attachments.map(item => `[${item.content_type}] : ${item.url}`)
    const messageBody = baseMessage.content + (attachments.length > 0 ? '\n**ATTACHMENTS**\n' : '') + attachments.join('\n')
    const author = baseMessage.author;
    const data = JSON.stringify({
      sender: { name: author.username + " " + author.discriminator, handle: author.id },
      body_format: 'markdown',
      metadata: { headers: { 'threadId': `${channel_id}` }, thread_ref: `${channel_id}` },
      attachments: [
      ],
      body: messageBody,
      subject: `${subject}`
    });

    const config = {
      method: 'post',
      url: 'https://api2.frontapp.com/channels/cha_9p7t8/incoming_messages',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.FRONT_TOKEN}`
      },
      data: data
    };

    const response = await axios(config);

    const isThread = await dbHelper.getConversationByThread(channel_id);

    if (response.data.status === "accepted" && !isThread) {
      const message_uId = response.data.message_uid;
      const messageData = await dbHelper.registerConversation(channel_id, message_uId, user_id, subject);
    }
    return response;
  },
  sendDiscordMessage: async (threadId, body, attachments) => {
    console.log('***** CREATE MSG ON Discord *****');
    let result = await lib.discord.channels['@0.3.2'].messages.create({
      channel_id: `${threadId}`,
      content: body,
      attachments: attachments
    });
    console.log(`Sent to Discord : `, result);
    return result;
  }
}