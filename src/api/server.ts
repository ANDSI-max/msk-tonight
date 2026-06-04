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
// СТАТИКА - production: dist/webapp, dev: webapp
// ============================================
const isProd = process.env.NODE_ENV === 'production';

// В production: __dirname = /app/dist/api → ../webapp = /app/dist/webapp
// В dev: process.cwd() = /app → webapp = /app/webapp
const staticPath = isProd
  ? path.join(__dirname, '../webapp')  // /app/dist/../webapp = /app/dist/webapp
  : path.join(process.cwd(), 'webapp');

console.log(`[server] NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`[server] __dirname: ${__dirname}`);
console.log(`[server] Статика из: ${staticPath}`);

if (fs.existsSync(staticPath)) {
  console.log(`✅ Webapp found at: ${staticPath}`);
  const files = fs.readdirSync(staticPath);
  console.log(`📁 Files: ${files.join(', ')}`);
  app.use(express.static(staticPath));
} else {
  console.error(`❌ Webapp NOT found at: ${staticPath}`);
}

// ============================================
// ГЛАВНАЯ СТРАНИЦА
// ============================================
app.get('/', (req, res) => {
  const indexPath = path.join(staticPath, 'index.html');
  console.log(`[server] Отдаю index.html из: ${indexPath}`);
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error(`[server] index.html не найден: ${indexPath}`);
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