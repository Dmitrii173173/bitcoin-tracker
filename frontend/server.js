/*
  Простой Express сервер для деплоя на Railway
*/
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs');

// Создаем Express приложение
const app = express();
const PORT = process.env.PORT || 80;
const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:3001';

// Важно: путь для healthcheck должен быть первым
app.get('/', (req, res) => {
  console.log('Получен запрос к корневому пути /');
  res.status(200).send('Сервис активен');
});

// Логирование для отладки
console.log('=== Переменные окружения ===');
console.log('PORT:', PORT);
console.log('BACKEND_URL:', BACKEND_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('=== Текущая директория ===');
console.log(process.cwd());
console.log('=== Содержимое директории ===');
console.log(fs.readdirSync('.'));

// Настройка прокси для API запросов
app.use('/api', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  pathRewrite: { '^/api': '' }
}));

// Определяем папку для статических файлов
let staticFolder = null;
if (fs.existsSync('.output/public')) {
  staticFolder = '.output/public';
} else if (fs.existsSync('dist')) {
  staticFolder = 'dist';
} else if (fs.existsSync('.nuxt/dist/client')) {
  staticFolder = '.nuxt/dist/client';
}

// Если нашли статические файлы, используем их
if (staticFolder) {
  console.log(`Используем папку для статических файлов: ${staticFolder}`);
  app.use(express.static(staticFolder));
  
  // Для SPA маршрутизации (все пути, кроме /, который обрабатывается выше)
  app.get('/*', (req, res) => {
    if (req.path === '/') return; // уже обработан выше
    
    const indexPath = path.join(staticFolder, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(path.resolve(indexPath));
    } else {
      // Если не нашли index.html, отправляем базовую страницу
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Bitcoin Tracker</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body>
            <h1>Bitcoin Tracker</h1>
            <p>Сервис запущен, но статические файлы не найдены.</p>
          </body>
        </html>
      `);
    }
  });
} else {
  console.log('Не найдены папки со статическими файлами');
  
  // Создаем простой интерфейс, если нет статических файлов
  app.get('/*', (req, res) => {
    if (req.path === '/') return; // уже обработан выше
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bitcoin Tracker</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <h1>Bitcoin Tracker</h1>
          <p>Сервис запущен, но статические файлы не найдены.</p>
        </body>
      </html>
    `);
  });
}

// Запускаем сервер
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущен и слушает http://0.0.0.0:${PORT}`);
});

// Обработка ошибок
server.on('error', (error) => {
  console.error('Ошибка сервера:', error);
});

// Обработка завершения процесса
process.on('SIGTERM', () => {
  console.log('Получен SIGTERM, закрываем приложение...');
  server.close(() => {
    console.log('Сервер остановлен');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Получен SIGINT, закрываем приложение...');
  server.close(() => {
    console.log('Сервер остановлен');
    process.exit(0);
  });
}); 