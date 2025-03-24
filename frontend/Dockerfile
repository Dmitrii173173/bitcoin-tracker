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

# Собираем приложение
RUN npm run build

# Проверяем, где созданы файлы сборки
RUN echo "==== After build ====" && ls -la && \
    echo "==== Dist folder ====" && ls -la dist || echo "No dist folder" && \
    echo "==== .output folder ====" && ls -la .output || echo "No .output folder"

# Запускаем на отдельном образе
FROM node:18-alpine AS runner

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем переменные окружения
ENV NODE_ENV=production

# Копируем собранное приложение из предыдущего образа
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./

# Устанавливаем только production зависимости
RUN npm install --omit=dev

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["node", ".output/server/index.mjs"]
