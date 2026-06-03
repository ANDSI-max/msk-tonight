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
  next();
});

app.use('/api', routes);

const webappDirs = [
  path.join(__dirname, "..", "webapp"),
  path.join(process.cwd(), "src", "webapp"),
  path.join(process.cwd(), "public"),
];
const webappDir = webappDirs.find((d) => fs.existsSync(d)) || webappDirs[0];
console.log(`[server] Р Р°Р·РґР°СЋ Mini App РёР·: ${webappDir}`);
app.use(express.static(webappDir));

const webhookPath = "/webhook";
app.post(webhookPath, (req, res) => {
  handleWebhookUpdate(req.body);
  res.sendStatus(200);
});

let server: any;

async function start() {
  console.log("[startup] Р—Р°РїСѓСЃРє СЃРµСЂРІРµСЂР°...");
  seedEvents();
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