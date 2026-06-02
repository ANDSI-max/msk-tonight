import db from "./db";

export interface User {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  streak_days: number;
  last_activity: string | null;
  created_at: string;
}

export interface EventRow {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  venue_name: string | null;
  address: string | null;
  district: string | null;
  start_time: string | null;
  end_time: string | null;
  price_min: number | null;
  price_max: number | null;
  image_url: string | null;
  external_url: string | null;
}

export const UserModel = {
  upsert(telegram_id: number, username?: string | null, first_name?: string | null): User {
    const existing = db.prepare("SELECT * FROM users WHERE telegram_id = ?").get(telegram_id) as User | undefined;
    if (existing) {
      db.prepare("UPDATE users SET username = COALESCE(?, username), first_name = COALESCE(?, first_name) WHERE telegram_id = ?")
        .run(username ?? null, first_name ?? null, telegram_id);
      return db.prepare("SELECT * FROM users WHERE telegram_id = ?").get(telegram_id) as User;
    }
    const info = db.prepare("INSERT INTO users (telegram_id, username, first_name) VALUES (?, ?, ?)")
      .run(telegram_id, username ?? null, first_name ?? null);
    return db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid) as User;
  },

  getByTelegramId(telegram_id: number): User | undefined {
    return db.prepare("SELECT * FROM users WHERE telegram_id = ?").get(telegram_id) as User | undefined;
  },

  updateStreak(userId: number): { streak: number; bumped: boolean } {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as User | undefined;
    if (!user) return { streak: 0, bumped: false };
    const today = new Date().toISOString().slice(0, 10);
    if (user.last_activity === today) return { streak: user.streak_days, bumped: false };
    let newStreak = 1;
    if (user.last_activity) {
      const last = new Date(user.last_activity);
      const diff = Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 1) newStreak = user.streak_days + 1;
      else if (diff === 0) newStreak = user.streak_days;
    }
    db.prepare("UPDATE users SET streak_days = ?, last_activity = ? WHERE id = ?").run(newStreak, today, userId);
    return { streak: newStreak, bumped: true };
  },
};

export const EventModel = {
  list(filters: { category?: string; district?: string; limit?: number; excludeSwipedBy?: number } = {}): EventRow[] {
    const where: string[] = [];
    const params: any[] = [];
    if (filters.category) { where.push("category = ?"); params.push(filters.category); }
    if (filters.district) { where.push("district = ?"); params.push(filters.district); }
    if (filters.excludeSwipedBy) {
      where.push("id NOT IN (SELECT event_id FROM swipes WHERE user_id = ?)");
      params.push(filters.excludeSwipedBy);
    }
    const sql = `SELECT * FROM events ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY start_time ASC LIMIT ?`;
    params.push(filters.limit ?? 50);
    return db.prepare(sql).all(...params) as EventRow[];
  },

  search(query: string, limit = 20): EventRow[] {
    const q = `%${query.toLowerCase()}%`;
    return db.prepare(`SELECT * FROM events WHERE LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category) LIKE ? OR LOWER(venue_name) LIKE ? ORDER BY start_time ASC LIMIT ?`)
      .all(q, q, q, q, limit) as EventRow[];
  },

  byId(id: number): EventRow | undefined {
    return db.prepare("SELECT * FROM events WHERE id = ?").get(id) as EventRow | undefined;
  },

  count(): number {
    const row = db.prepare("SELECT COUNT(*) as c FROM events").get() as { c: number };
    return row.c;
  },
};

export const SwipeModel = {
  save(userId: number, eventId: number, direction: "like" | "dislike") {
    db.prepare(`INSERT INTO swipes (user_id, event_id, direction) VALUES (?, ?, ?) ON CONFLICT(user_id, event_id) DO UPDATE SET direction = excluded.direction, swiped_at = CURRENT_TIMESTAMP`)
      .run(userId, eventId, direction);
  },
};

export const PlanModel = {
  add(userId: number, eventId: number) {
    db.prepare("INSERT OR IGNORE INTO user_plans (user_id, event_id) VALUES (?, ?)").run(userId, eventId);
  },
  remove(userId: number, eventId: number) {
    db.prepare("DELETE FROM user_plans WHERE user_id = ? AND event_id = ?").run(userId, eventId);
  },
  list(userId: number) {
    return db.prepare(`SELECT e.*, p.added_at, p.attended, p.id AS plan_id FROM user_plans p JOIN events e ON e.id = p.event_id WHERE p.user_id = ? ORDER BY e.start_time ASC`).all(userId);
  },
  markAttended(userId: number, eventId: number) {
    db.prepare("UPDATE user_plans SET attended = 1 WHERE user_id = ? AND event_id = ?").run(userId, eventId);
  },
  attendedFriendsCount(eventId: number): number {
    const row = db.prepare("SELECT COUNT(*) AS c FROM user_plans WHERE event_id = ?").get(eventId) as { c: number };
    return row.c;
  },
};

export const StatsModel = {
  forUser(userId: number) {
    const totalPlanned = (db.prepare("SELECT COUNT(*) AS c FROM user_plans WHERE user_id = ?").get(userId) as { c: number }).c;
    const totalAttended = (db.prepare("SELECT COUNT(*) AS c FROM user_plans WHERE user_id = ? AND attended = 1").get(userId) as { c: number }).c;
    const likes = (db.prepare("SELECT COUNT(*) AS c FROM swipes WHERE user_id = ? AND direction = 'like'").get(userId) as { c: number }).c;
    const categories = db.prepare(`SELECT e.category AS category, COUNT(*) AS n FROM user_plans p JOIN events e ON e.id = p.event_id WHERE p.user_id = ? GROUP BY e.category ORDER BY n DESC`).all(userId);
    return { totalPlanned, totalAttended, likes, categories };
  },
};

export const BadgeModel = {
  earn(userId: number, badgeId: string) {
    db.prepare("INSERT OR IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)").run(userId, badgeId);
  },
  list(userId: number) {
    return db.prepare("SELECT badge_id, earned_at FROM user_badges WHERE user_id = ?").all(userId);
  },
};