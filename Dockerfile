# Используем образ от Microsoft
FROM mcr.microsoft.com/dotnet/runtime-deps:6.0-focal

# Устанавливаем Node.js
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем рабочую директорию
WORKDIR /app

# Проверяем содержимое текущей директории
RUN ls -la

# Копируем package.json и package-lock.json
# COPY ./backend/package*.json ./
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь код проекта
COPY ./backend .
RUN npm run build

# Устанавливаем переменные окружения
ENV NODE_ENV=production

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["node", ".output/server/index.mjs"]