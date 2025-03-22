FROM mcr.microsoft.com/dotnet/runtime-deps:6.0-focal AS builder

# Устанавливаем рабочую директорию
WORKDIR /app/frontend

# Устанавливаем Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@10.2.4

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все файлы приложения
COPY . .

# Проверяем структуру проекта
RUN echo "=== Project structure ===" && \
    ls -la && \
    echo "=== Pages directory ===" && \
    ls -la pages || echo "No pages directory!" && \
    echo "=== Components directory ===" && \
    ls -la components || echo "No components directory!" && \
    echo "=== App.vue ===" && \
    cat app.vue || echo "No app.vue found!"

# Устанавливаем переменные окружения для сборки
ENV NODE_ENV=production
ENV NITRO_PRESET=node-server

# Запускаем сборку
RUN npm run build

# Проверяем результат сборки
RUN echo "=== Build output ===" && \
    ls -la .output/server/index.mjs || echo "Build failed!"

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
