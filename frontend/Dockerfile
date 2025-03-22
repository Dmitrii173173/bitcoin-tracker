# Первый этап - для установки зависимостей
FROM mcr.microsoft.com/dotnet/runtime-deps:6.0-focal AS dependencies

WORKDIR /app
COPY package*.json ./

# Устанавливаем Node.js и конкретную версию npm
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@10.2.4

# Используем npm install вместо npm ci
RUN npm install

# Второй этап - для сборки
FROM mcr.microsoft.com/dotnet/runtime-deps:6.0-focal AS builder

WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Устанавливаем Node.js и ту же версию npm
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@10.2.4

RUN npm run build

# Финальный этап
FROM mcr.microsoft.com/dotnet/runtime-deps:6.0-focal

WORKDIR /app

# Устанавливаем Node.js и ту же версию npm
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@10.2.4

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package*.json ./

ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
