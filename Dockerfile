FROM node:20-alpine

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./
RUN npm install --production

# Копируем весь исходный код (включая webapp и src)
COPY . .

# Запускаем сборку (copy:webapp сработает корректно)
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/api/server.js"]