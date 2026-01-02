export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { BOT_TOKEN, CHAT_ID } = process.env;

  return res.status(200).json({
    hasBotToken: !!BOT_TOKEN,
    hasChatId: !!CHAT_ID,
    botTokenLength: BOT_TOKEN ? BOT_TOKEN.length : 0,
    chatId: CHAT_ID,
    botTokenPreview: BOT_TOKEN ? `${BOT_TOKEN.substring(0, 10)}...` : 'не настроен',
    message: !BOT_TOKEN || !CHAT_ID 
      ? 'Переменные окружения не настроены. Добавьте BOT_TOKEN и CHAT_ID в Vercel Settings → Environment Variables'
      : 'Переменные настроены. Если ошибка сохраняется, проверьте правильность значений.'
  });
}

