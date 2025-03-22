FROM mcr.microsoft.com/dotnet/runtime-deps:6.0-focal AS builder

# Устанавливаем рабочую директорию
WORKDIR /app/frontend

# Устанавливаем Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@10.2.4

# Копируем package.json и package-lock.json
COPY frontend/package*.json ./
RUN npm install

# Копируем данные
RUN mkdir -p data
COPY data/bitcoin_data.json ./data/

# Копируем все файлы frontend
COPY frontend/ ./

# Проверяем структуру проекта
RUN echo "=== Project structure ===" && \
    ls -la && \
    echo "=== Data file ===" && \
    ls -la data/ && \
    echo "=== Components directory ===" && \
    ls -la components/

# Устанавливаем переменные окружения для сборки
ENV NODE_ENV=production
ENV NITRO_PRESET=node-server

# Запускаем сборку
RUN npm run build

# Финальный этап
FROM mcr.microsoft.com/dotnet/runtime-deps:6.0-focal

WORKDIR /app

# Устанавливаем Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@10.2.4

# Копируем собранное приложение и данные
COPY --from=builder /app/frontend/.output ./.output
COPY --from=builder /app/frontend/package.json ./package.json
COPY --from=builder /app/frontend/data ./data

ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
