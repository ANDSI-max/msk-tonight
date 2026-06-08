import db from "../database/db";
import { MOCK_EVENTS } from "./mock-events";

function fmt(d: Date | string): string {
  if (typeof d === "string") return d.slice(0, 19).replace("T", " ");
  return d.toISOString().slice(0, 19).replace("T", " ");
}

export function seedEvents(force = false) {
  const row = db.prepare("SELECT COUNT(*) AS c FROM events").get() as { c: number };
  if (!force && row.c > 0) {
    console.log("[seed] DB has " + row.c + " events, skipping.");
    return;
  }
  if (force) db.exec("DELETE FROM events;");
  
  const insert = db.prepare("INSERT INTO events (title, description, category, venue_name, address, district, start_time, end_time, price_min, price_max, image_url, external_url, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  
  const tx = db.transaction((items: typeof MOCK_EVENTS) => {
    for (const e of items) {
      const startTime = new Date(e.start_time);
      const endTime = new Date(startTime.getTime() + e.duration_hours * 60 * 60 * 1000);
      insert.run(e.title, e.description, e.category, e.venue_name, e.address, e.district, fmt(startTime), fmt(endTime), e.price_min, e.price_max, e.image_url, e.external_url, e.lat, e.lng);
    }
  });
  
  const allEvents = MOCK_EVENTS;
  tx(allEvents);
  console.log("[seed] Loaded " + allEvents.length + " events.");
}

if (require.main === module) {
  const force = process.argv.includes("--force");
  seedEvents(force);
}