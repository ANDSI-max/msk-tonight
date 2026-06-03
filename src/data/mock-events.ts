export type MockCategory =
  | "concert"
  | "theater"
  | "bar"
  | "club"
  | "exhibition";

export interface MockEvent {
  title: string;
  description: string;
  category: MockCategory;
  venue_name: string;
  address: string;
  district: string;
  start_time: string; // ISO 8601 РґР°С‚Р° РЅР°С‡Р°Р»Р°
  duration_hours: number;
  price_min: number;
  price_max: number;
  image_url: string;
  external_url: string;
  lat: number; // РЁРёСЂРѕС‚Р°
  lng: number; // Р”РѕР»РіРѕС‚Р°
}

// Р“РµРЅРµСЂРёСЂСѓРµРј РґР°С‚Сѓ РЅР° СЃРµРіРѕРґРЅСЏ
const today = new Date();
today.setHours(19, 0, 0, 0);

const inHours = (h: number) => {
  const d = new Date(today);
  d.setHours(d.getHours() + h);
  return d.toISOString();
};

// РљР°СЂС‚РёРЅРєРё СЃ Unsplash
const img = (cat: string) => `https://placehold.co/800x600/${cat === "concert" ? "ff6b6b" : cat === "theater" ? "4ecdc4" : cat === "bar" ? "ffe66d" : cat === "club" ? "1a535c" : "f7fff7"}/ffffff?text=EVENT`;

