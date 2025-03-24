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

# Генерируем статические файлы (хорошо работает в SSR=false)
RUN npm run generate

# Проверяем, где созданы файлы сборки
RUN echo "==== After generate ====" && ls -la && \
    echo "==== Dist folder ====" && ls -la dist || echo "No dist folder" && \
    echo "==== .output folder ====" && ls -la .output || echo "No .output folder"

# Запускаем на отдельном образе - используем nginx для раздачи статических файлов
FROM nginx:alpine AS runner

# Копируем статические файлы из предыдущего образа
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем nginx конфигурацию для работы с SPA
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]
