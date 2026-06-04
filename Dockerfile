FROM node:20-alpine AS builder

WORKDIR /app

# Устанавливаем ВСЕ зависимости (включая dev для сборки)
COPY package*.json ./
RUN npm install

# Копируем весь код
COPY . .

# Собираем: tsc + copy webapp в dist/webapp
RUN npm run build

# === Финальный образ ===
FROM node:20-alpine

WORKDIR /app

# Production зависимости
COPY package*.json ./
RUN npm install --production

# Копируем скомпилированный бэкенд
COPY --from=builder /app/dist ./dist

# Копируем webapp (для production)
COPY --from=builder /app/webapp ./webapp

EXPOSE 3000

CMD ["node", "dist/api/server.js"]