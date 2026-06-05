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

// UTF-8 middleware для корректного отображения эмодзи и русского текста
app.use((_req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, status: "healthy", time: new Date().toISOString() });
});

app.use('/api', routes);

// ============================================
// СТАТИКА - должна быть ДО всех обработчиков
// ============================================
const possiblePaths = [
  path.join(__dirname, '../webapp'),
  path.join(process.cwd(), 'webapp'),
  path.join(process.cwd(), 'dist', 'webapp'),
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
  if (exists && !staticPath) staticPath = p;
}

if (staticPath) {
  console.log(`[server] Используем: ${staticPath}`);
  const files = fs.readdirSync(staticPath);
  console.log(`[server] Файлы: ${files.join(', ')}`);
  
  // Статика ДО всех обработчиков
  app.use(express.static(staticPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filePath.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
      }
    }
  }));
} else {
  console.error('[server] ❌ Webapp NOT FOUND!');
}

// ============================================
// ГЛАВНАЯ СТРАНИЦА - должна отдавать index.html
// ============================================
app.get('/', (req, res) => {
  const indexPath = staticPath ? path.join(staticPath, 'index.html') : null;
  console.log(`[server] Запрос / : ${indexPath}`);
  
  if (indexPath && fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
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
  seedEvents(process.env.FORCE_SEED === "true");
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