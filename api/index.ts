import { initDatabase, getDb, saveDatabase } from "../src/database/db";
import express from "express";
import cors from "cors";
import routes from "./src/api/routes";
import { seedEvents } from "./src/data/seed";
import path from "path";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, status: "healthy", time: new Date().toISOString() });
});

// API
app.use("/api", routes);

// Статика
const webappDir = path.join(__dirname, "..", "src", "webapp");
if (fs.existsSync(webappDir)) {
  app.use(express.static(webappDir));
}

// Инициализация БД при первом запросе
let initialized = false;
export default async function handler(req: any, res: any) {
  if (!initialized) {
    await initDatabase();
    seedEvents();
    initialized = true;
  }
  
  // Сохраняем БД после ответа
  res.on("finish", () => saveDatabase());
  
  app(req, res);
}