export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return res.status(500).json({ error: 'Telegram credentials not configured' });
  }

  // CHAT_ID должен быть числом
  const chatId = parseInt(TELEGRAM_CHAT_ID, 10);
  if (isNaN(chatId)) {
    return res.status(500).json({ error: 'Invalid CHAT_ID format. Must be a number.' });
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

      const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
    });

    const data = await response.json();

    if (!response.ok) {
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

