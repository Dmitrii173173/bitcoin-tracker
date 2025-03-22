FROM mcr.microsoft.com/dotnet/runtime-deps:6.0-focal AS builder

# Устанавливаем рабочую директорию
WORKDIR /app/frontend

# Устанавливаем Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@10.2.4

# Копируем только package.json сначала для лучшего кэширования
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Теперь копируем остальные файлы приложения
COPY . .

# Проверяем структуру до сборки
RUN echo "=== Directory structure ===" && \
    ls -la && \
    echo "=== nuxt.config.ts contents ===" && \
    cat nuxt.config.ts

# Устанавливаем переменные окружения для сборки
ENV NODE_ENV=production
ENV NUXT_APP_CDN_URL=https://your-cdn-url.com
ENV NITRO_PRESET=node-server

# Запускаем сборку с отладкой
RUN NODE_ENV=production npm run build --verbose

# Проверяем результат сборки
RUN echo "=== Build output ===" && \
    ls -la .output/server/index.mjs || (echo "=== Build failed, checking .nuxt ===" && ls -la .nuxt)

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
ENV NITRO_PRESET=node-server

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
