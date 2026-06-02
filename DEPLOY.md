# 🚀 Полная инструкция по деплою МСК.Tonight

## 📋 Что нужно перед началом

1. **GitHub аккаунт** — https://github.com/signup
2. **Telegram бот** — создайте в @BotFather
3. **Vercel аккаунт** — https://vercel.com/signup (или Railway https://railway.app)

---

## 🔧 ШАГ 1: Установите Git

### Windows:
1. Скачайте с https://git-scm.com/download/win
2. Запустите установщик, нажимайте "Next" (настройки по умолчанию)
3. После установки перезапустите PowerShell

### Проверка:
```powershell
git --version
# Должно показать: git version 2.x.x
```

---

## 📦 ШАГ 2: Создайте репозиторий на GitHub

1. Откройте https://github.com/new
2. Введите:
   - **Repository name**: `msk-tonight`
   - **Описание**: Telegram Mini App для поиска развлечений в Москве
   - Выберите **Public** или **Private**
3. **НЕ** ставьте галочки на "Initialize with README"
4. Нажмите **Create repository**
5. Скопируйте URL (пример: `https://github.com/yourusername/msk-tonight.git`)

---

## 📤 ШАГ 3: Отправьте код на GitHub

Откройте PowerShell в папке проекта:

```powershell
cd C:\Users\user\msk-tonight

# Настройте Git (один раз)
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Инициализация
git init
git add .
git commit -m "Initial commit"

# Привязка к репозиторию (замените YOURUSERNAME на свой логин)
git remote add origin https://github.com/YOURUSERNAME/msk-tonight.git
git branch -M main
git push -u origin main
```

---

## ⚡ ШАГ 4A: Деплой на Vercel (Mini App + API)

### Через веб-интерфейс (проще):

1. Откройте https://vercel.com/new
2. Нажмите **Import Git Repository**
3. Выберите `msk-tonight`
4. Нажмите **Import**
5. **ВАЖНО**: Добавьте переменные окружения:
   - `BOT_TOKEN` = ваш токен от @BotFather
   - `DATABASE_URL` = `./msk_tonight.db`
6. Нажмите **Deploy**
7. Ждите 2-3 минуты

### После деплоя:
- Вы получите URL вида: `https://msk-tonight.vercel.app`
- Проверьте: `https://msk-tonight.vercel.app/health`

### Настройка Mini App в @BotFather:
1. Отправьте `/newapp`
2. Выберите бота
3. Введите название: "МСК.Tonight"
4. Введите описание
5. Загрузите фото (640x360) или пропустите
6. Введите Web App URL: `https://msk-tonight.vercel.app`
7. Введите short name: `tonight`

**Важно**: Vercel не поддерживает polling-бота. Для работы бота используйте Railway (ШАГ 4B).

---

## 🚂 ШАГ 4B: Деплой на Railway (ПОЛНАЯ версия с ботом)

### Через веб-интерфейс:

1. Откройте https://railway.app
2. Нажмите **Start a New Project**
3. Войдите через GitHub
4. Нажмите **New** → **Deploy from GitHub repo**
5. Выберите `msk-tonight`
6. Railway автоматически найдёт Dockerfile

### Настройте переменные:
В разделе **Variables** добавьте:
- `BOT_TOKEN` = ваш токен от @BotFather
- `PORT` = `3000`
- `WEBAPP_URL` = URL который выдаст Railway (после деплоя)

### После деплоя:
1. Скопируйте URL из Railway (например: `https://msk-tonight-production.up.railway.app`)
2. Проверьте: `https://msk-tonight-production.up.railway.app/health`

### Настройка бота:
1. В @BotFather: `/setinline` → выберите бота → Enable
2. В @BotFather: `/setmenubutton` → выберите бота → отправьте URL Mini App

---

## 🎯 ШАГ 5: Проверка работы

### Проверьте API:
```
https://your-domain.com/health
https://your-domain.com/api/events
https://your-domain.com/api/profile
```

### Проверьте Mini App:
Откройте URL в браузере или через бота

### Проверьте бота:
1. Найдите своего бота в Telegram
2. Нажмите /start
3. Нажмите кнопку "Открыть МСК.Tonight"
4. Протестируйте свайпы

---

## ❓ Частые проблемы

### "Build failed" на Vercel
- Проверьте логи в Vercel Dashboard
- Убедитесь, что `package.json` и `tsconfig.json` в корне

### Бот не отвечает
- Проверьте `BOT_TOKEN` в переменных окружения
- Railway: убедитесь, что бот запущен (смотрите логи)
- Vercel: бот не будет работать, используйте Railway

### "Database not found"
- Файл БД создаётся автоматически при первом запуске
- Проверьте права на запись

---

## 📱 Как поделиться Mini App

1. Отправьте друзьям ссылку: `t.me/yourbot/tonight`
2. Или через inline: `@yourbot джаз`

---

## 🔐 Безопасность

- Никогда не публикуйте `.env` файл
- `BOT_TOKEN` храните только в переменных окружения платформы
- При компрометации токена: перевыпустите в @BotFather

---

**Готово!** 🎉 Ваше приложение доступно по публичной ссылке.