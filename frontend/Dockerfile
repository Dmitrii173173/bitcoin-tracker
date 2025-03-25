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

# Устанавливаем express и http-proxy-middleware для резервного сервера
RUN npm install express http-proxy-middleware

# Копируем весь исходный код
COPY . .

# Создаем полноценный server.js если его нет
COPY server.js ./server.js

# Устанавливаем переменные окружения
ENV PORT=80
ENV NODE_ENV=production 
ENV BACKEND_URL=http://backend:3001

# Открываем порт
EXPOSE 80

# Добавляем проверку работоспособности с увеличенными таймаутами
HEALTHCHECK --interval=5s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:$PORT/ || exit 1

# Запускаем приложение напрямую через server.js
CMD ["node", "server.js"]
