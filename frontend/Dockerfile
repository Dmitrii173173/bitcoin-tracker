# Используем официальный образ Node.js
FROM node:18-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Устанавливаем типы для Node.js
RUN npm install --save-dev @types/node

# Копируем остальные файлы проекта
COPY . .

# Выводим информацию о структуре проекта перед сборкой
RUN echo "==== Before build ====" && ls -la

# Создаем директорию для данных
RUN mkdir -p public/data
COPY data/* public/data/ || true

# Генерируем статический сайт
RUN npm run generate

# Проверяем, где созданы файлы сборки
RUN echo "==== After build ====" && ls -la && \
    echo "==== Dist folder ====" && ls -la dist || echo "No dist folder" && \
    echo "==== .output folder ====" && ls -la .output || echo "No .output folder"

# Создаем простой Express сервер для раздачи статических файлов
RUN echo 'const express = require("express"); \
const path = require("path"); \
const { createProxyMiddleware } = require("http-proxy-middleware"); \
const app = express(); \
const PORT = process.env.PORT || 80; \
\
// Настройка прокси для API запросов \
app.use("/api", createProxyMiddleware({ \
  target: process.env.BACKEND_URL || "http://backend:3001", \
  changeOrigin: true, \
  pathRewrite: { "^/api": "/api" } \
})); \
\
// Раздаем статические файлы \
app.use(express.static(path.join(__dirname, "dist"))); \
\
// Для SPA - все остальные запросы направляем на index.html \
app.get("*", (req, res) => { \
  res.sendFile(path.join(__dirname, "dist", "index.html")); \
}); \
\
// Запускаем сервер \
app.listen(PORT, () => { \
  console.log(`Frontend server running on port ${PORT}`); \
});' > server.js

# Устанавливаем дополнительные зависимости для сервера
RUN npm install express http-proxy-middleware --save

# Запускаем на том же образе
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=80
ENV BACKEND_URL=http://backend:3001

# Копируем статические файлы из builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/package.json ./package.json

# Устанавливаем только production зависимости
RUN npm install --omit=dev
RUN npm install express http-proxy-middleware --save

# Открываем порт
EXPOSE 80

# Запускаем сервер
CMD ["node", "server.js"]
