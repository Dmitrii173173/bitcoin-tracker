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

# Копируем package.json и package-lock.json
COPY package*.json ./

# Создаем директорию prisma и копируем схему
COPY prisma ./prisma/

# Устанавливаем зависимости и генерируем Prisma Client
RUN npm install
RUN npx prisma generate --schema=./prisma/schema.prisma

# Копируем исходный код
COPY . .

# Запускаем приложение
CMD ["npm", "start"]
