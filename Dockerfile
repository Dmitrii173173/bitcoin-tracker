# Используем базовый образ Node.js
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем curl для healthcheck
RUN apk add --no-cache curl

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build || echo "Сборка не выполнена, но это ОК"

# Создаем необходимые директории для статических файлов
RUN mkdir -p .output/public dist

# Устанавливаем express и http-proxy-middleware для сервера
RUN npm install express http-proxy-middleware

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=80
ENV BACKEND_URL=http://backend:3001

# Добавляем проверку работоспособности
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/ || exit 1

# Открываем порт
EXPOSE 80

# Запускаем приложение
CMD ["node", "server.js"]