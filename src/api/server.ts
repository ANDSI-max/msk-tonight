import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import routes from "./routes";
import { seedEvents } from "../data/seed";
import { startBot, stopBot, handleWebhookUpdate } from "../bot/bot";
import { initDatabase, saveDatabase } from "../database/db";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Health-check
app.get("/health", (_req, res) => {
  res.json({ ok: true, status: "healthy", time: new Date().toISOString() });
});

// API
app.use("/api", routes);

// Статика Mini App
const webappDirs = [
  path.join(__dirname, "..", "webapp"),
  path.join(process.cwd(), "src", "webapp"),
  path.join(process.cwd(), "public"),
];
const webappDir = webappDirs.find((d) => fs.existsSync(d)) || webappDirs[0];
console.log(`[server] Раздаю Mini App из: ${webappDir}`);
app.use(express.static(webappDir));

// Webhook бота
const webhookPath = "/webhook";
app.post(webhookPath, (req, res) => {
  handleWebhookUpdate(req.body);
  res.sendStatus(200);
});

let server: any;

async function start() {
  // Инициализация БД
  await initDatabase();
  console.log("[db] База данных инициализирована");

  // Seed данных
  seedEvents();

  // Старт бота
  await startBot({ port: PORT, webhookPath });

  // Старт HTTP
  server = app.listen(PORT, () => {
    console.log(`[server] Слушаю http://localhost:${PORT}`);
    console.log(`[server] Health: http://localhost:${PORT}/health`);
  });
}

// Graceful shutdown
async function shutdown(signal: string) {
  console.log(`[server] Получен ${signal}, завершаю...`);
  saveDatabase();
  try { await stopBot(); } catch (e) { console.error(e); }
  if (server) {
    server.close(() => {
      console.log("[server] HTTP сервер закрыт.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGINT",  () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start().catch((e) => {
  console.error("[startup] Ошибка:", e);
  process.exit(1);
});