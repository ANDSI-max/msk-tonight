import { EventModel, PlanModel, StatsModel, BadgeModel } from "../database/models";

export interface BadgeDef {
  id: string;
  title: string;
  description: string;
  emoji: string;
  check: (s: ReturnType<typeof StatsModel.forUser>, streakDays: number) => boolean;
}

export const BADGES: BadgeDef[] = [
  { id: "first_step",   title: "Первый шаг",   description: "Добавил первое событие в план", emoji: "🌟", check: s => s.totalPlanned >= 1 },
  { id: "streak_5",     title: "В клубе пятёрочка", description: "5 дней серии подряд",       emoji: "🔥", check: (_, st) => st >= 5 },
  { id: "streak_10",    title: "Десятка",      description: "10 дней серии подряд",          emoji: "💫", check: (_, st) => st >= 10 },
  { id: "theatre_fan",  title: "Театрал",      description: "5+ театральных событий",        emoji: "🎭", check: s => (s.categories.find((c: any) => c.category === "theater")?.n ?? 0) >= 5 },
  { id: "bar_expert",   title: "Знаток баров", description: "5+ баров в плане",              emoji: "🍸", check: s => (s.categories.find((c: any) => c.category === "bar")?.n ?? 0) >= 5 },
  { id: "concert_lover",title: "Концертоман", description: "5+ концертов",                   emoji: "🎸", check: s => (s.categories.find((c: any) => c.category === "concert")?.n ?? 0) >= 5 },
  { id: "art_hunter",   title: "Охотник за искусством", description: "3+ выставки",          emoji: "🖼️", check: s => (s.categories.find((c: any) => c.category === "exhibition")?.n ?? 0) >= 3 },
  { id: "club_hero",    title: "Танцор",       description: "3+ клубных вечеринки",          emoji: "🕺", check: s => (s.categories.find((c: any) => c.category === "club")?.n ?? 0) >= 3 },
];

export function recalcBadges(userId: number, streakDays: number): string[] {
  const stats = StatsModel.forUser(userId);
  const earned: string[] = [];
  for (const b of BADGES) {
    if (b.check(stats, streakDays)) {
      BadgeModel.earn(userId, b.id);
      earned.push(b.id);
    }
  }
  return earned;
}

export function getRecommendations(userId: number, limit = 30) {
  // 1) Берём предпочитаемые категории по лайкам
  const liked = require("../database/db").default
    .prepare(`
      SELECT e.category AS category, COUNT(*) AS n
      FROM swipes s JOIN events e ON e.id = s.event_id
      WHERE s.user_id = ? AND s.direction = 'like'
      GROUP BY e.category
      ORDER BY n DESC
    `)
    .all(userId) as { category: string; n: number }[];

  const events = EventModel.list({ excludeSwipedBy: userId, limit: 100 });

  if (liked.length === 0) return events.slice(0, limit);

  const scoreByCategory = new Map<string, number>();
  liked.forEach((l, i) => scoreByCategory.set(l.category, liked.length - i));

  events.sort((a, b) => {
    const sa = scoreByCategory.get(a.category ?? "") ?? 0;
    const sb = scoreByCategory.get(b.category ?? "") ?? 0;
    return sb - sa;
  });
  return events.slice(0, limit);
}

export { EventModel, PlanModel, StatsModel };