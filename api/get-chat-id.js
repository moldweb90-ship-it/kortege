export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { TELEGRAM_BOT_TOKEN } = process.env;

  if (!TELEGRAM_BOT_TOKEN) {
    return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN not configured' });
  }

  try {
      const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`;
    
    const response = await fetch(telegramUrl);
    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ 
        error: 'Failed to fetch updates', 
        details: data 
      });
    }

    if (!data.ok || !data.result || data.result.length === 0) {
      return res.status(200).json({ 
        message: 'Напиши боту любое сообщение (например /start), потом обнови эту страницу',
        chat_id: null,
        updates: []
      });
    }

    // Получаем последний update с chat_id
    const lastUpdate = data.result[data.result.length - 1];
    const chatId = lastUpdate?.message?.chat?.id || lastUpdate?.edited_message?.chat?.id;

    return res.status(200).json({ 
      chat_id: chatId,
      message: chatId ? `Твой CHAT_ID: ${chatId}` : 'CHAT_ID не найден. Напиши боту сообщение.',
      all_updates: data.result.map(update => ({
        chat_id: update?.message?.chat?.id || update?.edited_message?.chat?.id,
        username: update?.message?.chat?.username,
        first_name: update?.message?.chat?.first_name,
        text: update?.message?.text || update?.edited_message?.text
      }))
    });
  } catch (error) {
    console.error('Error fetching chat ID:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

