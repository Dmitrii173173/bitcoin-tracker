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

# Создаем директорию для данных
RUN mkdir -p public/data
COPY data/* public/data/ || true

# Генерируем статический сайт вместо серверного приложения
RUN npm run generate

# Проверяем, где созданы файлы сборки
RUN echo "==== After build ====" && ls -la && \
    echo "==== Dist folder ====" && ls -la dist || echo "No dist folder" && \
    echo "==== .output folder ====" && ls -la .output || echo "No .output folder"

# Используем nginx для раздачи статических файлов
FROM nginx:alpine

# Копируем статические файлы из этапа сборки
COPY --from=builder /app/dist /usr/share/nginx/html

# Создаем конфигурацию nginx для SPA
RUN echo 'server { \
    listen       80; \
    server_name  localhost; \
    location / { \
        root   /usr/share/nginx/html; \
        index  index.html; \
        try_files $uri $uri/ /index.html; \
    } \
    location /api/ { \
        proxy_pass http://backend:3001; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]
