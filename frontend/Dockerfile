# Используем официальный образ Node.js
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы проекта
COPY . .

# Создаем директорию для данных, если ее нет
RUN mkdir -p public/data

# Безопасно копируем данные, если они существуют
RUN if [ -d "data" ] && [ "$(ls -A data 2>/dev/null)" ]; then \
      cp -r data/* public/data/; \
    fi

# Собираем приложение с Nuxt
RUN npm run build

# Отображаем структуру файлов после сборки
RUN echo "==== После сборки ====" && \
    ls -la && \
    echo "==== Содержимое папки .output ====" && \
    ls -la .output || echo "Папка .output не найдена" && \
    echo "==== Содержимое папки .output/server ====" && \
    ls -la .output/server || echo "Папка .output/server не найдена"

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=80
ENV BACKEND_URL=http://backend:3001

# Открываем порт
EXPOSE 80

# Запускаем сервер Nuxt
CMD ["node", ".output/server/index.mjs"]
