import { initDatabase, saveDatabase } from "../database/db";
import { getDb } from "../database/db";
import { MOCK_EVENTS } from "./mock-events";

function todayAt(hours: number): Date {
  const d = new Date();
  d.setHours(19, 0, 0, 0);
  d.setHours(d.getHours() + hours);
  return d;
}

function fmt(d: Date): string {
  return d.toISOString().slice(0, 19).replace("T", " ");
}

export function seedEvents(force = false) {
  const db = getDb();
  const row = db.exec("SELECT COUNT(*) AS c FROM events")[0]?.values[0][0] as number || 0;
  
  if (!force && row > 0) {
    console.log(`[seed] В БД уже ${row} событий, пропускаю.`);
    return;
  }
  
  if (force) {
    db.run("DELETE FROM events;");
  }
  
  for (const e of MOCK_EVENTS) {
    const start = todayAt(e.hours_from_now);
    const end = todayAt(e.hours_from_now + e.duration_hours);
    db.run(`
      INSERT INTO events
        (title, description, category, venue_name, address, district,
         start_time, end_time, price_min, price_max, image_url, external_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      e.title, e.description, e.category, e.venue_name, e.address, e.district,
      fmt(start), fmt(end), e.price_min, e.price_max, e.image_url, e.external_url
    ]);
  }
  
  saveDatabase();
  console.log(`[seed] Загружено ${MOCK_EVENTS.length} событий.`);
}

if (require.main === module) {
  const force = process.argv.includes("--force");
  initDatabase().then(() => {
    seedEvents(force);
    process.exit(0);
  }).catch(console.error);
}