export default async function handler(req, res) {
  // Allow both GET and POST for easy testing
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return res.status(500).json({ 
      error: 'Credentials not configured',
      hasBotToken: !!botToken,
      hasChatId: !!chatId
    });
  }

  try {
    // Простое тестовое сообщение
    const testMessage = '🧪 Тестовое сообщение от KORTÉGE';
    
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const requestBody = {
      chat_id: chatId,
      text: testMessage,
    };

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    return res.status(200).json({
      success: data.ok || false,
      chatId: chatId,
      chatIdType: typeof chatId,
      botTokenPreview: botToken ? `${botToken.substring(0, 10)}...` : 'не настроен',
      telegramResponse: data,
      error: data.ok ? null : data.description,
      errorCode: data.error_code
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      chatId: chatId,
      chatIdType: typeof chatId
    });
  }
}

