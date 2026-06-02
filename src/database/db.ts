import initSqlJs, { Database } from "sql.js";
import path from "path";
import fs from "fs";

let db: Database | null = null;

export async function initDatabase(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs({locateFile: (file: string) => 
        `https://sql.js.org/dist/${file}`
    });
  const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), "msk_tonight.db");

  // Загружаем существующую БД или создаём новую
  let fileBuffer: Uint8Array | undefined;
  if (fs.existsSync(dbPath)) {
    fileBuffer = fs.readFileSync(dbPath);
  }

  db = fileBuffer ? new SQL.Database(fileBuffer) : new SQL.Database();

  // Включаем внешние ключи
  db.run("PRAGMA foreign_keys = ON;");

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id   INTEGER UNIQUE NOT NULL,
      username      TEXT,
      first_name    TEXT,
      streak_days   INTEGER DEFAULT 0,
      last_activity DATE,
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS events (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      title        TEXT NOT NULL,
      description  TEXT,
      category     TEXT,
      venue_name   TEXT,
      address      TEXT,
      district     TEXT,
      start_time   DATETIME,
      end_time     DATETIME,
      price_min    INTEGER,
      price_max    INTEGER,
      image_url    TEXT,
      external_url TEXT
    );

    CREATE TABLE IF NOT EXISTS user_plans (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id   INTEGER NOT NULL,
      event_id  INTEGER NOT NULL,
      added_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      attended  INTEGER DEFAULT 0,
      UNIQUE(user_id, event_id),
      FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS swipes (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      event_id   INTEGER NOT NULL,
      direction  TEXT NOT NULL CHECK(direction IN ('like','dislike')),
      swiped_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, event_id),
      FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_badges (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id   INTEGER NOT NULL,
      badge_id  TEXT NOT NULL,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, badge_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
    CREATE INDEX IF NOT EXISTS idx_events_start    ON events(start_time);
    CREATE INDEX IF NOT EXISTS idx_plans_user      ON user_plans(user_id);
    CREATE INDEX IF NOT EXISTS idx_swipes_user     ON swipes(user_id);
  `);

  return db;
}

// Сохранение БД на диск
export function saveDatabase(): void {
  if (!db) return;
  const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), "msk_tonight.db");
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

// Авто-сохранение при закрытии
process.on("exit", saveDatabase);
process.on("SIGINT", () => { saveDatabase(); process.exit(0); });
process.on("SIGTERM", () => { saveDatabase(); process.exit(0); });

export function getDb(): Database {
  if (!db) throw new Error("Database not initialized. Call initDatabase() first.");
  return db;
}

export default getDb;