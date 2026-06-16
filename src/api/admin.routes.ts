import { Router, Response, NextFunction } from "express";
import { AdminEventModel, AdminEventInput } from "../database/models";
import { AuthedRequest } from "./routes";

const router = Router();

// Middleware: проверка админа (по Telegram ID)
function adminMiddleware() {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const adminId = process.env.ADMIN_TELEGRAM_ID;
    if (!adminId) {
      return res.status(500).json({ error: "ADMIN_TELEGRAM_ID not configured" });
    }
    if (String(req.telegramId) !== String(adminId)) {
      return res.status(403).json({ error: "admin_access_required" });
    }
    next();
  };
}

// GET /api/admin/events - Список всех событий (админка)
router.get("/events", (req: AuthedRequest, res) => {
  const events = AdminEventModel.listAll();
  res.json({ ok: true, events });
});

// GET /api/admin/events/:id - Получить событие по ID
router.get("/events/:id", (req: AuthedRequest, res) => {
  const id = parseInt(req.params.id);
  const event = AdminEventModel.byId(id);
  if (!event) return res.status(404).json({ error: "event_not_found" });
  res.json({ ok: true, event });
});

// POST /api/admin/events - Создать событие
router.post("/events", (req: AuthedRequest, res) => {
  try {
    const data: AdminEventInput = req.body || {};
    if (!data.title) {
      return res.status(400).json({ error: "title_is_required" });
    }
    const event = AdminEventModel.create(data);
    res.json({ ok: true, event });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/admin/events/:id - Обновить событие
router.put("/events/:id", (req: AuthedRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const data: AdminEventInput = req.body || {};
    const event = AdminEventModel.update(id, data);
    if (!event) return res.status(404).json({ error: "event_not_found" });
    res.json({ ok: true, event });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/admin/events/:id - Удалить событие
router.delete("/events/:id", (req: AuthedRequest, res) => {
  const id = parseInt(req.params.id);
  const deleted = AdminEventModel.delete(id);
  if (!deleted) return res.status(404).json({ error: "event_not_found" });
  res.json({ ok: true });
});

export { adminMiddleware };
export default router;
