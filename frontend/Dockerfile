# Используем официальный образ Node.js
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install
RUN npm install express http-proxy-middleware --save

# Копируем остальные файлы проекта
COPY . .

# Создаем директорию для данных
RUN mkdir -p public/data
# Копируем данные, если они существуют
RUN if [ -d "data" ] && [ "$(ls -A data 2>/dev/null)" ]; then cp -r data/* public/data/; fi

# Собираем приложение
RUN npm run build

# Создаем простой сервер для раздачи статических файлов
COPY server.js ./server.js 

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=80
ENV BACKEND_URL=http://backend:3001

# Открываем порт
EXPOSE 80

# Запускаем сервер
CMD ["node", "server.js"]
