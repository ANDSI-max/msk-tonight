import TelegramBot from "node-telegram-bot-api";
import { UserModel, StatsModel, EventModel } from "../database/models";

function webappUrl(): string {
  return process.env.WEBAPP_URL || process.env.WEBHOOK_URL || "https://example.com";
}

function openAppKeyboard(extraParam?: string): TelegramBot.InlineKeyboardMarkup {
  const url = extraParam ? `${webappUrl()}?startapp=${encodeURIComponent(extraParam)}` : webappUrl();
  return {
    inline_keyboard: [
      [{ text: "🚀 Открыть МСК.Tonight", web_app: { url } }],
    ],
  };
}

export function registerCommands(bot: TelegramBot) {
  bot.onText(/^\/start(?:\s+(.+))?$/, async (msg, match) => {
    const from = msg.from;
    if (!from) return;

    const user = UserModel.upsert(from.id, from.username ?? null, from.first_name ?? null);
    const payload = (match?.[1] ?? "").trim();

    const greeting =
      `Привет, ${user.first_name ?? "друг"}! 👋\n\n` +
      `Это <b>МСК.Tonight</b> — твой гид по вечерней Москве.\n\n` +
      `🎭 Свайпай события, как в Tinder\n` +
      `📅 Сохраняй в личный план\n` +
      `🔥 Держи серию посещений и собирай значки\n\n` +
      `Нажми кнопку ниже, чтобы открыть приложение.`;

    let reply_markup: TelegramBot.InlineKeyboardMarkup;
    if (payload.startsWith("event_")) {
      // Глубокая ссылка на конкретное событие
      reply_markup = openAppKeyboard(payload);
    } else {
      reply_markup = openAppKeyboard();
    }

    await bot.sendMessage(msg.chat.id, greeting, {
      parse_mode: "HTML",
      reply_markup,
    });
  });

  bot.onText(/^\/help$/, async (msg) => {
    const text =
      `<b>Команды бота:</b>\n` +
      `/start — открыть приложение\n` +
      `/tonight — события сегодня\n` +
      `/stats — твоя статистика\n` +
      `/help — эта справка\n\n` +
      `<b>Inline-поиск:</b> в любом чате напиши\n` +
      `<code>@${(await bot.getMe()).username} джаз</code>\n` +
      `и поделись событием с друзьями.`;
    await bot.sendMessage(msg.chat.id, text, { parse_mode: "HTML" });
  });

  bot.onText(/^\/tonight$/, async (msg) => {
    const events = EventModel.list({ limit: 5 });
    if (events.length === 0) {
      await bot.sendMessage(msg.chat.id, "Сегодня событий пока нет 😴");
      return;
    }
    const lines = events.map(
      (e, i) =>
        `${i + 1}. <b>${escapeHtml(e.title)}</b>\n` +
        `   📍 ${escapeHtml(e.venue_name ?? "")} · ${escapeHtml(e.district ?? "")}\n` +
        `   💰 ${formatPrice(e.price_min, e.price_max)}`
    );
    await bot.sendMessage(
      msg.chat.id,
      `<b>🌃 Топ-5 событий сегодня:</b>\n\n${lines.join("\n\n")}`,
      { parse_mode: "HTML", reply_markup: openAppKeyboard() }
    );
  });

  bot.onText(/^\/stats$/, async (msg) => {
    if (!msg.from) return;
    const user = UserModel.upsert(msg.from.id, msg.from.username ?? null, msg.from.first_name ?? null);
    const s = StatsModel.forUser(user.id);
    const topCat = (s.categories[0] as any)?.category ?? "—";
    const text =
      `<b>📊 Твоя статистика</b>\n\n` +
      `🔥 Серия: <b>${user.streak_days}</b> дн.\n` +
      `📅 В плане: <b>${s.totalPlanned}</b>\n` +
      `✅ Посещено: <b>${s.totalAttended}</b>\n` +
      `❤️ Лайков: <b>${s.likes}</b>\n` +
      `🏆 Любимая категория: <b>${escapeHtml(translateCat(topCat))}</b>`;
    await bot.sendMessage(msg.chat.id, text, {
      parse_mode: "HTML",
      reply_markup: openAppKeyboard(),
    });
  });
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
}

export function formatPrice(min: number | null, max: number | null): string {
  if (!min && !max) return "Бесплатно";
  if (min === max || !max) return `${min}₽`;
  if (!min) return `до ${max}₽`;
  return `${min}–${max}₽`;
}

export function translateCat(cat: string | null | undefined): string {
  switch (cat) {
    case "concert":    return "Концерты";
    case "theater":    return "Театр";
    case "bar":        return "Бары";
    case "club":       return "Клубы";
    case "exhibition": return "Выставки";
    default:           return cat ?? "—";
  }
}