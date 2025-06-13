const { Client, middleware } = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new Client(config);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const handler = middleware(config);

  handler(req, res, async () => {
    const events = req.body.events;
    const results = await Promise.all(events.map(handleEvent));
    res.status(200).json(results);
  });
};

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return null;
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: `「${event.message.text}」ですね`,
  });
}
