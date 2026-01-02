export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

  return res.status(200).json({
    hasBotToken: !!TELEGRAM_BOT_TOKEN,
    hasChatId: !!TELEGRAM_CHAT_ID,
    botTokenLength: TELEGRAM_BOT_TOKEN ? TELEGRAM_BOT_TOKEN.length : 0,
    chatId: TELEGRAM_CHAT_ID,
    chatIdType: typeof TELEGRAM_CHAT_ID,
    chatIdParsed: TELEGRAM_CHAT_ID ? parseInt(TELEGRAM_CHAT_ID, 10) : null,
    botTokenPreview: TELEGRAM_BOT_TOKEN ? `${TELEGRAM_BOT_TOKEN.substring(0, 10)}...` : 'не настроен',
    message: !TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID 
      ? 'Переменные окружения не настроены. Добавьте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в Vercel Settings → Environment Variables'
      : 'Переменные настроены.'
  });
}

