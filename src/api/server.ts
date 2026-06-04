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

// Middleware для UTF-8 кодировки - ДО всех роутов
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
// 2. УЛУЧШЕННЫЙ ОБРАБОТЧИК СТАТИКИ
// ============================================
const possibleStaticPaths = [
  path.join(process.cwd(), 'src', 'webapp'),
  path.join(process.cwd(), 'webapp'),
  path.join(__dirname, '..', 'webapp'),
  path.join(__dirname, 'webapp'),
  path.join(process.cwd(), 'dist', 'webapp'),
];

let staticFolderFound = false;
console.log('[server] Поиск папки со статикой:');
possibleStaticPaths.forEach(p => {
  if (fs.existsSync(p)) {
    console.log(`✅ Static files found at: ${p}`);
    app.use(express.static(p));
    staticFolderFound = true;
  } else {
    console.log(`❌ Static path not found: ${p}`);
  }
});

if (!staticFolderFound) {
  console.error("🚨 CRITICAL ERROR: Static folder (webapp) not found anywhere!");
}

// ============================================
// 3. ПРИНУДИТЕЛЬНАЯ ОТДАЧА INDEX.HTML
// ============================================
app.get('/', (req, res) => {
  for (const p of possibleStaticPaths) {
    const fullPath = path.join(p, 'index.html');
    if (fs.existsSync(fullPath)) {
      console.log(`[server] Отдаю index.html из: ${fullPath}`);
      return res.sendFile(fullPath);
    }
  }
  res.status(404).send("index.html not found on server");
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