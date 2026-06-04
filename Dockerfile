FROM node:20-alpine AS builder

WORKDIR /app

# Копируем и устанавливаем ВСЕ зависимости (включая dev для сборки)
COPY package*.json ./
RUN npm install

# Копируем весь код
COPY . .

# Собираем (tsc + copy:webapp)
RUN npm run build

# === Финальный образ ===
FROM node:20-alpine

WORKDIR /app

# Копируем только production зависимости
COPY package*.json ./
RUN npm install --production

# Копируем собранное из builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/api/server.js"]