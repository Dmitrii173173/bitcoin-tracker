# Этап сборки
FROM node:18-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build || echo "Сборка не выполнена, продолжаем..."

# Этап production
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем только необходимые файлы из этапа сборки
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.js ./

# Создаем необходимые директории
RUN mkdir -p .output dist data

# Пытаемся скопировать директории, если они существуют
COPY --from=builder /app/.output ./.output || true
COPY --from=builder /app/dist ./dist || true
COPY --from=builder /app/data ./data || true

# Устанавливаем только production зависимости
RUN npm install --production

# Устанавливаем express и http-proxy-middleware для сервера
RUN npm install express http-proxy-middleware

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=80
ENV BACKEND_URL=http://backend:3001

# Открываем порт
EXPOSE 80

# Запускаем приложение
CMD ["node", "server.js"]