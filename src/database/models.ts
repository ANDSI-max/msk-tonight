import { Database, Statement } from "sql.js";
import { getDb } from "./db";

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

function runQuery<T = any>(sql: string, params: any[] = []): T[] {
  const db = getDb();
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as unknown as T);
  }
  stmt.free();
  return results;
}

function runOne<T = any>(sql: string, params: any[] = []): T | undefined {
  const results = runQuery<T>(sql, params);
  return results[0];
}

function exec(sql: string, params: any[] = []): void {
  const db = getDb();
  if (params.length > 0) {
    db.run(sql, params);
  } else {
    db.run(sql);
  }
}

export const UserModel = {
  upsert(telegram_id: number, username?: string | null, first_name?: string | null): User {
    const existing = runOne<User>("SELECT * FROM users WHERE telegram_id = ?", [telegram_id]);
    if (existing) {
      exec(
        "UPDATE users SET username = COALESCE(?, username), first_name = COALESCE(?, first_name) WHERE telegram_id = ?",
        [username ?? null, first_name ?? null, telegram_id]
      );
      return runOne<User>("SELECT * FROM users WHERE telegram_id = ?", [telegram_id])!;
    }
    exec(
      "INSERT INTO users (telegram_id, username, first_name) VALUES (?, ?, ?)",
      [telegram_id, username ?? null, first_name ?? null]
    );
    return runOne<User>("SELECT * FROM users WHERE telegram_id = ?", [telegram_id])!;
  },

  getByTelegramId(telegram_id: number): User | undefined {
    return runOne<User>("SELECT * FROM users WHERE telegram_id = ?", [telegram_id]);
  },

  updateStreak(userId: number): { streak: number; bumped: boolean } {
    const user = runOne<User>("SELECT * FROM users WHERE id = ?", [userId]);
    if (!user) return { streak: 0, bumped: false };

    const today = new Date().toISOString().slice(0, 10);
    if (user.last_activity === today) {
      return { streak: user.streak_days, bumped: false };
    }
    let newStreak = 1;
    if (user.last_activity) {
      const last = new Date(user.last_activity);
      const diff = Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 1) newStreak = user.streak_days + 1;
      else if (diff === 0) newStreak = user.streak_days;
    }
    exec("UPDATE users SET streak_days = ?, last_activity = ? WHERE id = ?", [newStreak, today, userId]);
    return { streak: newStreak, bumped: true };
  },
};

export const EventModel = {
  list(filters: {
    category?: string;
    district?: string;
    timeFrom?: string;
    timeTo?: string;
    limit?: number;
    excludeSwipedBy?: number;
  } = {}): EventRow[] {
    const where: string[] = [];
    const params: any[] = [];

    if (filters.category) { where.push("category = ?"); params.push(filters.category); }
    if (filters.district) { where.push("district = ?"); params.push(filters.district); }
    if (filters.timeFrom) { where.push("start_time >= ?"); params.push(filters.timeFrom); }
    if (filters.timeTo) { where.push("start_time <= ?"); params.push(filters.timeTo); }
    if (filters.excludeSwipedBy) {
      where.push("id NOT IN (SELECT event_id FROM swipes WHERE user_id = ?)");
      params.push(filters.excludeSwipedBy);
    }

    const sql = `SELECT * FROM events ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY start_time ASC LIMIT ?`;
    params.push(filters.limit ?? 50);
    return runQuery<EventRow>(sql, params);
  },

  search(query: string, limit = 20): EventRow[] {
    const q = `%${query.toLowerCase()}%`;
    return runQuery<EventRow>(
      `SELECT * FROM events
       WHERE LOWER(title) LIKE ? OR LOWER(description) LIKE ?
          OR LOWER(category) LIKE ? OR LOWER(venue_name) LIKE ?
       ORDER BY start_time ASC LIMIT ?`,
      [q, q, q, q, limit]
    );
  },

  byId(id: number): EventRow | undefined {
    return runOne<EventRow>("SELECT * FROM events WHERE id = ?", [id]);
  },

  count(): number {
    const row = runOne<{ c: number }>("SELECT COUNT(*) as c FROM events");
    return row?.c ?? 0;
  },
};

export const SwipeModel = {
  save(userId: number, eventId: number, direction: "like" | "dislike") {
    exec(
      `INSERT INTO swipes (user_id, event_id, direction) VALUES (?, ?, ?)
       ON CONFLICT(user_id, event_id) DO UPDATE SET direction = excluded.direction, swiped_at = CURRENT_TIMESTAMP`,
      [userId, eventId, direction]
    );
  },
};

export const PlanModel = {
  add(userId: number, eventId: number) {
    exec("INSERT OR IGNORE INTO user_plans (user_id, event_id) VALUES (?, ?)", [userId, eventId]);
  },

  remove(userId: number, eventId: number) {
    exec("DELETE FROM user_plans WHERE user_id = ? AND event_id = ?", [userId, eventId]);
  },

  list(userId: number) {
    return runQuery(
      `SELECT e.*, p.added_at, p.attended, p.id AS plan_id
       FROM user_plans p
       JOIN events e ON e.id = p.event_id
       WHERE p.user_id = ?
       ORDER BY e.start_time ASC`,
      [userId]
    );
  },

  markAttended(userId: number, eventId: number) {
    exec("UPDATE user_plans SET attended = 1 WHERE user_id = ? AND event_id = ?", [userId, eventId]);
  },

  attendedFriendsCount(eventId: number): number {
    const row = runOne<{ c: number }>("SELECT COUNT(*) AS c FROM user_plans WHERE event_id = ?", [eventId]);
    return row?.c ?? 0;
  },
};

export const StatsModel = {
  forUser(userId: number) {
    const totalPlanned = runOne<{ c: number }>(
      "SELECT COUNT(*) AS c FROM user_plans WHERE user_id = ?",
      [userId]
    )?.c ?? 0;

    const totalAttended = runOne<{ c: number }>(
      "SELECT COUNT(*) AS c FROM user_plans WHERE user_id = ? AND attended = 1",
      [userId]
    )?.c ?? 0;

    const likes = runOne<{ c: number }>(
      "SELECT COUNT(*) AS c FROM swipes WHERE user_id = ? AND direction = 'like'",
      [userId]
    )?.c ?? 0;

    const categories = runQuery(
      `SELECT e.category AS category, COUNT(*) AS n
       FROM user_plans p JOIN events e ON e.id = p.event_id
       WHERE p.user_id = ?
       GROUP BY e.category
       ORDER BY n DESC`,
      [userId]
    );

    return { totalPlanned, totalAttended, likes, categories };
  },
};

export const BadgeModel = {
  earn(userId: number, badgeId: string) {
    exec("INSERT OR IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)", [userId, badgeId]);
  },
  list(userId: number) {
    return runQuery<{ badge_id: string; earned_at: string }>(
      "SELECT badge_id, earned_at FROM user_badges WHERE user_id = ?",
      [userId]
    );
  },
};