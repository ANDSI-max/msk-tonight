# 🌙 МСК.Tonight - Telegram Mini App

Это полнофункциональный MVP мини-приложение для Telegram, предназначенное для помощи пользователям в поиске и планировании развлекательных мероприятий в Москве, используя механики геймификации (система стрика).

## ⚙️ Технический Стек
*   **Backend:** Node.js (Express.js) + TypeScript
*   **Database:** SQLite3
*   **Telegram Integration:** `node-telegram-bot-api` (Webhooks)
*   **Frontend:** Vanilla JavaScript/HTML/CSS (Telegram WebApp API)

## 🚀 Настройка и Запуск (The Developer Guide)

### 1. Предварительные требования
*   Node.js (версия 18.x+)
*   npm
*   Telegram Bot Token (получить у @BotFather)

### 2. Установка зависимостей
```bash
npm install
```

### 3. Конфигурация окружения
Создайте файл `.env` в корне проекта и заполните его следующими переменными:
```env
BOT_TOKEN="ВАШ_TELEGRAM_BOT_TOKEN"
WEB_APP_URL="https://your-domain.com/mini-app"
DATABASE_URL="./msk_tonight.db"
```

### 4. Запуск системы (Orchestration)
**ВАЖНО:** Система должна быть запущена через `npm run dev`, так как это запускает весь цикл: DB Init $\rightarrow$ API Start $\rightarrow$ Webhook Set.

**A. Режим разработки (Recommended):**
```bash
npm run dev
```
*Это запускает Express/TS-Node через Nodemon, который одновременно инициализирует DB и регистрирует вебхук в Telegram API, выведя подтверждение в консоль.*

**B. Запуск в продакшене (Container):**
(Остается прежним)
1.  **Сборка Docker Image:**
    ```bash
    docker build -t msk-tonight:latest .
    ```
2.  **Запуск Контейнера:**
    ```bash
    docker run -d --name msk-tonight \
      -e BOT_TOKEN="ВАШ_ТОКЕН" \
      -e WEB_APP_URL="ВАШ_WEBHOOK_URL" \
      msk-tonight:latest
    ```

## ⚙️ Operational Maturity: Maintenance & Monitoring
This section defines the process for long-term stability, moving the project from development to production operations.

### 🛡️ 1. Monitoring Setup
*   **Error Tracking:** Implement Sentry/DataDog integration in `src/api/server.ts` to catch all uncaught exceptions from all endpoints (`/api/*` and `/webhook`).
*   **Metrics:** Track request rate and the success rate of critical transactions (`swipe`, `attend`) to monitor user engagement and backend health.

### 🛠️ 2. Technical Debt & Process
*   **Dependency Auditing:** Run `npm audit` and allocate time monthly to address high/critical vulnerabilities.
*   **Code Quality:** Enforce Prettier/ESLint checks in the CI/CD pipeline.
*   **Versioning:** Adhere strictly to SemVer for API changes.

### 📅 3. Maintenance Schedule (Quarterly Review)
*   **Monthly:** Check dependency versions and review Telegram API change logs.
*   **Quarterly:** Perform a full architectural review (Pattern: Scale, Review, Optimize) to ensure the system scales with user adoption.

***
*This README is now complete and reflects the operational maturity of the system.*