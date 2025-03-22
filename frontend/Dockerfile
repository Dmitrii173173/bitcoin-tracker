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

# Проверяем содержимое package.json
RUN echo "=== Package.json contents ===" && cat package.json

# Устанавливаем зависимости
RUN npm install

# Проверяем установленные модули
RUN echo "=== Node modules ===" && \
    ls -la node_modules/.bin/nuxt || echo "Nuxt binary not found!"

# Теперь копируем остальные файлы приложения
COPY . .

# Проверяем структуру до сборки
RUN echo "=== Directory structure ===" && \
    ls -la && \
    echo "=== nuxt.config.ts contents ===" && \
    cat nuxt.config.ts

# Устанавливаем переменные окружения для сборки
ENV NODE_ENV=production
ENV NITRO_PRESET=node-server

# Запускаем сборку с отладкой
RUN npx nuxt build --verbose

# Проверяем результат сборки
RUN echo "=== Current directory ===" && \
    pwd && \
    echo "=== Directory contents ===" && \
    ls -la && \
    echo "=== Build output ===" && \
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

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
