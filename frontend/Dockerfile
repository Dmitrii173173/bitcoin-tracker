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

# Детальное логирование процесса сборки
RUN echo "=== Содержимое директории перед сборкой ===" && ls -la && \
    echo "=== Проверяем файл package.json ===" && cat package.json

# Собираем приложение с помощью Nuxt
RUN npm run build

# Очень подробная диагностика после сборки
RUN echo "=== Содержимое корневой директории после сборки ===" && ls -la && \
    echo "=== Содержимое папки .nuxt ===" && ls -la .nuxt || echo "Папка .nuxt не найдена" && \
    echo "=== Содержимое папки .output ===" && ls -la .output || echo "Папка .output не найдена" && \
    find . -type d -name "server" | xargs ls -la || echo "Не найдены папки server"

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=80
ENV BACKEND_URL=http://backend:3001
ENV HOST=0.0.0.0

# Открываем порт
EXPOSE 80

# Запускаем резервный server.js, который проверит наличие .output/server/index.mjs
CMD ["node", "server.js"]
