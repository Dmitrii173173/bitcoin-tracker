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

# Добавляем подробное логирование после сборки
RUN echo "=== Содержимое директории после сборки ===" && \
    ls -la && \
    echo "=== Проверка .output директории ===" && \
    ls -la .output || echo ".output директория не найдена" && \
    echo "=== Проверка dist директории ===" && \
    ls -la dist || echo "dist директория не найдена" && \
    echo "=== Поиск server файлов ===" && \
    find . -name "server.js" -o -name "index.mjs" -o -name "server.mjs" || echo "Серверные файлы не найдены"

# Финальный этап
FROM node:18-alpine

WORKDIR /app

# Копируем только необходимые файлы из этапа сборки
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data
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
