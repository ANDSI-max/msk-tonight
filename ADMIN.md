# 🔧 Админка для управления событиями

## Быстрый старт

### 1. Настройка ADMIN_TELEGRAM_ID

Добавьте в `.env` (локально) и в Railway Environment Variables:

```env
ADMIN_TELEGRAM_ID=123456789
```

**Как узнать свой Telegram ID:**
- Напишите боту [@userinfobot](https://t.me/userinfobot)
- Или откройте https://api.telegram.org/bot<BOT_TOKEN>/getMe в браузере

### 2. Доступ к админке

**URL:** `https://your-domain.up.railway.app/admin`

**Важно:** Админка использует Telegram WebApp для аутентификации. Открывайте через Telegram бота или добавьте `?init_data=xxx` для отладки.

## API Endpoints

### GET /api/admin/events
Получить все события
```json
{ "ok": true, "events": [...] }
```

### GET /api/admin/events/:id
Получить событие по ID
```json
{ "ok": true, "event": {...} }
```

### POST /api/admin/events
Создать событие
```json
{
  "title": "Концерт",
  "description": "Описание",
  "category": "concert",
  "venue_name": "Клуб",
  "address": "ул. Примерная, 1",
  "district": "Центр",
  "start_time": "2026-06-20T19:00:00",
  "end_time": "2026-06-20T23:00:00",
  "price_min": 500,
  "price_max": 1500,
  "image_url": "https://...",
  "external_url": "https://...",
  "lat": 55.7558,
  "lng": 37.6173
}
```

### PUT /api/admin/events/:id
Обновить событие (передаются только изменяемые поля)

### DELETE /api/admin/events/:id
Удалить событие

## Структура файлов

```
src/
├── api/
│   ├── admin.routes.ts    # Admin API endpoints
│   ├── routes.ts          # Подключение admin routes
│   └── server.ts          # Маршрут /admin
├── database/
│   └── models.ts          # AdminEventModel (CRUD)
webapp/
└── admin.html             # Админ-панель UI
```

## Безопасность

- Все endpoints защищены middleware `adminMiddleware()`
- Проверка по `ADMIN_TELEGRAM_ID` из переменных окружения
- Требуется валидный Telegram initData

## Отладка

Для тестирования без Telegram можно передать init_data в URL:
```
/admin.html?init_data=query_id=xxx&user=%7B%22id%22%3A123456789%7D&...
```

