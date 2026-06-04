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

# Копируем скомпилированный бэкенд из builder
COPY --from=builder /app/dist ./dist

# !!! САМОЕ ВАЖНОЕ: Копируем фронтенд из src/webapp прямо в корень /app/webapp
COPY src/webapp ./webapp

# Указываем переменную окружения для запуска
ENV NODE_ENV=production
EXPOSE 3000

# Запуск скомпилированного сервера
CMD ["node", "dist/api/server.js"]