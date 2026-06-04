# 1. Сборка приложения
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 2. Финальный образ
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production

# Копируем скомпилированный бэкенд
COPY --from=builder /app/dist ./dist

# Копируем фронтенд (webapp в корне)
COPY webapp ./webapp

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/api/server.js"]