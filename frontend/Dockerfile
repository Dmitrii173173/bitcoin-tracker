FROM mcr.microsoft.com/dotnet/runtime-deps:6.0-focal AS builder

# Устанавливаем рабочую директорию
WORKDIR /app/frontend

# Устанавливаем Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@10.2.4

# Копируем файлы из frontend директории
COPY frontend/package*.json ./
RUN npm install

# Копируем остальные файлы frontend
COPY frontend/ ./

# Проверяем структуру проекта
RUN echo "=== Project structure ===" && \
    ls -la && \
    echo "=== Components directory ===" && \
    ls -la components/ && \
    echo "=== Pages directory ===" && \
    ls -la pages/

# Проверяем содержимое ключевых файлов
RUN echo "=== app.vue ===" && \
    cat app.vue && \
    echo "=== pages/index.vue ===" && \
    cat pages/index.vue

# Устанавливаем переменные окружения для сборки
ENV NODE_ENV=production
ENV NITRO_PRESET=node-server

# Очищаем кэш npm и node_modules перед сборкой
RUN npm cache clean --force && \
    rm -rf node_modules && \
    npm install

# Запускаем сборку с подробным выводом
RUN npm run build --verbose

# Проверяем результат сборки
RUN echo "=== Directory after build ===" && \
    ls -la && \
    echo "=== .output directory ===" && \
    ls -la .output/ || echo "No .output directory!"

# Финальный этап
FROM mcr.microsoft.com/dotnet/runtime-deps:6.0-focal

WORKDIR /app

# Устанавливаем Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@10.2.4

# Копируем собранное приложение
COPY --from=builder /app/frontend/.output ./.output
COPY --from=builder /app/frontend/package.json ./package.json

ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
