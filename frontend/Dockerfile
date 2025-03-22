FROM mcr.microsoft.com/dotnet/runtime-deps:6.0-focal AS dependencies

WORKDIR /app
COPY package*.json ./

RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@10.2.4

RUN npm install

COPY . .

RUN npm run build

FROM mcr.microsoft.com/dotnet/runtime-deps:6.0-focal

WORKDIR /app

RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@10.2.4

COPY --from=dependencies /app/.output ./.output
COPY --from=dependencies /app/package*.json ./

ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
