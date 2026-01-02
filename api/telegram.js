export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('Telegram credentials not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const { name, phone, date, fromTo, car } = req.body;

    // Форматирование даты
    let formattedDate = 'Не указана';
    if (date) {
      try {
        const dateObj = new Date(date);
        formattedDate = dateObj.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch (e) {
        formattedDate = date;
      }
    }

    // Экранирование HTML для безопасности
    const escapeHtml = (text) => {
      if (!text) return '';
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    // Форматирование времени заявки
    const requestTime = new Date().toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const message = `<b>🚗 НОВАЯ ЗАЯВКА KORTÉGE</b>

━━━━━━━━━━━━━━━━━━━━

👤 <b>Клиент:</b>
${escapeHtml(name)}

📱 <b>Контакт:</b>
${escapeHtml(phone)}

📅 <b>Дата выезда:</b>
${formattedDate}

🚙 <b>Автомобиль:</b>
${car ? escapeHtml(car) : 'Не указано'}

📍 <b>Маршрут:</b>
${fromTo ? escapeHtml(fromTo) : 'Не указан'}

━━━━━━━━━━━━━━━━━━━━

⏰ <b>Время заявки:</b>
<i>${requestTime}</i>`;

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const requestBody = {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    };

    console.log('Sending to Telegram:', { chatId, botTokenPrefix: botToken?.substring(0, 10) + '...' });
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error('Telegram API error:', data);
      let errorMessage = 'Failed to send message to Telegram';
      
      if (data.description) {
        errorMessage = data.description;
      } else if (data.error_code === 400) {
        errorMessage = 'Неверный запрос. Проверьте настройки бота.';
      } else if (data.error_code === 401) {
        errorMessage = 'Неверный токен бота. Проверьте BOT_TOKEN.';
      } else if (data.error_code === 403) {
        errorMessage = 'Бот заблокирован пользователем. Проверьте CHAT_ID.';
      } else if (data.error_code === 400 && data.description?.includes('chat not found')) {
        errorMessage = 'Чат не найден. Проверьте CHAT_ID и убедитесь, что вы писали боту.';
      }
      
      return res.status(500).json({ 
        error: errorMessage, 
        details: data,
        code: data.error_code 
      });
    }

    return res.status(200).json({ success: true, message: 'Заявка отправлена' });
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

