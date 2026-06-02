import TelegramBot from "node-telegram-bot-api";
import { EventModel } from "../database/models";
import { escapeHtml, formatPrice, translateCat } from "./commands";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  concert:    ["концерт", "музыка", "джаз", "рок", "indie", "инди", "electronic", "электрон", "хип-хоп", "rap", "рэп", "metal", "reggae", "регги", "техно"],
  theater:    ["театр", "спектакль", "балет", "опера", "стендап", "standup", "комедия", "пьеса", "драма"],
  bar:        ["бар", "коктейл", "вино", "виски", "пиво", "крафт", "tequila", "текила", "караоке", "наливк"],
  club:       ["клуб", "вечеринка", "rave", "рейв", "танц", "диско", "house", "techno", "drum", "dnb", "kpop"],
  exhibition: ["выставк", "музей", "арт", "галере", "искусств", "фото", "скульптур", "стрит"],
};

function detectCategory(q: string): string | undefined {
  const lower = q.toLowerCase();
  for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) return cat;
  }
  return undefined;
}

export function registerInline(bot: TelegramBot) {
  bot.on("inline_query", async (q) => {
    const text = (q.query || "").trim();

    let events;
    if (!text) {
      events = EventModel.list({ limit: 20 });
    } else {
      const cat = detectCategory(text);
      if (cat) {
        events = EventModel.list({ category: cat, limit: 20 });
      } else {
        events = EventModel.search(text, 20);
      }
    }

    const me = await bot.getMe();
    const botUsername = me.username || "msk_tonight_bot";

    const results: TelegramBot.InlineQueryResultArticle[] = events.map((e, i) => {
      const startLink = `https://t.me/${botUsername}?start=event_${e.id}`;
      const description =
        `${translateCat(e.category)} · ${e.venue_name ?? ""}\n` +
        `${formatPrice(e.price_min, e.price_max)} · ${e.district ?? ""}`;

      return {
        type: "article",
        id: String(e.id) + "_" + i,
        title: e.title,
        description,
        thumb_url: e.image_url ?? undefined,
        input_message_content: {
          message_text:
            `<b>${escapeHtml(e.title)}</b>\n` +
            `🎭 ${escapeHtml(translateCat(e.category))}\n` +
            `📍 ${escapeHtml(e.venue_name ?? "")} · ${escapeHtml(e.district ?? "")}\n` +
            `💰 ${escapeHtml(formatPrice(e.price_min, e.price_max))}\n\n` +
            `${escapeHtml(e.description ?? "")}\n\n` +
            `Кто со мной? 🙌`,
          parse_mode: "HTML",
        },
        reply_markup: {
          inline_keyboard: [
            [{ text: "🎟 Присоединиться", url: startLink }],
          ],
        },
      };
    });

    try {
      await bot.answerInlineQuery(q.id, results, {
        cache_time: 60,
        is_personal: false,
      });
    } catch (e: any) {
      console.error("[inline] answer error:", e?.message ?? e);
    }
  });
}