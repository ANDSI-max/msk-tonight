# МСК.Tonight — Telegram Mini App для поиска развлечений в Москве

Полнофункциональное Mini App для Telegram с ботом, свайпами событий, личным планом и системой достижений.

## 🚀 Возможности

### Telegram-бот
- **Команды:**
  - `/start` — приветствие + кнопка открытия Mini App
  - `/tonight` — топ-5 событий сегодня
  - `/stats` — статистика пользователя (серия, события)
  - `/help` — справка

- **Inline-режим:**
  - `@msk_tonightbot джаз` → джазовые события
  - `@msk_tonightbot бары` → бары с акциями
  - `@msk_tonightbot театр` → спектакли сегодня
  - Результаты с кнопкой «Присоединиться к мероприятию»

### Mini App (3 экрана)

**1. Сегодня вечером (главный экран)**
- Карточки событий со свайпами влево/вправо
- Фильтры по категории и району
- Кнопка «Добавить в план»
- Тактильная обратная связь (HapticFeedback)

**2. Мой план**
- Сохранённые события
- Кнопка «Я был» для поддержания серии
- «Поделиться с друзьями» (inline-ссылка)
- Счётчик «Друзья идут»

**3. Профиль**
- Счётчик серий (дней подряд)
- Значки: «Театрал», «Знаток баров», «Концертоман» и др.
- Статистика: всего событий, любимые категории

## 📁 Структура проекта

```
msk-tonight/
├── package.json
├── tsconfig.json
├── Dockerfile
├── .env.example
├── src/
│   ├── api/
│   │   ├── server.ts      # Express сервер + webhook
│   │   ├── routes.ts      # API endpoints
│   │   ├── auth.ts        # Валидация Telegram initData
│   │   └── events.ts      # Логика событий и значков
│   ├── bot/
│   │   ├── bot.ts         # Основная логика бота
│   │   ├── commands.ts    # Команды (/start, /help, /stats)
│   │   └── inline.ts      # Inline-режим
│   ├── database/
│   │   ├── db.ts          # SQLite подключение
│   │   └── models.ts      # Модели данных
│   ├── data/
│   │   ├── mock-events.ts # 50 тестовых событий
│   │   └── seed.ts        # Сидер БД
│   └── webapp/
│       ├── index.html     # Mini App интерфейс
│       ├── style.css      # Telegram-native стили
│       └── app.js         # Frontend логика
└── README.md
```

## 🛠️ Установка и запуск (локально)

### 1. Клонирование и зависимости

```bash
cd msk-tonight
npm install
```

### 2. Настройка окружения

Скопируйте `.env.example` в `.env` и заполните:

```env
BOT_TOKEN=1234567890:AAFxxxxxxxxxxxxxxxxxxxxxxxxxxx
WEBHOOK_URL=
PORT=3000
DATABASE_URL=./msk_tonight.db
WEBAPP_URL=https://your-domain.com
```

**Получение BOT_TOKEN:**
1. Откройте @BotFather в Telegram
2. `/newbot` → введите имя и username
3. Скопируйте токен

### 3. Запуск в режиме разработки

```bash
npm run dev
```

Сервер запустится на `http://localhost:3000`

**Проверка:**
- API: `http://localhost:3000/health`
- Mini App: `http://localhost:3000`

### 4. Настройка бота

**Вариант A: Polling (локально, без HTTPS)**
- Оставьте `WEBHOOK_URL` пустым
- Бот автоматически запустится в polling-режиме

**Вариант B: Webhook (для продакшена)**
- Укажите `WEBHOOK_URL=https://your-domain.com`
- Бот установит webhook автоматически

**Настройка Mini App в @BotFather:**
1. `/newapp` или выберите существующего бота
2. Укажите Web App URL: `https://your-domain.com`
3. Short name: `tonight`
4. Ссылка: `t.me/yourbot/tonight`

## 🐳 Docker (готов к деплою)

### Сборка и запуск

```bash
docker build -t msk-tonight .
docker run -d -p 3000:3000 \
  -e BOT_TOKEN=your_token \
  -e WEBHOOK_URL=https://your-domain.com \
  -e WEBAPP_URL=https://your-domain.com \
  --name msk-tonight msk-tonight
```

### Health check

```bash
curl http://localhost:3000/health
# {"ok":true,"status":"healthy",...}
```

## 🚀 Деплой

### Railway

1. Создайте новый проект → Connect GitHub
2. Добавьте переменные окружения: `BOT_TOKEN`, `WEBHOOK_URL`, `WEBAPP_URL`
3. Railway автоматически обнаружит Dockerfile

### Vercel

> ⚠️ Vercel не поддерживает долгоживущие процессы (бот в polling-режиме).
> Используйте webhook-режим + отдельный хостинг для бота или выберите Railway/Render.

### Render

1. New Web Service → Connect repo
2. Build: `npm install && npm run build`
3. Start: `npm start`
4. Добавьте переменные окружения

## 📡 API Reference

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/auth` | Валидация initData, регистрация |
| GET | `/api/events?category=&district=&limit=` | Список событий |
| POST | `/api/events/swipe` | Свайп `{event_id, direction}` |
| POST | `/api/plan/add` | Добавить в план `{event_id}` |
| POST | `/api/plan/remove` | Удалить из плана |
| GET | `/api/plan` | Получить план пользователя |
| POST | `/api/plan/attend` | Отметить посещение |
| GET | `/api/profile` | Профиль и статистика |

### Заголовки

Для аутентификации передавайте `X-Telegram-Init-Data` (из `tg.initData`):

```js
fetch("/api/profile", {
  headers: { "X-Telegram-Init-Data": tg.initData }
});
```

## 🗄️ База данных (SQLite)

### Таблицы

- `users` — пользователи (telegram_id, streak_days, last_activity)
- `events` — события (категория, район, время, цена)
- `user_plans` — планы пользователей
- `swipes` — лайки/дизлайки
- `user_badges` — заработанные значки

### Сброс данных

```bash
rm msk_tonight.db
npm run seed -- --force
```

## 🎨 Значки (Badges)

| Значок | Условие |
|--------|---------|
| 🌟 Первый шаг | 1 событие в плане |
| 🔥 В клубе пятёрочка | 5 дней серии |
| 💫 Десятка | 10 дней серии |
| 🎭 Театрал | 5+ театров |
| 🍸 Знаток баров | 5+ баров |
| 🎸 Концертоман | 5+ концертов |
| 🖼️ Охотник за искусством | 3+ выставки |
| 🕺 Танцор | 3+ клуба |

## 🔐 Безопасность

- Валидация `initData` через HMAC-SHA256 (алгоритм Telegram)
- Защита от CSRF через проверку подписи
- Внешние ключи и каскадное удаление в БД

## 📝 Скрипты

```json
"scripts": {
  "build": "tsc && npm run copy:webapp",
  "start": "node dist/api/server.js",
  "dev": "ts-node src/api/server.ts",
  "seed": "ts-node src/data/seed.ts"
}
```

## 🧪 Тестирование

1. Откройте бота в Telegram
2. Нажмите `/start` → «Открыть МСК.Tonight»
3. Протестируйте свайпы, добавление в план, отметку «Я был»
4. Проверьте inline: `@yourbot джаз`

## 📄 Лицензия

MIT

---

**NLP-Core-Team** © 2024#   m s k - t o n i g h t  
 