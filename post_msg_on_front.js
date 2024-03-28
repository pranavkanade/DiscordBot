const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });
const front = require('../../helpers/front');

const threadId = context.params.event.channel_id;
const messageId = context.params.event.id;

let thread = await lib.discord.channels['@0.3.2'].retrieve({
  channel_id: `${threadId}` // required
});

const supportChannelId = process.env.SUPPORT_FORM_CHANNEL_ID;
const threadChannelId = thread.parent_id;

if (supportChannelId === threadChannelId) {
  // this means that the message has been created in support forum
  const authorId = context.params.event.author.id;
  // console.log('Message : ', JSON.stringify(context.params.event));
  // console.log('Thread : ', JSON.stringify(thread));
  // console.log('Message Id : ', messageId);
  // console.log('Thread Id : ', threadId);
  // console.log('Channel Id : ', threadChannelId);
  // console.log('Support Channel Id : ', supportChannelId);

  const threadSubject = thread.name;

  try {
    const response = await front.createMessage(messageId, threadId, authorId, threadSubject);
    // console.log('Axios Result : ', JSON.stringify(response.data));
  } catch (error) {
    console.log(error);
  }

}
