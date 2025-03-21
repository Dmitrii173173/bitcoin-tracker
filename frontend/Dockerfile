# Устанавливаем базовый образ для .NET
FROM mcr.microsoft.com/dotnet/runtime-deps:6.0-focal

# Устанавливаем Node.js
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем рабочую директорию в /usr/src/app или другую подходящую директорию
WORKDIR /app
# Проверяем содержимое текущей директории (для диагностики)
RUN ls -la

# Копируем только package.json и package-lock.json для установки зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы в рабочую директорию
COPY . .

# Собираем приложение
RUN npm run build

# Устанавливаем переменные окружения
ENV NODE_ENV=production

# Открываем порт для приложения
EXPOSE 3000

# Запускаем приложение
CMD ["node", ".output/server/index.mjs"]
