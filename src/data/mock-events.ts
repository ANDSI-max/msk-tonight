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

const img = (cat: string) => `https://placehold.co/800x600/${cat === "concert" ? "ff6b6b" : cat === "theater" ? "4ecdc4" : cat === "bar" ? "ffe66d" : cat === "club" ? "1a535c" : "f7fff7"}/ffffff?text=EVENT`;

// События на период 8-14 июня 2026 года
export const MOCK_EVENTS: MockEvent[] = [
  // 8 июня 2026 (понедельник)
  { 
    title: "Teatr Nations. Spectaculum Mundi", 
    description: "Фестиваль национальных театров. Гала-концерт", 
    category: "theater", 
    venue_name: "Театр Наций", 
    address: "Лиственный пер., 9", 
    district: "Чеховская", 
    start_time: "2026-06-08T19:00:00", 
    duration_hours: 3, 
    price_min: 1500, 
    price_max: 5000, 
    image_url: img("theater"), 
    external_url: "https://teatronations.com",
    lat: 55.7626,
    lng: 37.6044
  },
  { 
    title: "Street Art Festival Moscow", 
    description: "Фестиваль уличного искусства. Мастер-классы и выставки", 
    category: "exhibition", 
    venue_name: "Артплей", 
    address: "Нижняя Сыромятническая ул., 10", 
    district: "Чкаловская", 
    start_time: "2026-06-08T12:00:00", 
    duration_hours: 8, 
    price_min: 0, 
    price_max: 500, 
    image_url: img("exhibition"), 
    external_url: "https://artplay.ru",
    lat: 55.7536,
    lng: 37.6598
  },
  
  // 9 июня 2026 (вторник)
  { 
    title: "Noize MC. Anniversary Tour", 
    description: "Большой сольный концерт в честь юбилея альбома", 
    category: "concert", 
    venue_name: "Adrenaline Stadium", 
    address: "Хорошёвское ш., 15", 
    district: "Беговой", 
    start_time: "2026-06-09T20:00:00", 
    duration_hours: 3, 
    price_min: 2000, 
    price_max: 6000, 
    image_url: img("concert"), 
    external_url: "https://adrenalinestadium.ru",
    lat: 55.7716,
    lng: 37.5456
  },
  { 
    title: "Oktoberfest на ВДНХ", 
    description: "Пивной фестиваль с немецкой кухней и музыкой", 
    category: "bar", 
    venue_name: "ВДНХ", 
    address: "просп. Мира, 119", 
    district: "ВДНХ", 
    start_time: "2026-06-09T16:00:00", 
    duration_hours: 6, 
    price_min: 300, 
    price_max: 1500, 
    image_url: img("bar"), 
    external_url: "https://vdnh.ru",
    lat: 55.8263,
    lng: 37.6374
  },
  
  // 10 июня 2026 (среда)
  { 
    title: "Би-2. XX Tour", 
    description: "Юбилейный тур группы Би-2. Специальные гости", 
    category: "concert", 
    venue_name: "ВТБ Арена", 
    address: "Ленинградский просп., 36", 
    district: "Динамо", 
    start_time: "2026-06-10T19:30:00", 
    duration_hours: 3, 
    price_min: 4000, 
    price_max: 15000, 
    image_url: img("concert"), 
    external_url: "https://vtb-arena.com",
    lat: 55.7831,
    lng: 37.5669
  },
  { 
    title: "Ван Гог. Ожившие полотна", 
    description: "Иммерсивное шоу в формате 360°", 
    category: "exhibition", 
    venue_name: "Арт-пространство", 
    address: "ул. Вавилова, 19", 
    district: "Академический", 
    start_time: "2026-06-10T10:00:00", 
    duration_hours: 2, 
    price_min: 800, 
    price_max: 1500, 
    image_url: img("exhibition"), 
    external_url: "https://vangog.ru",
    lat: 55.7078,
    lng: 37.5887
  },
  
  // 11 июня 2026 (четверг)
  { 
    title: "Cirque du Soleil. VOZZA", 
    description: "Уникальное шоу в формате 360 градусов", 
    category: "club", 
    venue_name: "Цирк на Вернадского", 
    address: "просп. Вернадского, 7", 
    district: "ЮЗАО", 
    start_time: "2026-06-11T19:00:00", 
    duration_hours: 2, 
    price_min: 2500, 
    price_max: 8000, 
    image_url: img("club"), 
    external_url: "https://cirquedusoleil.com",
    lat: 55.7156,
    lng: 37.5688
  },
  { 
    title: "Сокровища Египта в ГМИИ", 
    description: "Выставка древнеегипетских артефактов", 
    category: "exhibition", 
    venue_name: "ГМИИ им. Пушкина", 
    address: "ул. Волхонка, 12", 
    district: "Хамовники", 
    start_time: "2026-06-11T10:00:00", 
    duration_hours: 3, 
    price_min: 500, 
    price_max: 1000, 
    image_url: img("exhibition"), 
    external_url: "https://pushkinmuseum.art",
    lat: 55.7457,
    lng: 37.6043
  },
  
  // 12 июня 2026 (пятница) - День России
  { 
    title: "Мумий Тролль. День России", 
    description: "Праздничный концерт на Красной площади", 
    category: "concert", 
    venue_name: "Красная площадь", 
    address: "Красная площадь, 1", 
    district: "Китай-город", 
    start_time: "2026-06-12T18:00:00", 
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
    description: "Лучшие фудтраки Москвы. Live музыка", 
    category: "bar", 
    venue_name: "Парк Горького", 
    address: "Крымский Вал, 9", 
    district: "Парк Горького", 
    start_time: "2026-06-12T12:00:00", 
    duration_hours: 10, 
    price_min: 200, 
    price_max: 1000, 
    image_url: img("bar"), 
    external_url: "https://park-gorkogo.com",
    lat: 55.7297,
    lng: 37.6015
  },
  
  // 13 июня 2026 (суббота)
  { 
    title: "Симфонический оркестр в Зарядье", 
    description: "Вечер классической музыки с Московским филармоническим оркестром", 
    category: "concert", 
    venue_name: "Концертный зал Зарядье", 
    address: "ул. Варварка, 6, стр. 1", 
    district: "Китай-город", 
    start_time: "2026-06-13T19:00:00", 
    duration_hours: 2, 
    price_min: 2000, 
    price_max: 8000, 
    image_url: img("concert"), 
    external_url: "https://philharmonia.ru",
    lat: 55.7507,
    lng: 37.6281
  },
  { 
    title: "Techno Night. Moscow Edition", 
    description: "Ночь электронной музыки с международными диджеями", 
    category: "club", 
    venue_name: "Mutabor", 
    address: "ул. Новодмитровская, 1", 
    district: "Дмитровская", 
    start_time: "2026-06-13T23:00:00", 
    duration_hours: 8, 
    price_min: 1000, 
    price_max: 3000, 
    image_url: img("club"), 
    external_url: "https://mutabor.club",
    lat: 55.7925,
    lng: 37.5842
  },
  
  // 14 июня 2026 (воскресенье)
  { 
    title: "Спектакль. Вишнёвый сад", 
    description: "Классика Чехова в современной постановке", 
    category: "theater", 
    venue_name: "МХТ им. Чехова", 
    address: "Камергерский пер., 3", 
    district: "Охотный ряд", 
    start_time: "2026-06-14T18:00:00", 
    duration_hours: 3, 
    price_min: 2500, 
    price_max: 8000, 
    image_url: img("theater"), 
    external_url: "https://mxat.ru",
    lat: 55.7589,
    lng: 37.6156
  },
  { 
    title: "Джазовый brunch", 
    description: "Джазовый концерт с бранчем в ресторане", 
    category: "bar", 
    venue_name: "Kuznya House", 
    address: "ул. Кузнецкий Мост, 15", 
    district: "Кузнецкий мост", 
    start_time: "2026-06-14T12:00:00", 
    duration_hours: 3, 
    price_min: 1500, 
    price_max: 3500, 
    image_url: img("bar"), 
    external_url: "https://kuznyahouse.ru",
    lat: 55.7565,
    lng: 37.6231
  },
];