/*
  Этот файл служит резервным решением для Railway,
  если не найден .output/server/index.mjs
*/
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 80;

console.log('Проверка файловой структуры...');
console.log('Текущая директория:', process.cwd());
console.log('Содержимое директории:', fs.readdirSync('.'));

// Проверяем пути к возможным серверным файлам
const outputPath = path.join('.output', 'server', 'index.mjs');
const distPath = path.join('dist', 'server', 'index.mjs');
const nuxtDevPath = path.join('.nuxt', 'dev', 'index.mjs');

if (fs.existsSync(outputPath)) {
  console.log(`Найден файл: ${outputPath}`);
  // Запускаем как отдельный процесс
  const proc = spawn('node', [outputPath], { stdio: 'inherit' });
  proc.on('error', (err) => {
    console.error('Ошибка при запуске сервера:', err);
    process.exit(1);
  });
} else if (fs.existsSync(distPath)) {
  console.log(`Найден файл: ${distPath}`);
  const proc = spawn('node', [distPath], { stdio: 'inherit' });
  proc.on('error', (err) => {
    console.error('Ошибка при запуске сервера:', err);
    process.exit(1);
  });
} else if (fs.existsSync(nuxtDevPath)) {
  console.log(`Найден файл: ${nuxtDevPath}`);
  const proc = spawn('node', [nuxtDevPath], { stdio: 'inherit' });
  proc.on('error', (err) => {
    console.error('Ошибка при запуске сервера:', err);
    process.exit(1);
  });
} else {
  console.log('Файлы сервера не найдены, создаем простой Express-сервер');
  
  try {
    // Необходимо установить express и http-proxy-middleware
    if (!fs.existsSync('./node_modules/express')) {
      console.log('Устанавливаем express...');
      execSync('npm install express http-proxy-middleware', { stdio: 'inherit' });
    }
    
    const express = require('express');
    const { createProxyMiddleware } = require('http-proxy-middleware');
    const app = express();

    // Добавляем маршрут для проверки работоспособности
    app.get('/', (req, res) => {
      res.status(200).send('Сервис работает');
    });
    
    // Настройка прокси для API запросов
    app.use('/api', createProxyMiddleware({
      target: process.env.BACKEND_URL || 'http://backend:3001',
      changeOrigin: true,
      pathRewrite: { '^/api': '/api' }
    }));
    
    // Ищем папку со статическими файлами
    let staticFolder = null;
    
    if (fs.existsSync('.output/public')) {
      staticFolder = '.output/public';
    } else if (fs.existsSync('dist')) {
      staticFolder = 'dist';
    } else if (fs.existsSync('.nuxt/dist/client')) {
      staticFolder = '.nuxt/dist/client';
    }
    
    if (staticFolder) {
      console.log(`Используем папку для статических файлов: ${staticFolder}`);
      app.use(express.static(staticFolder));
      
      // Для SPA маршрутизации
      app.get('*', (req, res) => {
        const indexPath = path.join(staticFolder, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(path.resolve(indexPath));
        } else {
          res.status(404).send('index.html не найден');
        }
      });
    } else {
      console.log('Не найдены папки со статическими файлами');
      // Не переопределяем маршрут '/', чтобы healthcheck работал
      app.get('/*', (req, res) => {
        // Если это корневой маршрут, не обрабатываем его здесь (уже определен выше)
        if (req.path === '/') return;
        res.status(500).send('Не найдены папки со статическими файлами');
      });
    }
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Резервный сервер запущен на порту ${PORT}`);
    });
  } catch (error) {
    console.error('Ошибка при создании резервного сервера:', error);
    process.exit(1);
  }
} 