export const MOCK_EVENTS: MockEvent[] = [
  // РљРѕРЅС†РµСЂС‚С‹
  { 
    title: " Mumiy Troll РІ Crocus City Hall", 
    description: "Р‘РѕР»СЊС€РѕР№ СЃРѕР»СЊРЅС‹Р№ РєРѕРЅС†РµСЂС‚ Р»РµРіРµРЅРґР°СЂРЅРѕР№ РіСЂСѓРїРїС‹", 
    category: "concert", 
    venue_name: "Crocus City Hall", 
    address: "65-66 РєРј РњРљРђР”, РљСЂР°СЃРЅРѕРіРѕСЂСЃРє", 
    district: "РљСЂР°СЃРЅРѕРіРѕСЂСЃРє", 
    start_time: inHours(0), 
    duration_hours: 3, 
    price_min: 3500, 
    price_max: 12000, 
    image_url: img("1501453798875-94eb9513ff4c"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.8194,
    lng: 37.4028
  },
  { 
    title: "Р”Р¶Р°Р·-СЃРµС‚ РІ 16 С‚РѕРЅРЅ", 
    description: "РЈСЋС‚РЅС‹Р№ РІРµС‡РµСЂ Р¶РёРІРѕРіРѕ РґР¶Р°Р·Р°", 
    category: "concert", 
    venue_name: "16 С‚РѕРЅРЅ", 
    address: "СѓР». РџСЂРµСЃРЅРµРЅСЃРєРёР№ Р’Р°Р», 6СЃ1", 
    district: "РџСЂРµСЃРЅРµРЅСЃРєРёР№", 
    start_time: inHours(1), 
    duration_hours: 3, 
    price_min: 1500, 
    price_max: 2500, 
    image_url: img("1511198650316-37d7e5de30ca"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7558,
    lng: 37.5672
  },
  { 
    title: "Indie-РІРµС‡РµСЂ РІ Рђ2", 
    description: "РњРѕР»РѕРґС‹Рµ СЂРѕСЃСЃРёР№СЃРєРёРµ РёРЅРґРё-РіСЂСѓРїРїС‹", 
    category: "concert", 
    venue_name: "РљР»СѓР± Рђ2", 
    address: "Р—РІРµРЅРёРіРѕСЂРѕРґСЃРєРѕРµ С€., 18/20", 
    district: "РџСЂРµСЃРЅРµРЅСЃРєРёР№", 
    start_time: inHours(2), 
    duration_hours: 4, 
    price_min: 1200, 
    price_max: 3000, 
    image_url: img("1459691118739-eec412e48e95"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7595,
    lng: 37.5535
  },
  { 
    title: "РЎРёРјС„РѕРЅРёС‡РµСЃРєРёР№ РѕСЂРєРµСЃС‚СЂ РІ Р—Р°СЂСЏРґСЊРµ", 
    description: "Р§Р°Р№РєРѕРІСЃРєРёР№. РЎРёРјС„РѕРЅРёСЏ в„–6", 
    category: "concert", 
    venue_name: "Р—Р°СЂСЏРґСЊРµ", 
    address: "СѓР». Р’Р°СЂРІР°СЂРєР°, 6СЃ1", 
    district: "РўРІРµСЂСЃРєРѕР№", 
    start_time: inHours(0), 
    duration_hours: 2, 
    price_min: 2500, 
    price_max: 8000, 
    image_url: img("1514194111488-47e8a69286aa"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7514,
    lng: 37.6281
  },
  { 
    title: "Electronic Live РІ Powerhouse", 
    description: "Р­Р»РµРєС‚СЂРѕРЅРёРєР°, СЃРёРЅС‚РІРµР№РІ, Р»Р°Р№РІ-СЃРµС‚", 
    category: "concert", 
    venue_name: "Powerhouse", 
    address: "СѓР». РќРѕРІРѕРґРјРёС‚СЂРѕРІСЃРєР°СЏ, 5СЃ2", 
    district: "Р‘СѓС‚С‹СЂСЃРєРёР№", 
    start_time: inHours(3), 
    duration_hours: 4, 
    price_min: 1500, 
    price_max: 2500, 
    image_url: img("1470252649783-076681d688f5"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7961,
    lng: 37.6156
  },
  { 
    title: "РҐРёРї-С…РѕРї РЅР° Adrenaline Stadium", 
    description: "Р‘РѕР»СЊС€РѕР№ open air С…РёРї-С…РѕРї С„РµСЃС‚", 
    category: "concert", 
    venue_name: "Adrenaline Stadium", 
    address: "Р›РµРЅРёРЅРіСЂР°РґСЃРєРёР№ РїСЂ-С‚, 80Рє17", 
    district: "РђСЌСЂРѕРїРѕСЂС‚", 
    start_time: inHours(1), 
    duration_hours: 5, 
    price_min: 2500, 
    price_max: 6000, 
    image_url: img("1459691118739-eec412e48e95"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.8069,
    lng: 37.5297
  },

  // РўРµР°С‚СЂ
  { 
    title: "Р“Р°РјР»РµС‚ РІРѕ РњРҐРў РёРј. Р§РµС…РѕРІР°", 
    description: "РљР»Р°СЃСЃРёС‡РµСЃРєР°СЏ РїРѕСЃС‚Р°РЅРѕРІРєР° СЃ СЃРѕРІСЂРµРјРµРЅРЅС‹Рј Р°РєС†РµРЅС‚РѕРј", 
    category: "theater", 
    venue_name: "РњРҐРў РёРј. Р§РµС…РѕРІР°", 
    address: "РљР°РјРµСЂРіРµСЂСЃРєРёР№ РїРµСЂ., 3", 
    district: "РўРІРµСЂСЃРєРѕР№", 
    start_time: inHours(0), 
    duration_hours: 3, 
    price_min: 1500, 
    price_max: 8000, 
    image_url: img("1503095628777-9a9d6a951ef3"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7592,
    lng: 37.6136
  },
  { 
    title: "Р§Р°Р№РєР° РІ РЎРѕРІСЂРµРјРµРЅРЅРёРєРµ", 
    description: "Р§РµС…РѕРІ РІ РЅРѕРІРѕР№ СЂРµР¶РёСЃСЃС‘СЂСЃРєРѕР№ РІРµСЂСЃРёРё", 
    category: "theater", 
    venue_name: "РЎРѕРІСЂРµРјРµРЅРЅРёРє", 
    address: "Р§РёСЃС‚РѕРїСЂСѓРґРЅС‹Р№ Р±СѓР»СЊРІР°СЂ, 19Рђ", 
    district: "Р‘Р°СЃРјР°РЅРЅС‹Р№", 
    start_time: inHours(0), 
    duration_hours: 3, 
    price_min: 1200, 
    price_max: 6000, 
    image_url: img("1507293871303-9a423b27f6b8"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7644,
    lng: 37.6503
  },
  { 
    title: "РњР°СЃС‚РµСЂ Рё РњР°СЂРіР°СЂРёС‚Р° РЅР° РўР°РіР°РЅРєРµ", 
    description: "Р—РЅР°РјРµРЅРёС‚Р°СЏ РїРѕСЃС‚Р°РЅРѕРІРєР° РїРѕ Р‘СѓР»РіР°РєРѕРІСѓ", 
    category: "theater", 
    venue_name: "РўРµР°С‚СЂ РЅР° РўР°РіР°РЅРєРµ", 
    address: "СѓР». Р—РµРјР»СЏРЅРѕР№ Р’Р°Р», 76/21", 
    district: "РўР°РіР°РЅСЃРєРёР№", 
    start_time: inHours(0), 
    duration_hours: 3, 
    price_min: 1500, 
    price_max: 7000, 
    image_url: img("1514194111488-47e8a69286aa"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7435,
    lng: 37.6515
  },
  { 
    title: "Р‘Р°Р»РµС‚ Р›РµР±РµРґРёРЅРѕРµ РѕР·РµСЂРѕ РІ Р‘РѕР»СЊС€РѕРј", 
    description: "Р“Р»Р°РІРЅР°СЏ СЃС†РµРЅР° СЃС‚СЂР°РЅС‹", 
    category: "theater", 
    venue_name: "Р‘РѕР»СЊС€РѕР№ С‚РµР°С‚СЂ", 
    address: "РўРµР°С‚СЂР°Р»СЊРЅР°СЏ РїР»., 1", 
    district: "РўРІРµСЂСЃРєРѕР№", 
    start_time: inHours(0), 
    duration_hours: 3, 
    price_min: 3500, 
    price_max: 18000, 
    image_url: img("1516536936684-4a607e87f6a1"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7597,
    lng: 37.6178
  },

  // Р‘Р°СЂС‹
  { 
    title: "РљРѕРєС‚РµР№Р»СЊРЅР°СЏ РІРµС‡РµСЂРёРЅРєР° РІ Delicatessen", 
    description: "РђРІС‚РѕСЂСЃРєРёРµ РєРѕРєС‚РµР№Р»Рё РѕС‚ Р»СѓС‡С€РёС… Р±Р°СЂРјРµРЅРѕРІ", 
    category: "bar", 
    venue_name: "Delicatessen", 
    address: "СѓР». РћР»РёРјРїРёР№СЃРєРёР№ РїСЂРѕСЃРїРµРєС‚, 5СЃ3", 
    district: "РњРµС‰Р°РЅСЃРєРёР№", 
    start_time: inHours(2), 
    duration_hours: 4, 
    price_min: 1000, 
    price_max: 3000, 
    image_url: img("1514194111488-47e8a69286aa"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7839,
    lng: 37.6247
  },
  { 
    title: "Р’РёСЃРєРё-РґРµРіСѓСЃС‚Р°С†РёСЏ РІ Simple Wine Bar", 
    description: "Р”РµРіСѓСЃС‚Р°С†РёСЏ СЂРµРґРєРёС… С€РѕС‚Р»Р°РЅРґСЃРєРёС… РІРёСЃРєРё", 
    category: "bar", 
    venue_name: "Simple Wine Bar", 
    address: "СѓР». Р РѕР¶РґРµСЃС‚РІРµРЅРєР°, 12", 
    district: "РњРµС‰Р°РЅСЃРєРёР№", 
    start_time: inHours(1), 
    duration_hours: 2, 
    price_min: 2000, 
    price_max: 5000, 
    image_url: img("1516536936684-4a607e87f6a1"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7642,
    lng: 37.6253
  },

  // РљР»СѓР±С‹
  { 
    title: "Techno Night РІ Mutabor", 
    description: "Р›СѓС‡С€РёРµ С‚РµС…РЅРѕ-РґРёРґР¶РµРё РњРѕСЃРєРІС‹", 
    category: "club", 
    venue_name: "Mutabor", 
    address: "СѓР». РђРІРёР°РјРѕС‚РѕСЂРЅР°СЏ, 47СЃ3", 
    district: "Р›РµС„РѕСЂС‚РѕРІРѕ", 
    start_time: inHours(4), 
    duration_hours: 6, 
    price_min: 1000, 
    price_max: 2500, 
    image_url: img("1516536936684-4a607e87f6a1"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7381,
    lng: 37.7028
  },
  { 
    title: "House Party РІ Gazgolder", 
    description: "РҐР°СѓСЃ РјСѓР·С‹РєР° Рё С‚Р°РЅС†С‹ РґРѕ СѓС‚СЂР°", 
    category: "club", 
    venue_name: "Gazgolder", 
    address: "СѓР». РџСЏС‚РЅРёС†РєР°СЏ, 53", 
    district: "Р—Р°РјРѕСЃРєРІРѕСЂРµС‡СЊРµ", 
    start_time: inHours(3), 
    duration_hours: 5, 
    price_min: 800, 
    price_max: 2000, 
    image_url: img("1470252649783-076681d688f5"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7364,
    lng: 37.6303
  },

  // Р’С‹СЃС‚Р°РІРєРё
  { 
    title: "Р’Р°РЅ Р“РѕРі. РћР¶РёРІС€РёРµ РїРѕР»РѕС‚РЅР°", 
    description: "РРјРјРµСЂСЃРёРІРЅР°СЏ РІС‹СЃС‚Р°РІРєР°", 
    category: "exhibition", 
    venue_name: "РђСЂС‚-РїСЂРѕСЃС‚СЂР°РЅСЃС‚РІРѕ", 
    address: "СѓР». РџСЂРµСЃРЅРµРЅСЃРєР°СЏ РЅР°Р±., 2", 
    district: "РџСЂРµСЃРЅРµРЅСЃРєРёР№", 
    start_time: inHours(-2), 
    duration_hours: 4, 
    price_min: 800, 
    price_max: 1500, 
    image_url: img("1514194111488-47e8a69286aa"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7489,
    lng: 37.5394
  },
  { 
    title: "РЎРѕРєСЂРѕРІРёС‰Р° Р•РіРёРїС‚Р° РІ Р“РњРР", 
    description: "РЈРЅРёРєР°Р»СЊРЅР°СЏ РєРѕР»Р»РµРєС†РёСЏ Р°СЂС‚РµС„Р°РєС‚РѕРІ", 
    category: "exhibition", 
    venue_name: "Р“РњРР РёРј. РџСѓС€РєРёРЅР°", 
    address: "СѓР». Р’РѕР»С…РѕРЅРєР°, 12", 
    district: "РҐР°РјРѕРІРЅРёРєРё", 
    start_time: inHours(-3), 
    duration_hours: 3, 
    price_min: 600, 
    price_max: 1000, 
    image_url: img("1503095628777-9a9d6a951ef3"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7453,
    lng: 37.6003
  },
];