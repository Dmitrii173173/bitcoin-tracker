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
RUN npm run build

# Этап production
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем только необходимые файлы из этапа сборки
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.js ./
COPY --from=builder /app/.output ./.output

# Устанавливаем только production зависимости
RUN npm install --production

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=3000
ENV BACKEND_URL=http://backend:3001

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["node", "server.js"]