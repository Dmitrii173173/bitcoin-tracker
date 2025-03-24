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

# Собираем приложение
RUN npm run build

# Запускаем на отдельном образе
FROM node:18-alpine AS runner

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем переменные окружения
ENV NODE_ENV=production

# Копируем собранное приложение из предыдущего образа
COPY --from=builder /app/.output ./

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["node", "server/index.mjs"]
