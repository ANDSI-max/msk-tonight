FROM node:20-alpine AS builder

WORKDIR /app

# Устанавливаем ВСЕ зависимости
COPY package*.json ./
RUN npm install

# Копируем весь код
COPY . .

# Собираем: tsc + copy:webapp (webapp → dist/webapp)
RUN npm run build

# === Финальный образ ===
FROM node:20-alpine

WORKDIR /app

# Production зависимости
COPY package*.json ./
RUN npm install --production

# Копируем ВСЁ из dist (включая dist/webapp)
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/api/server.js"]