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
// СТАТИКА - webapp и dist/webapp
// ============================================
const webappPath = path.join(process.cwd(), 'webapp');
const distWebappPath = path.join(process.cwd(), 'dist', 'webapp');

console.log('[server] Настройка статики:');

if (fs.existsSync(webappPath)) {
  console.log(`✅ Webapp found at: ${webappPath}`);
  app.use(express.static(webappPath));
} else {
  console.log(`❌ Webapp not found: ${webappPath}`);
}

if (fs.existsSync(distWebappPath)) {
  console.log(`✅ Dist webapp found at: ${distWebappPath}`);
  app.use(express.static(distWebappPath));
} else {
  console.log(`❌ Dist webapp not found: ${distWebappPath}`);
}

// ============================================
// ГЛАВНАЯ СТРАНИЦА
// ============================================
app.get('/', (req, res) => {
  const paths = [
    path.join(process.cwd(), 'webapp', 'index.html'),
    path.join(process.cwd(), 'dist', 'webapp', 'index.html')
  ];
  
  for (const p of paths) {
    if (fs.existsSync(p)) {
      console.log(`[server] Отдаю index.html из: ${p}`);
      return res.sendFile(p);
    }
  }
  
  console.error('[server] index.html не найден');
  res.status(404).send("index.html not found");
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