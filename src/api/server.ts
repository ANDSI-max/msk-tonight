import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import routes from "./routes";
import { seedEvents } from "../data/seed";
import { startBot, stopBot, handleWebhookUpdate } from "../bot/bot";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, status: "healthy", time: new Date().toISOString() });
});

// Middleware для UTF-8 кодировки
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// Для JSON ответов тоже ставим UTF-8
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return originalJson(data);
  };
  next();
});

app.use('/api', routes);

// ============================================
// СТАТИКА - проверяем НЕСКОЛЬКО путей
// ============================================
const possiblePaths = [
  path.join(__dirname, '../webapp'),      // production: /app/dist/webapp
  path.join(process.cwd(), 'webapp'),     // dev: /app/webapp
  path.join(process.cwd(), 'dist', 'webapp'), // альтернатива
];

console.log('========================================');
console.log('[server] Поиск webapp:');
console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`  __dirname: ${__dirname}`);
console.log(`  process.cwd(): ${process.cwd()}`);
console.log('========================================');

let staticPath = '';
for (const p of possiblePaths) {
  const exists = fs.existsSync(p);
  console.log(`  ${exists ? '✅' : '❌'} ${p}`);
  if (exists && !staticPath) {
    staticPath = p;
  }
}

if (staticPath) {
  console.log(`[server] Используем: ${staticPath}`);
  const files = fs.readdirSync(staticPath);
  console.log(`[server] Файлы: ${files.join(', ')}`);
  app.use(express.static(staticPath));
} else {
  console.error('[server] ❌ Webapp NOT FOUND anywhere!');
}

// ============================================
// ГЛАВНАЯ СТРАНИЦА
// ============================================
app.get('/', (req, res) => {
  const indexPath = staticPath ? path.join(staticPath, 'index.html') : null;
  
  console.log(`[server] Запрос index.html: ${indexPath}`);
  
  if (indexPath && fs.existsSync(indexPath)) {
    console.log(`[server] ✅ Отдаю: ${indexPath}`);
    res.sendFile(indexPath);
  } else {
    console.error(`[server] ❌ index.html не найден`);
    res.status(404).send("index.html not found");
  }
});

const webhookPath = "/webhook";
app.post(webhookPath, (req, res) => {
  handleWebhookUpdate(req.body);
  res.sendStatus(200);
});

let server: any;

async function start() {
  console.log("[startup] Запуск сервера...");
  seedEvents();
  await startBot({ port: PORT, webhookPath });
  server = app.listen(PORT, () => {
    console.log(`[server] Слушаю http://localhost:${PORT}`);
    console.log(`[server] Health: http://localhost:${PORT}/health`);
  });
}

async function shutdown(signal: string) {
  console.log(`[server] Получен ${signal}, завершаю...`);
  try { await stopBot(); } catch (e) { console.error(e); }
  if (server) {
    server.close(() => { console.log("[server] HTTP сервер закрыт."); process.exit(0); });
  } else { process.exit(0); }
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start().catch((e) => { console.error("[startup] Ошибка:", e); process.exit(1); });