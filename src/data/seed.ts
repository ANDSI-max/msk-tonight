import { fetchKudaGoEvents } from './kudago-fetcher';
import db from "../database/db";
import { MOCK_EVENTS } from "./mock-events";

function fmt(d: Date | string): string {
  if (typeof d === "string") return d.slice(0, 19).replace("T", " ");
  return d.toISOString().slice(0, 19).replace("T", " ");
}

export async function seedEvents(force = false) {
  const insert = db.prepare("INSERT OR REPLACE INTO events (id, title, description, category, venue_name, address, district, start_time, end_time, price_min, price_max, image_url, external_url, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  
  console.log("[seed] Fetching events from KudaGo...");
  const kudaGoEvents = await fetchKudaGoEvents(50);
  
  if (kudaGoEvents && kudaGoEvents.length > 0) {
    console.log("[seed] Got " + kudaGoEvents.length + " events from KudaGo");
    if (force) db.exec("DELETE FROM events");
    const tx = db.transaction((items: any[]) => {
      for (const e of items) {
        const startTime = new Date(e.start_time);
        const endTime = new Date(startTime.getTime() + e.duration_hours * 60 * 60 * 1000);
        const id = Math.abs(parseInt(startTime.getTime().toString().slice(-8)));
        insert.run(id, e.title, e.description, e.category, e.venue_name, e.address, e.district, fmt(startTime), fmt(endTime), e.price_min, e.price_max, e.image_url, e.external_url, e.lat, e.lng);
      }
    });
    tx(kudaGoEvents);
    console.log("[seed] Loaded " + kudaGoEvents.length + " events from KudaGo");
  } else {
    console.log("[seed] KudaGo returned 0, using mock data");
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
}

if (require.main === module) {
  const force = process.argv.includes("--force");
  seedEvents(force);
}