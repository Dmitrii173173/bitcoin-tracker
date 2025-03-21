# Используем Microsoft Container Registry вместо Docker Hub
FROM mcr.microsoft.com/dotnet/runtime-deps:6.0-focal

# Устанавливаем Node.js
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копируем все файлы проекта
COPY . .

# Устанавливаем зависимости
RUN npm install

# Генерируем Prisma Client
RUN npx prisma generate

# Запускаем приложение
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm start"]
