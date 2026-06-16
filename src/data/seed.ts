import { fetchTimePadEvents } from './timepad-fetcher';
import db from "../database/db";
import { MOCK_EVENTS } from "./mock-events";

function fmt(d: Date | string): string {
  if (typeof d === "string") return d.slice(0, 19).replace("T", " ");
  return d.toISOString().slice(0, 19).replace("T", " ");
}

export async function seedEvents(force = false) {
  console.log("[seed] Starting... force=" + force);
  
  try {
    const insert = db.prepare("INSERT OR REPLACE INTO events (id, title, description, category, venue_name, address, district, start_time, end_time, price_min, price_max, image_url, external_url, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    console.log("[seed] Fetching TimePad events...");
    const events = await fetchTimePadEvents(50);
    console.log("[seed] TimePad response:", events?.length || 0);
    
    if (events && events.length > 0) {
      console.log("[seed] Got " + events.length + " events from TimePad");
      if (force) {
        console.log("[seed] Clearing old events...");
        db.exec("DELETE FROM events");
      }
      const tx = db.transaction((items: any[]) => {
        for (const e of items) {
          const startTime = new Date(e.start_time);
          const endTime = new Date(startTime.getTime() + e.duration_hours * 60 * 60 * 1000);
          const id = Math.abs(parseInt(startTime.getTime().toString().slice(-8)));
          insert.run(id, e.title, e.description, e.category, e.venue_name, e.address, e.district, fmt(startTime), fmt(endTime), e.price_min, e.price_max, e.image_url, e.external_url, e.lat, e.lng);
        }
      });
      tx(events);
      console.log("[seed] ✅ Loaded " + events.length + " events from TimePad");
    } else {
      console.log("[seed] TimePad returned 0, using mock data");
      if (force) db.exec("DELETE FROM events");
      const tx = db.transaction((items: typeof MOCK_EVENTS) => {
        let idx = 1;
        for (const e of items) {
          const startTime = new Date(e.start_time);
          const endTime = new Date(startTime.getTime() + e.duration_hours * 60 * 60 * 1000);
          insert.run(idx++, e.title, e.description, e.category, e.venue_name, e.address, e.district, fmt(startTime), fmt(endTime), e.price_min, e.price_max, e.image_url, e.external_url, e.lat, e.lng);
        }
      });
      tx(MOCK_EVENTS);
      console.log("[seed] Loaded " + MOCK_EVENTS.length + " mock events");
    }
  } catch (err) {
    console.error("[seed] ERROR:", err);
    // Fallback to mock events
    try {
      if (force) db.exec("DELETE FROM events");
      const insert = db.prepare("INSERT INTO events (id, title, description, category, venue_name, address, district, start_time, end_time, price_min, price_max, image_url, external_url, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
      const tx = db.transaction((items: typeof MOCK_EVENTS) => {
        let idx = 1;
        for (const e of items) {
          const startTime = new Date(e.start_time);
          const endTime = new Date(startTime.getTime() + e.duration_hours * 60 * 60 * 1000);
          insert.run(idx++, e.title, e.description, e.category, e.venue_name, e.address, e.district, fmt(startTime), fmt(endTime), e.price_min, e.price_max, e.image_url, e.external_url, e.lat, e.lng);
        }
      });
      tx(MOCK_EVENTS);
      console.log("[seed] Loaded mock events (fallback)");
    } catch (e2) {
      console.error("[seed] Fallback failed:", e2);
    }
  }
}

if (require.main === module) {
  const force = process.argv.includes("--force");
  seedEvents(force);
}