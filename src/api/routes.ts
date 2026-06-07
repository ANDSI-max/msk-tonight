import { Router, Request, Response, NextFunction } from "express";
import { validateInitData } from "./auth";
import {
  EventModel,
  PlanModel,
  StatsModel,
  SwipeModel,
  UserModel,
  BadgeModel, BookingModel,
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
  const bookingStats = BookingModel.stats(req.userId!);
  const earnedBadges = BadgeModel.list(req.userId!) as { badge_id: string; earned_at: string }[];
  const badges = BADGES.map((b) => ({
    ...b,
    earned: earnedBadges.some((e) => e.badge_id === b.id),
    earned_at: earnedBadges.find((e) => e.badge_id === b.id)?.earned_at ?? null,
  }));
  res.json({ ok: true, user, stats, badges, booking_stats: bookingStats });
});


// GET /api/bookings - ������ ������������
router.get("/bookings", authMiddleware(false), (req: AuthedRequest, res) => {
  const bookings = BookingModel.list(req.userId!);
  const stats = BookingModel.stats(req.userId!);
  res.json({ ok: true, bookings, stats });
});

// POST /api/bookings/create - ������� ������������
router.post("/bookings/create", authMiddleware(false), (req: AuthedRequest, res) => {
  const { event_id, ticket_count } = req.body || {};
  if (!event_id) return res.status(400).json({ error: "event_id required" });
  
  const event = EventModel.byId(Number(event_id));
  if (!event) return res.status(404).json({ error: "event not found" });
  
  const tickets = Number(ticket_count) || 1;
  const totalPrice = (event.price_min || 0) * tickets;
  
  const booking = BookingModel.create(req.userId!, Number(event_id), tickets, totalPrice, event.external_url || undefined);
  
  // ��� ������ �� ������ ������������
  const stats = BookingModel.stats(req.userId!);
  if (stats.totalBookings === 1) {
    BadgeModel.earn(req.userId!, "first_booking");
  }
  
  res.json({ ok: true, booking });
});

// POST /api/bookings/cancel - �������� ������������
router.post("/bookings/cancel", authMiddleware(false), (req: AuthedRequest, res) => {
  const { booking_id } = req.body || {};
  if (!booking_id) return res.status(400).json({ error: "booking_id required" });
  
  BookingModel.cancel(req.userId!, Number(booking_id));
  res.json({ ok: true });
});

// POST /api/bookings/use - �������� �������������
router.post("/bookings/use", authMiddleware(false), (req: AuthedRequest, res) => {
  const { booking_id } = req.body || {};
  if (!booking_id) return res.status(400).json({ error: "booking_id required" });
  
  BookingModel.markUsed(req.userId!, Number(booking_id));
  
  // ��������� streak � ������
  const { streak } = UserModel.updateStreak(req.userId!);
  const earned = recalcBadges(req.userId!, streak);
  
  res.json({ ok: true, streak, earned });
});

// GET /api/map - события на карте с координатами
router.get("/map", authMiddleware(true), (req: AuthedRequest, res) => {
  const { date } = req.query as Record<string, string>;
  
  // Если дата не указана, берём сегодня
  let filterDate = new Date();
  if (date) {
    filterDate = new Date(date);
  }
  
  const todayStart = new Date(filterDate);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(filterDate);
  todayEnd.setHours(23, 59, 59, 999);
  
  const events = EventModel.list({
    limit: 100,
  }) as any[];
  
  // Фильтруем события по дате (если есть start_time)
  const filtered = events.filter(e => {
    if (!e.start_time) return true;
    const eventDate = new Date(e.start_time);
    return eventDate >= todayStart && eventDate <= todayEnd;
  });
  
  // Возвращаем только события с координатами
  const withCoords = filtered.filter(e => e.lat && e.lng).map(e => ({
    id: e.id,
    title: e.title,
    category: e.category,
    price_min: e.price_min,
    start_time: e.start_time,
    lat: e.lat,
    lng: e.lng,
    venue_name: e.venue_name,
  }));
  
  res.json({ ok: true, events: withCoords, date: filterDate.toISOString() });
});

export default router;