# Используем базовый образ Node.js
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем зависимости
RUN npm install

# Генерируем Prisma Client
RUN npx prisma generate

# Копируем исходный код
COPY . .

# Устанавливаем переменные окружения
ENV NODE_ENV=production

# Запускаем приложение
CMD ["node", "index.js"]
