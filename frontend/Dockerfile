# Этап сборки
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Создаем директорию для данных
RUN mkdir -p data

# Безопасно копируем существующие данные, если они есть
RUN if [ -d "data" ]; then cp -r data/* /app/data/ || true; fi

# Добавляем подробное логирование перед сборкой
RUN echo "=== Содержимое директории перед сборкой ===" && \
    ls -la && \
    echo "=== Содержимое package.json ===" && \
    cat package.json

# Собираем приложение
RUN npm run build

# Создаем резервный server.js
RUN echo 'const express = require("express"); \
const { createProxyMiddleware } = require("http-proxy-middleware"); \
const path = require("path"); \
const fs = require("fs"); \
const app = express(); \
const port = process.env.PORT || 80; \
const backendUrl = process.env.BACKEND_URL || "http://backend:3001"; \
\
console.log("=== Текущая директория ==="); \
console.log(process.cwd()); \
console.log("=== Содержимое директории ==="); \
console.log(fs.readdirSync(".")); \
\
// Проверяем наличие .output/server/index.mjs \
const outputPath = path.join(".output", "server", "index.mjs"); \
if (fs.existsSync(outputPath)) { \
  console.log("Найден .output/server/index.mjs, запускаем его..."); \
  require("child_process").spawn("node", [outputPath], { stdio: "inherit" }); \
} else { \
  console.log("Создаем Express сервер..."); \
  \
  // Настраиваем прокси для API \
  app.use("/api", createProxyMiddleware({ \
    target: backendUrl, \
    changeOrigin: true, \
    pathRewrite: { "^/api": "" } \
  })); \
  \
  // Проверяем различные пути для статических файлов \
  const staticPaths = [".output/public", "dist", ".output"]; \
  let staticPath = null; \
  \
  for (const path of staticPaths) { \
    if (fs.existsSync(path)) { \
      staticPath = path; \
      console.log(`Используем статические файлы из ${path}`); \
      break; \
    } \
  } \
  \
  if (staticPath) { \
    app.use(express.static(staticPath)); \
  } else { \
    console.log("Статические файлы не найдены"); \
  } \
  \
  // Обработка SPA маршрутизации \
  app.get("*", (req, res) => { \
    const indexPath = path.join(staticPath || ".", "index.html"); \
    if (fs.existsSync(indexPath)) { \
      res.sendFile(indexPath); \
    } else { \
      res.status(404).send("Not Found"); \
    } \
  }); \
  \
  app.listen(port, () => { \
    console.log(`Сервер запущен на порту ${port}`); \
  }); \
}' > server.js

# Добавляем подробное логирование после сборки
RUN echo "=== Содержимое директории после сборки ===" && \
    ls -la && \
    echo "=== Проверка .output директории ===" && \
    ls -la .output || echo ".output директория не найдена" && \
    echo "=== Проверка dist директории ===" && \
    ls -la dist || echo "dist директория не найдена" && \
    echo "=== Проверка server.js ===" && \
    cat server.js

# Финальный этап
FROM node:18-alpine

WORKDIR /app

# Копируем только необходимые файлы из этапа сборки
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.output ./.output || true
COPY --from=builder /app/dist ./dist || true
COPY --from=builder /app/data ./data || true
COPY --from=builder /app/server.js ./

# Устанавливаем только production зависимости
RUN npm ci --only=production

# Добавляем express и http-proxy-middleware для резервного сервера
RUN npm install express http-proxy-middleware

# Проверяем наличие файлов перед запуском
RUN echo "=== Проверка файлов перед запуском ===" && \
    ls -la && \
    echo "=== Проверка server.js ===" && \
    cat server.js

# Запускаем резервный server.js, который проверит наличие .output/server/index.mjs
CMD ["node", "server.js"]
