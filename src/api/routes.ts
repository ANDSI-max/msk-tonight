import { Router, Request, Response, NextFunction } from "express";
import { validateInitData } from "./auth";
import {
  EventModel,
  PlanModel,
  StatsModel,
  SwipeModel,
  UserModel,
  BadgeModel,
} from "../database/models";
import { recalcBadges, getRecommendations, BADGES } from "./events";

const router = Router();

interface AuthedRequest extends Request {
  userId?: number;
  telegramId?: number;
}

// Middleware: достаём userId из initData (заголовок X-Telegram-Init-Data)
function authMiddleware(allowEmpty = false) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const initData =
      (req.header("x-telegram-init-data") as string) ||
      (req.body && (req.body.initData as string)) ||
      "";

    const token = process.env.BOT_TOKEN || "";

    // Режим разработки: если BOT_TOKEN не задан или initData нет, но allowEmpty,
    // пропускаем под фейковым пользователем (только локально).
    if (!token || !initData) {
      if (allowEmpty || process.env.NODE_ENV !== "production") {
        const fake = UserModel.upsert(0, "dev", "Dev");
        req.userId = fake.id;
        req.telegramId = 0;
        return next();
      }
      return res.status(401).json({ error: "unauthorized" });
    }

    const v = validateInitData(initData, token);
    if (!v.ok || !v.user) return res.status(401).json({ error: "invalid_init_data" });

    const user = UserModel.upsert(v.user.id, v.user.username ?? null, v.user.first_name ?? null);
    req.userId = user.id;
    req.telegramId = v.user.id;
    next();
  };
}

// POST /api/auth — валидация и регистрация пользователя
router.post("/auth", authMiddleware(false), (req: AuthedRequest, res) => {
  const user = UserModel.getByTelegramId(req.telegramId!);
  res.json({ ok: true, user });
});

// GET /api/events?category=...&district=...&limit=...
router.get("/events", authMiddleware(true), (req: AuthedRequest, res) => {
  const { category, district, limit, mode } = req.query as Record<string, string>;
  let events;
  if (mode === "recommended") {
    events = getRecommendations(req.userId!, Number(limit) || 30);
  } else {
    events = EventModel.list({
      category,
      district,
      excludeSwipedBy: req.userId,
      limit: Number(limit) || 30,
    });
  }
  res.json({ ok: true, events });
});

// POST /api/events/swipe { event_id, direction }
router.post("/events/swipe", authMiddleware(false), (req: AuthedRequest, res) => {
  const { event_id, direction } = req.body || {};
  if (!event_id || !["like", "dislike"].includes(direction)) {
    return res.status(400).json({ error: "bad_request" });
  }
  SwipeModel.save(req.userId!, Number(event_id), direction);
  // При лайке автоматически добавляем в план
  if (direction === "like") {
    PlanModel.add(req.userId!, Number(event_id));
  }
  res.json({ ok: true });
});

// POST /api/plan/add { event_id }
router.post("/plan/add", authMiddleware(false), (req: AuthedRequest, res) => {
  const { event_id } = req.body || {};
  if (!event_id) return res.status(400).json({ error: "bad_request" });
  PlanModel.add(req.userId!, Number(event_id));
  res.json({ ok: true });
});

// POST /api/plan/remove { event_id }
router.post("/plan/remove", authMiddleware(false), (req: AuthedRequest, res) => {
  const { event_id } = req.body || {};
  if (!event_id) return res.status(400).json({ error: "bad_request" });
  PlanModel.remove(req.userId!, Number(event_id));
  res.json({ ok: true });
});

// GET /api/plan
router.get("/plan", authMiddleware(false), (req: AuthedRequest, res) => {
  const items = PlanModel.list(req.userId!) as any[];
  // Подсчёт "друзья идут"
  const withFriends = items.map((it) => ({
    ...it,
    friends_count: PlanModel.attendedFriendsCount(it.event_id),
  }));
  res.json({ ok: true, plan: withFriends });
});

// POST /api/plan/attend { event_id }
router.post("/plan/attend", authMiddleware(false), (req: AuthedRequest, res) => {
  const { event_id } = req.body || {};
  if (!event_id) return res.status(400).json({ error: "bad_request" });
  PlanModel.markAttended(req.userId!, Number(event_id));
  const { streak } = UserModel.updateStreak(req.userId!);
  const earned = recalcBadges(req.userId!, streak);
  res.json({ ok: true, streak, earned });
});

// GET /api/profile
router.get("/profile", authMiddleware(false), (req: AuthedRequest, res) => {
  const user = UserModel.getByTelegramId(req.telegramId!) ??
               { id: req.userId, streak_days: 0, first_name: "Dev" };
  const stats = StatsModel.forUser(req.userId!);
  const earnedBadges = BadgeModel.list(req.userId!) as { badge_id: string; earned_at: string }[];
  const badges = BADGES.map((b) => ({
    ...b,
    earned: earnedBadges.some((e) => e.badge_id === b.id),
    earned_at: earnedBadges.find((e) => e.badge_id === b.id)?.earned_at ?? null,
  }));
  res.json({ ok: true, user, stats, badges });
});

export default router;