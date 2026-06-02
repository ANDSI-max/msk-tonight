import db from "../database/db";
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
  const row = db.prepare("SELECT COUNT(*) AS c FROM events").get() as { c: number };
  if (!force && row.c > 0) {
    console.log(`[seed] В БД уже ${row.c} событий, пропускаю.`);
    return;
  }
  if (force) db.exec("DELETE FROM events;");
  
  const insert = db.prepare(`INSERT INTO events (title, description, category, venue_name, address, district, start_time, end_time, price_min, price_max, image_url, external_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  
  const tx = db.transaction((items: typeof MOCK_EVENTS) => {
    for (const e of items) {
      const start = todayAt(e.hours_from_now);
      const end = todayAt(e.hours_from_now + e.duration_hours);
      insert.run(e.title, e.description, e.category, e.venue_name, e.address, e.district, fmt(start), fmt(end), e.price_min, e.price_max, e.image_url, e.external_url);
    }
  });
  
  tx(MOCK_EVENTS);
  console.log(`[seed] Загружено ${MOCK_EVENTS.length} событий.`);
}

if (require.main === module) {
  const force = process.argv.includes("--force");
  seedEvents(force);
}