FROM node:18.19-alpine AS dependencies

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:18.19-alpine

WORKDIR /app
COPY --from=dependencies /app/.output ./.output
COPY --from=dependencies /app/package*.json ./

ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
