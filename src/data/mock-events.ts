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
  start_time: string; // ISO 8601 дата начала
  duration_hours: number;
  price_min: number;
  price_max: number;
  image_url: string;
  external_url: string;
  lat: number; // Широта
  lng: number; // Долгота
}

// Генерируем дату на сегодня
const today = new Date();
today.setHours(19, 0, 0, 0);

const inHours = (h: number) => {
  const d = new Date(today);
  d.setHours(d.getHours() + h);
  return d.toISOString();
};

// Картинки с Unsplash
const img = (q: string) => `https://images.unsplash.com/photo-${q}?w=800&h=600&fit=crop`;

export const MOCK_EVENTS: MockEvent[] = [
  // Концерты
  { 
    title: " Mumiy Troll в Crocus City Hall", 
    description: "Большой сольный концерт легендарной группы", 
    category: "concert", 
    venue_name: "Crocus City Hall", 
    address: "65-66 км МКАД, Красногорск", 
    district: "Красногорск", 
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
    title: "Джаз-сет в 16 тонн", 
    description: "Уютный вечер живого джаза", 
    category: "concert", 
    venue_name: "16 тонн", 
    address: "ул. Пресненский Вал, 6с1", 
    district: "Пресненский", 
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
    title: "Indie-вечер в А2", 
    description: "Молодые российские инди-группы", 
    category: "concert", 
    venue_name: "Клуб А2", 
    address: "Звенигородское ш., 18/20", 
    district: "Пресненский", 
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
    title: "Симфонический оркестр в Зарядье", 
    description: "Чайковский. Симфония №6", 
    category: "concert", 
    venue_name: "Зарядье", 
    address: "ул. Варварка, 6с1", 
    district: "Тверской", 
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
    title: "Electronic Live в Powerhouse", 
    description: "Электроника, синтвейв, лайв-сет", 
    category: "concert", 
    venue_name: "Powerhouse", 
    address: "ул. Новодмитровская, 5с2", 
    district: "Бутырский", 
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
    title: "Хип-хоп на Adrenaline Stadium", 
    description: "Большой open air хип-хоп фест", 
    category: "concert", 
    venue_name: "Adrenaline Stadium", 
    address: "Ленинградский пр-т, 80к17", 
    district: "Аэропорт", 
    start_time: inHours(1), 
    duration_hours: 5, 
    price_min: 2500, 
    price_max: 6000, 
    image_url: img("1459691118739-eec412e48e95"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.8069,
    lng: 37.5297
  },

  // Театр
  { 
    title: "Гамлет во МХТ им. Чехова", 
    description: "Классическая постановка с современным акцентом", 
    category: "theater", 
    venue_name: "МХТ им. Чехова", 
    address: "Камергерский пер., 3", 
    district: "Тверской", 
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
    title: "Чайка в Современнике", 
    description: "Чехов в новой режиссёрской версии", 
    category: "theater", 
    venue_name: "Современник", 
    address: "Чистопрудный бульвар, 19А", 
    district: "Басманный", 
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
    title: "Мастер и Маргарита на Таганке", 
    description: "Знаменитая постановка по Булгакову", 
    category: "theater", 
    venue_name: "Театр на Таганке", 
    address: "ул. Земляной Вал, 76/21", 
    district: "Таганский", 
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
    title: "Балет Лебединое озеро в Большом", 
    description: "Главная сцена страны", 
    category: "theater", 
    venue_name: "Большой театр", 
    address: "Театральная пл., 1", 
    district: "Тверской", 
    start_time: inHours(0), 
    duration_hours: 3, 
    price_min: 3500, 
    price_max: 18000, 
    image_url: img("1516536936684-4a607e87f6a1"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7597,
    lng: 37.6178
  },

  // Бары
  { 
    title: "Коктейльная вечеринка в Delicatessen", 
    description: "Авторские коктейли от лучших барменов", 
    category: "bar", 
    venue_name: "Delicatessen", 
    address: "ул. Олимпийский проспект, 5с3", 
    district: "Мещанский", 
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
    title: "Виски-дегустация в Simple Wine Bar", 
    description: "Дегустация редких шотландских виски", 
    category: "bar", 
    venue_name: "Simple Wine Bar", 
    address: "ул. Рождественка, 12", 
    district: "Мещанский", 
    start_time: inHours(1), 
    duration_hours: 2, 
    price_min: 2000, 
    price_max: 5000, 
    image_url: img("1516536936684-4a607e87f6a1"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7642,
    lng: 37.6253
  },

  // Клубы
  { 
    title: "Techno Night в Mutabor", 
    description: "Лучшие техно-диджеи Москвы", 
    category: "club", 
    venue_name: "Mutabor", 
    address: "ул. Авиамоторная, 47с3", 
    district: "Лефортово", 
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
    title: "House Party в Gazgolder", 
    description: "Хаус музыка и танцы до утра", 
    category: "club", 
    venue_name: "Gazgolder", 
    address: "ул. Пятницкая, 53", 
    district: "Замоскворечье", 
    start_time: inHours(3), 
    duration_hours: 5, 
    price_min: 800, 
    price_max: 2000, 
    image_url: img("1470252649783-076681d688f5"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7364,
    lng: 37.6303
  },

  // Выставки
  { 
    title: "Ван Гог. Ожившие полотна", 
    description: "Иммерсивная выставка", 
    category: "exhibition", 
    venue_name: "Арт-пространство", 
    address: "ул. Пресненская наб., 2", 
    district: "Пресненский", 
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
    title: "Сокровища Египта в ГМИИ", 
    description: "Уникальная коллекция артефактов", 
    category: "exhibition", 
    venue_name: "ГМИИ им. Пушкина", 
    address: "ул. Волхонка, 12", 
    district: "Хамовники", 
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