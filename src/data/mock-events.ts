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
  start_time: string;
  duration_hours: number;
  price_min: number;
  price_max: number;
  image_url: string;
  external_url: string;
  lat: number;
  lng: number;
}

const today = new Date();
today.setHours(19, 0, 0, 0);

const inHours = (h: number) => {
  const d = new Date(today);
  d.setHours(d.getHours() + h);
  return d.toISOString();
};

const img = (cat: string) => `https://placehold.co/800x600/${cat === "concert" ? "ff6b6b" : cat === "theater" ? "4ecdc4" : cat === "bar" ? "ffe66d" : cat === "club" ? "1a535c" : "f7fff7"}/ffffff?text=EVENT`;

export const MOCK_EVENTS: MockEvent[] = [
  { 
    title: "🏺 Сокровища Египта в ГМИИ", 
    description: "Выставка древнеегипетских артефактов", 
    category: "exhibition", 
    venue_name: "ГМИИ им. Пушкина", 
    address: "ул. Волхонка, 12", 
    district: "Хамовники", 
    start_time: inHours(0), 
    duration_hours: 3, 
    price_min: 500, 
    price_max: 1000, 
    image_url: img("exhibition"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7457,
    lng: 37.6043
  },
  { 
    title: "🎨 Ван Гог. Ожившие полотна", 
    description: "Иммерсивное шоу в формате 360°", 
    category: "exhibition", 
    venue_name: "Арт-пространство", 
    address: "ул. Вавилова, 19", 
    district: "Академический", 
    start_time: inHours(1), 
    duration_hours: 2, 
    price_min: 800, 
    price_max: 1500, 
    image_url: img("exhibition"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7078,
    lng: 37.5887
  },
  { 
    title: "🎸 Mumiy Troll в Crocus City Hall", 
    description: "Большой сольный концерт легендарной группы", 
    category: "concert", 
    venue_name: "Crocus City Hall", 
    address: "65-66 км МКАД, Красногорск", 
    district: "Красногорск", 
    start_time: inHours(0), 
    duration_hours: 3, 
    price_min: 3500, 
    price_max: 12000, 
    image_url: img("concert"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.8194,
    lng: 37.4028
  },
  { 
    title: "🎻 Симфонический оркестр в Зарядье", 
    description: "Классическая музыка в новом формате", 
    category: "concert", 
    venue_name: "Зарядье", 
    address: "ул. Варварка, 6, стр. 1", 
    district: "Китай-город", 
    start_time: inHours(1), 
    duration_hours: 2, 
    price_min: 2000, 
    price_max: 8000, 
    image_url: img("concert"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7507,
    lng: 37.6281
  },
  { 
    title: "🎭 Гамлет во МХТ им. Чехова", 
    description: "Классика Шекспира в современной постановке", 
    category: "theater", 
    venue_name: "МХТ им. Чехова", 
    address: "Камергерский пер., 3", 
    district: "Тверской", 
    start_time: inHours(2), 
    duration_hours: 3, 
    price_min: 2500, 
    price_max: 10000, 
    image_url: img("theater"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7587,
    lng: 37.6156
  },
  { 
    title: "🎭 Чайка в Современнике", 
    description: "Чехов на все времена", 
    category: "theater", 
    venue_name: "Современник", 
    address: "Чистопрудный б-р, 8А", 
    district: "Басманный", 
    start_time: inHours(3), 
    duration_hours: 3, 
    price_min: 1500, 
    price_max: 6000, 
    image_url: img("theater"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7635,
    lng: 37.6445
  },
  { 
    title: "🎭 Мастер и Маргарита на Таганке", 
    description: "Легендарный спектакль Юрия Любимова", 
    category: "theater", 
    venue_name: "Театр на Таганке", 
    address: "ул. Земляной Вал, 76/21", 
    district: "Таганский", 
    start_time: inHours(0), 
    duration_hours: 3, 
    price_min: 1200, 
    price_max: 5000, 
    image_url: img("theater"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7463,
    lng: 37.6514
  },
  { 
    title: "🩰 Балет Лебединое озеро в Большом", 
    description: "Бессмертная классика Чайковского", 
    category: "theater", 
    venue_name: "Большой театр", 
    address: "Театральная пл., 1", 
    district: "Тверской", 
    start_time: inHours(1), 
    duration_hours: 3, 
    price_min: 5000, 
    price_max: 25000, 
    image_url: img("theater"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7597,
    lng: 37.6187
  },
  { 
    title: "🎷 Джаз-сет в 16 тонн", 
    description: "Уютный вечер живого джаза", 
    category: "concert", 
    venue_name: "16 тонн", 
    address: "ул. Пресненский Вал, 6с1", 
    district: "Пресненский", 
    start_time: inHours(1), 
    duration_hours: 3, 
    price_min: 1500, 
    price_max: 2500, 
    image_url: img("concert"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7558,
    lng: 37.5672
  },
  { 
    title: "🎤 Хип-хоп на Adrenaline Stadium", 
    description: "Молодые рэп-исполнители", 
    category: "club", 
    venue_name: "Adrenaline Stadium", 
    address: "ул. Орджоникидзе, 8, стр. 14", 
    district: "Даниловский", 
    start_time: inHours(2), 
    duration_hours: 4, 
    price_min: 2000, 
    price_max: 5000, 
    image_url: img("club"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7234,
    lng: 37.6055
  },
  { 
    title: "🥃 Виски-дегустация в Simple Wine Bar", 
    description: "Вечер шотландского виски с сомелье", 
    category: "bar", 
    venue_name: "Simple Wine Bar", 
    address: "ул. Петровка, 15", 
    district: "Тверской", 
    start_time: inHours(0), 
    duration_hours: 2, 
    price_min: 3000, 
    price_max: 5000, 
    image_url: img("bar"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7661,
    lng: 37.6178
  },
  { 
    title: "🎸 Indie-вечер в А2", 
    description: "Молодые российские инди-группы", 
    category: "club", 
    venue_name: "Клуб А2", 
    address: "Звенигородское ш., 18/20", 
    district: "Пресненский", 
    start_time: inHours(2), 
    duration_hours: 4, 
    price_min: 1500, 
    price_max: 3000, 
    image_url: img("club"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7617,
    lng: 37.5551
  },
  { 
    title: "🍹 Коктейльная вечеринка", 
    description: "Авторские коктейли от лучших барменов", 
    category: "bar", 
    venue_name: "Менделеев Бар", 
    address: "Петровский б-р, 5/7", 
    district: "Тверской", 
    start_time: inHours(1), 
    duration_hours: 4, 
    price_min: 2000, 
    price_max: 4000, 
    image_url: img("bar"), 
    external_url: "https://t.me/msk_tonight_bot",
    lat: 55.7645,
    lng: 37.6134
  },
];