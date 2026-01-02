import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createServer() {
  const app = express();
  
  // API endpoint для Telegram
  app.post('/api/telegram', async (req, res) => {
    try {
      const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

      if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        return res.status(500).json({ error: 'Telegram credentials not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env file' });
      }

      // CHAT_ID должен быть числом
      const chatId = parseInt(TELEGRAM_CHAT_ID, 10);
      if (isNaN(chatId)) {
        return res.status(500).json({ error: 'Invalid TELEGRAM_CHAT_ID format. Must be a number.' });
      }

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

      // Экранирование HTML
      const escapeHtml = (text) => {
        if (!text) return '';
        return String(text)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      };

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
  });

  // Test config endpoint
  app.get('/api/test-config', (req, res) => {
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
    return res.status(200).json({
      hasBotToken: !!TELEGRAM_BOT_TOKEN,
      hasChatId: !!TELEGRAM_CHAT_ID,
      botTokenLength: TELEGRAM_BOT_TOKEN ? TELEGRAM_BOT_TOKEN.length : 0,
      chatId: TELEGRAM_CHAT_ID,
      chatIdParsed: TELEGRAM_CHAT_ID ? parseInt(TELEGRAM_CHAT_ID, 10) : null,
      botTokenPreview: TELEGRAM_BOT_TOKEN ? `${TELEGRAM_BOT_TOKEN.substring(0, 10)}...` : 'не настроен',
      message: !TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID 
        ? 'Переменные окружения не настроены. Создайте .env файл с TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID'
        : 'Переменные настроены.'
    });
  });

  // Get chat ID endpoint
  app.get('/api/get-chat-id', async (req, res) => {
    const { TELEGRAM_BOT_TOKEN } = process.env;
    if (!TELEGRAM_BOT_TOKEN) {
      return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN not configured' });
    }
    
    try {
      const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`;
      const response = await fetch(telegramUrl);
      const data = await response.json();

      if (!response.ok) {
        return res.status(500).json({ error: 'Failed to fetch updates', details: data });
      }

      if (!data.ok || !data.result || data.result.length === 0) {
        return res.status(200).json({ 
          message: 'Напиши боту любое сообщение (например /start), потом обнови эту страницу',
          chat_id: null,
          updates: []
        });
      }

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
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  });

  // Создаем Vite сервер для разработки
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  app.use(vite.middlewares);

  app.listen(5000, () => {
    console.log('🚀 Dev server running on http://localhost:5000');
    console.log('📝 Make sure to create .env file with BOT_TOKEN and CHAT_ID');
    console.log('💡 Load environment variables: npm install dotenv');
  });
}

createServer();

