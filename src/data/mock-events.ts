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
  external_url?: string | null;
  lat: number;
  lng: number;
}

// Тематические картинки с Unsplash Source по категориям
const categoryImages = {
  concert: "https://images.unsplash.com/photo-1501612780327-45045538702b?w=800&h=600&fit=crop&auto=format",
  theater: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=600&fit=crop&auto=format",
  bar: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop&auto=format",
  club: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&h=600&fit=crop&auto=format",
  exhibition: "https://images.unsplash.com/photo-1554188248-986adbbccd32?w=800&h=600&fit=crop&auto=format"
};

const img = (cat: string) => categoryImages[cat as keyof typeof categoryImages] || categoryImages.exhibition;

// События на период 23-28 июня 2026 года
export const MOCK_EVENTS: MockEvent[] = [
  // 23 июня 2026 (вторник)
  { 
    title: "Zemfira. Summer Tour 2026", 
    description: "Большой сольный концерт Земфиры в рамках летнего тура", 
    category: "concert", 
    venue_name: "ВТБ Арена", 
    address: "Ленинградский просп., 36", 
    district: "Динамо", 
    start_time: "2026-06-23T20:00:00", 
    duration_hours: 3, 
    price_min: 3500, 
    price_max: 12000, 
    image_url: img("concert"), 
    external_url: "https://vtb-arena.com",
    lat: 55.7831,
    lng: 37.5669
  },
  { 
    title: "Выставка «Импрессионизм. Моне и Ренуар»", 
    description: "Уникальная коллекция работ французских импрессионистов", 
    category: "exhibition", 
    venue_name: "ГМИИ им. Пушкина", 
    address: "ул. Волхонка, 12", 
    district: "Хамовники", 
    start_time: "2026-06-23T10:00:00", 
    duration_hours: 4, 
    price_min: 800, 
    price_max: 1500, 
    image_url: img("exhibition"), 
    external_url: "https://pushkinmuseum.art",
    lat: 55.7457,
    lng: 37.6043
  },
  
  // 24 июня 2026 (среда)
  { 
    title: "Би-2. 30 лет группе", 
    description: "Юбилейный концерт группы Би-2. Специальные гости", 
    category: "concert", 
    venue_name: "Лужники", 
    address: "ул. Лужники, 24", 
    district: "Лужники", 
    start_time: "2026-06-24T19:00:00", 
    duration_hours: 4, 
    price_min: 5000, 
    price_max: 20000, 
    image_url: img("concert"), 
    external_url: "https://luzhniki.ru",
    lat: 55.7156,
    lng: 37.5535
  },
  { 
    title: "Вечер джаза с Игорем Бутманом", 
    description: "Джазовый концерт с Московским джазовым оркестром", 
    category: "bar", 
    venue_name: "Jazz Club Essei", 
    address: "ул. Большая Дмитровка, 12", 
    district: "Тверской", 
    start_time: "2026-06-24T21:00:00", 
    duration_hours: 4, 
    price_min: 1500, 
    price_max: 4000, 
    image_url: img("bar"), 
    external_url: "https://jazzessei.ru",
    lat: 55.7626,
    lng: 37.6044
  },
  
  // 25 июня 2026 (четверг)
  { 
    title: "Спектакль «Гамлет». Театр Наций", 
    description: "Новая постановка классики Шекспира в режиссуре Серебренникова", 
    category: "theater", 
    venue_name: "Театр Наций", 
    address: "Литературный пер., 9", 
    district: "Чеховская", 
    start_time: "2026-06-25T19:00:00", 
    duration_hours: 3, 
    price_min: 2000, 
    price_max: 7000, 
    image_url: img("theater"), 
    external_url: "https://teatronations.com",
    lat: 55.7626,
    lng: 37.6044
  },
  { 
    title: "Техно-вечеринка «Глубокий космос»", 
    description: "Ночь электронной музыки с международными диджеями", 
    category: "club", 
    venue_name: "Mutabor", 
    address: "ул. Новодмитровская, 1", 
    district: "Дмитровская", 
    start_time: "2026-06-25T23:00:00", 
    duration_hours: 8, 
    price_min: 1200, 
    price_max: 3500, 
    image_url: img("club"), 
    external_url: "https://mutabor.club",
    lat: 55.7925,
    lng: 37.5842
  },
  
  // 26 июня 2026 (пятница)
  { 
    title: "Мумий Тролль. Летний концерт", 
    description: "Открытый концерт Мумий Тролль на Красной площади", 
    category: "concert", 
    venue_name: "Красная площадь", 
    address: "Красная площадь, 1", 
    district: "Китай-город", 
    start_time: "2026-06-26T18:00:00", 
    duration_hours: 4, 
    price_min: 0, 
    price_max: 0, 
    image_url: img("concert"), 
    external_url: "https://redsquare.mos.ru",
    lat: 55.7539,
    lng: 37.6208
  },
  { 
    title: "Фестиваль уличной еды", 
    description: "Лучшие фудтраки Москвы. Live музыка и мастер-классы", 
    category: "bar", 
    venue_name: "Парк Горького", 
    address: "Крымский Вал, 9", 
    district: "Парк Горького", 
    start_time: "2026-06-26T12:00:00", 
    duration_hours: 10, 
    price_min: 300, 
    price_max: 1500, 
    image_url: img("bar"), 
    external_url: "https://park-gorkogo.com",
    lat: 55.7297,
    lng: 37.6015
  },
  
  // 27 июня 2026 (суббота)
  { 
    title: "Симфонический оркестр в Зарядье", 
    description: "Вечер классической музыки с Московским филармоническим оркестром", 
    category: "concert", 
    venue_name: "Концертный зал Зарядье", 
    address: "ул. Варварка, 6, стр. 1", 
    district: "Китай-город", 
    start_time: "2026-06-27T19:00:00", 
    duration_hours: 2, 
    price_min: 2500, 
    price_max: 9000, 
    image_url: img("concert"), 
    external_url: "https://philharmonia.ru",
    lat: 55.7507,
    lng: 37.6281
  },
  { 
    title: "Ночь в музее. Современное искусство", 
    description: "Ночная экскурсия по музею современного искусства с перформансами", 
    category: "exhibition", 
    venue_name: "Гараж", 
    address: "ул. Крымова, 9", 
    district: "Парк Горького", 
    start_time: "2026-06-27T22:00:00", 
    duration_hours: 6, 
    price_min: 1000, 
    price_max: 2000, 
    image_url: img("exhibition"), 
    external_url: "https://garagemca.org",
    lat: 55.7297,
    lng: 37.6015
  },
  { 
    title: "Rave Night. Hard Techno", 
    description: "Агрессивный техно рейв с лучшими диджеями Берлина", 
    category: "club", 
    venue_name: "Powerhouse", 
    address: "ул. Нижняя Сыромятническая, 10", 
    district: "Чкаловская", 
    start_time: "2026-06-27T23:00:00", 
    duration_hours: 10, 
    price_min: 1500, 
    price_max: 4000, 
    image_url: img("club"), 
    external_url: "https://powerhouse.ru",
    lat: 55.7536,
    lng: 37.6598
  },
  
  // 28 июня 2026 (воскресенье)
  { 
    title: "Спектакль «Вишнёвый сад». МХТ им. Чехова", 
    description: "Классика Чехова в современной постановке", 
    category: "theater", 
    venue_name: "МХТ им. Чехова", 
    address: "Камергерский пер., 3", 
    district: "Охотный ряд", 
    start_time: "2026-06-28T18:00:00", 
    duration_hours: 3, 
    price_min: 3000, 
    price_max: 9000, 
    image_url: img("theater"), 
    external_url: "https://mxat.ru",
    lat: 55.7589,
    lng: 37.6156
  },
  { 
    title: "Джазовый brunch с шампанским", 
    description: "Джазовый концерт с бранчем в ресторане", 
    category: "bar", 
    venue_name: "Kuznya House", 
    address: "ул. Кузнецкий Мост, 15", 
    district: "Кузнецкий мост", 
    start_time: "2026-06-28T12:00:00", 
    duration_hours: 3, 
    price_min: 2000, 
    price_max: 4500, 
    image_url: img("bar"), 
    external_url: "https://kuznyahouse.ru",
    lat: 55.7565,
    lng: 37.6231
  },
  { 
    title: "Выставка «Сокровища Египта»", 
    description: "Уникальная коллекция древнеегипетских артефактов", 
    category: "exhibition", 
    venue_name: "Манеж", 
    address: "Манежная пл., 1", 
    district: "Охотный ряд", 
    start_time: "2026-06-28T10:00:00", 
    duration_hours: 3, 
    price_min: 600, 
    price_max: 1200, 
    image_url: img("exhibition"), 
    external_url: "https://manege.ru",
    lat: 55.7526,
    lng: 37.6145
  },
];
