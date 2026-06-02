import TelegramBot from "node-telegram-bot-api";
import { registerCommands } from "./commands";
import { registerInline } from "./inline";

let bot: TelegramBot | null = null;

export function getBot(): TelegramBot | null {
  return bot;
}

export interface StartBotOptions {
  port: number;
  webhookPath: string;
}

export async function startBot(opts: StartBotOptions): Promise<void> {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    console.warn("[bot] BOT_TOKEN не задан, бот не запущен. API будет работать.");
    return;
  }

  const webhookUrl = process.env.WEBHOOK_URL;

  if (webhookUrl) {
    // Webhook режим: бот не делает polling, обновления приходят через handleWebhookUpdate
    bot = new TelegramBot(token, { webHook: false, polling: false });
    const url = webhookUrl.replace(/\/+$/, "") + opts.webhookPath;
    try {
      await bot.setWebHook(url, { allowed_updates: ["message", "callback_query", "inline_query"] });
      console.log(`[bot] Webhook установлен: ${url}`);
    } catch (e) {
      console.error("[bot] Не удалось установить webhook:", e);
    }
  } else {
    // Polling режим (удобно локально)
    bot = new TelegramBot(token, { polling: true });
    try { await bot.deleteWebHook(); } catch { /* noop */ }
    console.log("[bot] Запущен в polling-режиме.");
  }

  registerCommands(bot);
  registerInline(bot);

  bot.on("polling_error", (err) => console.error("[bot] polling_error:", err.message));
  bot.on("webhook_error", (err) => console.error("[bot] webhook_error:", err.message));
}

export function handleWebhookUpdate(update: any): void {
  if (!bot) return;
  bot.processUpdate(update);
}

export async function stopBot(): Promise<void> {
  if (!bot) return;
  try {
    if (process.env.WEBHOOK_URL) {
      await bot.deleteWebHook();
      console.log("[bot] Webhook удалён.");
    } else {
      await bot.stopPolling();
      console.log("[bot] Polling остановлен.");
    }
  } catch (e) {
    console.error("[bot] Ошибка остановки:", e);
  }
}