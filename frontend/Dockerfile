# Используем официальный образ Node.js
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы проекта
COPY . .

# Создаем директорию для данных и копируем данные
RUN mkdir -p public/data
RUN if [ -d "data" ]; then cp -r data/* public/data/ 2>/dev/null || true; fi

# Устанавливаем дополнительные зависимости для сервера
RUN npm install express http-proxy-middleware --save

# Собираем приложение
RUN npm run build

# Создаем простой Express сервер для раздачи статических файлов
RUN echo 'const express = require("express");
const path = require("path");
const fs = require("fs");
const { createProxyMiddleware } = require("http-proxy-middleware");
const app = express();
const PORT = process.env.PORT || 80;

// Настройка прокси для API запросов
app.use("/api", createProxyMiddleware({
  target: process.env.BACKEND_URL || "http://backend:3001",
  changeOrigin: true,
  pathRewrite: { "^/api": "/api" }
}));

// Ищем папку со статическими файлами
const paths = [
  { path: path.join(__dirname, "dist"), exists: false },
  { path: path.join(__dirname, ".output", "public"), exists: false },
  { path: path.join(__dirname, ".output"), exists: false },
  { path: path.join(__dirname, ".nuxt", "dist", "client"), exists: false }
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
  const indexPath = path.join(staticPath.path, "index.html");
  if (fs.existsSync(indexPath)) {
    app.get("*", (req, res) => {
      res.sendFile(indexPath);
    });
  }
} else {
  console.error("ОШИБКА: Не найдены папки со статическими файлами");
  app.get("*", (req, res) => {
    res.status(500).send("Ошибка конфигурации: Не найдены папки со статическими файлами");
  });
}

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});' > server.js

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=80
ENV BACKEND_URL=http://backend:3001

# Открываем порт
EXPOSE 80

# Запускаем сервер
CMD ["node", "server.js"]
