import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import mime from "mime-types";
import routes from "./routes";
import { seedEvents } from "../data/seed";
import { startBot, stopBot, handleWebhookUpdate } from "../bot/bot";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const REQUEST_TIMEOUT = Number(process.env.REQUEST_TIMEOUT) || 10000; // 10 СЃРµРєСѓРЅРґ

// Middleware РґР»СЏ РѕРіСЂР°РЅРёС‡РµРЅРёСЏ РІСЂРµРјРµРЅРё Р·Р°РїСЂРѕСЃР°
app.use((req, res, next) => {
  const timeout = setTimeout(() => {
    console.warn('[timeout]', req.method, req.path, 'timed out');
    res.status(503).json({ error: 'request_timeout', message: 'Request took too long' });
  }, REQUEST_TIMEOUT);
  
  res.on('finish', () => clearTimeout(timeout));
  res.on('close', () => clearTimeout(timeout));
  next();
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

// Middleware to set charset for API JSON responses
app.use('/api', (req, res, next) => {
  console.log('[api-middleware]', req.method, req.path, req.query);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, status: "healthy", time: new Date().toISOString() });
});

// API routes Р”Рћ СЃС‚Р°С‚РёРєРё
app.use('/api', routes);
console.log('[server] API routes registered');

// ============================================
// РЎРўРђРўРРљРђ - РґРѕР»Р¶РЅР° Р±С‹С‚СЊ Р”Рћ РІСЃРµС… РѕР±СЂР°Р±РѕС‚С‡РёРєРѕРІ
// ============================================
const possiblePaths = [
  path.join(__dirname, '../webapp'),
  path.join(process.cwd(), 'webapp'),
  path.join(process.cwd(), 'dist', 'webapp'),
];

console.log('========================================');
console.log('[server] РџРѕРёСЃРє webapp:');
console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`  __dirname: ${__dirname}`);
console.log(`  process.cwd(): ${process.cwd()}`);
console.log('========================================');

let staticPath = '';
for (const p of possiblePaths) {
  const exists = fs.existsSync(p);
  console.log(`  ${exists ? 'вњ…' : 'вќЊ'} ${p}`);
  if (exists && !staticPath) staticPath = p;
}

if (staticPath) {
  console.log(`[server] РСЃРїРѕР»СЊР·СѓРµРј: ${staticPath}`);
  const files = fs.readdirSync(staticPath);
  console.log(`[server] Р¤Р°Р№Р»С‹: ${files.join(', ')}`);

  // РЎС‚Р°С‚РёРєР° Р”Рћ РІСЃРµС… РѕР±СЂР°Р±РѕС‚С‡РёРєРѕРІ
  app.use(express.static(staticPath, {
    setHeaders: (res, filePath) => {
      const charset = 'utf-8';
      const type = mime.lookup(filePath) || 'application/octet-stream';
      res.setHeader('Content-Type', `${type}; charset=${charset}`);
    }
  }));
} else {
  console.error('[server] вќЊ Webapp NOT FOUND!');
}

// ============================================
// Р“Р›РђР’РќРђРЇ РЎРўР РђРќРР¦Рђ - РґРѕР»Р¶РЅР° РѕС‚РґР°РІР°С‚СЊ index.html
// ============================================

// ADMIN - /admin
app.get('/admin', (req, res) => {
  const adminPath = staticPath ? path.join(staticPath, 'admin.html') : null;
  if (adminPath && fs.existsSync(adminPath)) {
    res.sendFile(adminPath);
  } else {
    res.status(404).send("admin.html not found");
  }
});
app.get('/', (req, res) => {
  const indexPath = staticPath ? path.join(staticPath, 'index.html') : null;
  console.log(`[server] Р—Р°РїСЂРѕСЃ / : ${indexPath}`);

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
  console.log("[startup] Р—Р°РїСѓСЃРє СЃРµСЂРІРµСЂР°...");
  await seedEvents(true); // Р’СЃРµРіРґР° РѕС‡РёС‰Р°РµРј Рё Р·Р°РіСЂСѓР¶Р°РµРј KudaGo
  await startBot({ port: PORT, webhookPath });
  server = app.listen(PORT, () => {
    console.log(`[server] РЎР»СѓС€Р°СЋ http://localhost:${PORT}`);
    console.log(`[server] Health: http://localhost:${PORT}/health`);
  });
}

async function shutdown(signal: string) {
  console.log(`[server] РџРѕР»СѓС‡РµРЅ ${signal}, Р·Р°РІРµСЂС€Р°СЋ...`);
  try { await stopBot(); } catch (e) { console.error(e); }
  if (server) {
    server.close(() => { console.log("[server] HTTP СЃРµСЂРІРµСЂ Р·Р°РєСЂС‹С‚."); process.exit(0); });
  } else { process.exit(0); }
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start().catch((e) => { console.error("[startup] РћС€РёР±РєР°:", e); process.exit(1); });
