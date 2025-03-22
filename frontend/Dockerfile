FROM mcr.microsoft.com/dotnet/runtime-deps:6.0-focal AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Сначала копируем package.json файлы
COPY package.json ./
COPY frontend/package.json ./frontend/
COPY frontend/package-lock.json ./frontend/

# Затем копируем остальные файлы frontend
COPY frontend ./frontend

# Устанавливаем Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@10.2.4

# Проверяем наличие package.json
RUN ls -la frontend/package.json || exit 1

# Запускаем сборку
RUN npm run build

# Проверяем создание .output
RUN ls -la frontend/.output/server/index.mjs || exit 1

# Финальный этап
FROM mcr.microsoft.com/dotnet/runtime-deps:6.0-focal

WORKDIR /app

# Устанавливаем Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@10.2.4

# Копируем только необходимые файлы
COPY --from=builder /app/frontend/.output ./.output
COPY --from=builder /app/frontend/package.json ./package.json

ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

# Проверяем наличие файлов
RUN ls -la .output/server/index.mjs || exit 1

CMD ["node", ".output/server/index.mjs"]
