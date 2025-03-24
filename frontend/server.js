const express = require('express');
const path = require('path');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const PORT = process.env.PORT || 80;

// Настройка прокси для API запросов
app.use('/api', createProxyMiddleware({
  target: process.env.BACKEND_URL || 'http://backend:3001',
  changeOrigin: true,
  pathRewrite: { '^/api': '/api' }
}));

// Ищем папку со статическими файлами
const paths = [
  { path: path.join(__dirname, 'dist'), exists: false },
  { path: path.join(__dirname, '.output', 'public'), exists: false },
  { path: path.join(__dirname, '.output'), exists: false },
  { path: path.join(__dirname, '.nuxt', 'dist', 'client'), exists: false }
];

// Проверяем существование каждого пути
paths.forEach(item => {
  item.exists = fs.existsSync(item.path);
  console.log(`Путь ${item.path} существует: ${item.exists}`);
});

// Находим первый существующий путь
const staticPath = paths.find(item => item.exists);

if (staticPath) {
  console.log(`Используем путь для статических файлов: ${staticPath.path}`);
  app.use(express.static(staticPath.path));
  
  // Для SPA - все остальные запросы направляем на index.html, если он существует
  const indexPath = path.join(staticPath.path, 'index.html');
  if (fs.existsSync(indexPath)) {
    app.get('*', (req, res) => {
      res.sendFile(indexPath);
    });
  }
} else {
  console.error('ОШИБКА: Не найдены папки со статическими файлами');
  app.get('*', (req, res) => {
    res.status(500).send('Ошибка конфигурации: Не найдены папки со статическими файлами');
  });
}

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`Фронтенд сервер запущен на порту ${PORT}`);
}); 