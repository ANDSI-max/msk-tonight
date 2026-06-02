import crypto from "crypto";

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface ValidatedInitData {
  ok: boolean;
  user?: TelegramUser;
  auth_date?: number;
  hash?: string;
  raw?: Record<string, string>;
}

/**
 * Проверяем подпись initData по алгоритму Telegram.
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateInitData(initData: string, botToken: string): ValidatedInitData {
  if (!initData) return { ok: false };

  const params = new URLSearchParams(initData);
  const data: Record<string, string> = {};
  params.forEach((value, key) => { data[key] = value; });

  const hash = data.hash;
  if (!hash) return { ok: false };
  delete data.hash;

  const dataCheckString = Object.keys(data)
    .sort()
    .map((k) => `${k}=${data[k]}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const calcHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (calcHash !== hash) return { ok: false };

  let user: TelegramUser | undefined;
  if (data.user) {
    try { user = JSON.parse(data.user); } catch { /* noop */ }
  }
  return {
    ok: true,
    user,
    auth_date: data.auth_date ? Number(data.auth_date) : undefined,
    hash,
    raw: data,
  };
}