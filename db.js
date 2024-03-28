const axios = require('axios');
const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });

module.exports = {
  getAttachments: async (id) => {
    console.log('Downloading attachments : ', id);
    const config = {
      method: 'get',
      url: `https://api2.frontapp.com/download/${id}`,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.FRONT_TOKEN}`
      },
      responseType: 'arraybuffer'
    };

    let response = await axios(config);

    response = Buffer.from(response.data, 'binary');
    console.log('downloaded file : ', response);
    return response;
  },
  registerConversation: async (thread_id, message_uId, user_id, title) => {
    console.log('Registering thread : ', thread_id, message_uId, user_id, title);
    const config = {
      method: 'get',
      url: `https://api2.frontapp.com/messages/alt:uid:${message_uId}`,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.FRONT_TOKEN}`
      }
    };

    const response = await axios(config);
    const conv_link = response.data["_links"].related.conversation;
    if (conv_link) {
      let convId = conv_link.trim().split('/');
      convId = convId[convId.length - 1];
      const newConv = await lib.postgres.db['@0.0.5'].query({
        query: `INSERT INTO frontdiscord (conversationid, threadid, userid, title) VALUES ('${convId}', ${thread_id}, '${user_id}', '${title}');`
      });
      console.log('Registered new thread : ', newConv);
    } else {
      console.error(`Could not find conv_link`, conv_link);
    }
    return response;
  },
  getConversationByThread: async (threadId) => {
    let result = await lib.postgres.db['@0.0.5'].query({
      query: `SELECT * FROM frontdiscord WHERE threadid = '${threadId}';`
    });
    console.log('Conv By ThreadID : ', result?.rows);
    return result?.rows?.length > 0 ? result.rows[0] : null;
  },
  getConversationByConv: async (convId) => {
    let result = await lib.postgres.db['@0.0.5'].query({
      query: `SELECT * FROM frontdiscord WHERE conversationid = '${convId}';`
    });
    console.log('Conv By ConvID : ', result?.rows);
    return result?.rows?.length > 0 ? result.rows[0] : null;
  }
}