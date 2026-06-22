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

// Тематические картинки с Unsplash по категориям
const categoryImages = {
  concert: "https://images.unsplash.com/photo-1501612780327-45045538702b?w=800&h=600&fit=crop&auto=format",
  theater: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=600&fit=crop&auto=format",
  bar: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop&auto=format",
  club: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&h=600&fit=crop&auto=format",
  exhibition: "https://images.unsplash.com/photo-1554188248-986adbbccd32?w=800&h=600&fit=crop&auto=format"
};

const img = (cat: string) => categoryImages[cat as keyof typeof categoryImages] || categoryImages.exhibition;

// События на 23-29 июня 2026 - реалистичные мероприятия Москвы
export const MOCK_EVENTS: MockEvent[] = [
  // 23 июня 2026 (вторник)
  { 
    title: "Вечер джаза в оранжерее", 
    description: "Джазовый концерт с шампанским в историческом здании. Живая музыка, коктейли, романтическая атмосфера", 
    category: "concert", 
    venue_name: "Главная Сцена", 
    address: "ул. Большая Никитская, 19", 
    district: "Тверской", 
    start_time: "2026-06-23T19:00:00", 
    duration_hours: 3, 
    price_min: 2500, 
    price_max: 5000, 
    image_url: img("concert"), 
    external_url: "https://jazz.ru",
    lat: 55.7558,
    lng: 37.6173
  },
  { 
    title: "Выставка современного искусства", 
    description: "Работы молодых художников. Интерактивные инсталляции, VR-зоны, перформансы", 
    category: "exhibition", 
    venue_name: "Гараж ММСИ", 
    address: "ул. Остоженка, 16", 
    district: "Кропоткинская", 
    start_time: "2026-06-23T11:00:00", 
    duration_hours: 5, 
    price_min: 500, 
    price_max: 800, 
    image_url: img("exhibition"), 
    external_url: "https://mosmuseum.ru",
    lat: 55.7425,
    lng: 37.6057
  },
  
  // 24 июня 2026 (среда)
  { 
    title: "Рок-концерт на крыше", 
    description: "Открытый концерт с видом на Москву. Каверы на классику русского рока", 
    category: "concert", 
    venue_name: "Крыша Мира", 
    address: "ул. Бауманская, 35", 
    district: "Бауманская", 
    start_time: "2026-06-24T20:00:00", 
    duration_hours: 4, 
    price_min: 1500, 
    price_max: 3500, 
    image_url: img("concert"), 
    external_url: null,
    lat: 55.7654,
    lng: 37.6755
  },
  { 
    title: "Винный вечер с дегустацией", 
    description: "Дегустация вин из разных стран. Сомелье расскажет о виноделии", 
    category: "bar", 
    venue_name: "Wine Bar №1", 
    address: "ул. Пятницкая, 28", 
    district: "Новокузнецкая", 
    start_time: "2026-06-24T19:00:00", 
    duration_hours: 3, 
    price_min: 2000, 
    price_max: 4000, 
    image_url: img("bar"), 
    external_url: null,
    lat: 55.7378,
    lng: 37.6289
  },
  
  // 25 июня 2026 (четверг)
  { 
    title: "Спектакль «Чайка»", 
    description: "Классика Чехова в современной постановке. Премьера сезона", 
    category: "theater", 
    venue_name: "Театр Практика", 
    address: "Зубовский б-р, 3", 
    district: "Парк Культуры", 
    start_time: "2026-06-25T19:00:00", 
    duration_hours: 2, 
    price_min: 2000, 
    price_max: 5000, 
    image_url: img("theater"), 
    external_url: "https://praktika-teatr.ru",
    lat: 55.7425,
    lng: 37.5925
  },
  { 
    title: "Техно-вечеринка", 
    description: "Ночь электронной музыки. Резиденты и гости из Европы", 
    category: "club", 
    venue_name: "Клуб 16 Тонн", 
    address: "ул. Пресненский Вал, 6", 
    district: "Улица 1905 года", 
    start_time: "2026-06-25T23:00:00", 
    duration_hours: 6, 
    price_min: 1000, 
    price_max: 2500, 
    image_url: img("club"), 
    external_url: "https://16ton.ru",
    lat: 55.7558,
    lng: 37.5756
  },
  
  // 26 июня 2026 (пятница)
  { 
    title: "Стендап-шоу", 
    description: "Лучшие комики Москвы. Новый материал, импровизация, интерактив", 
    category: "club", 
    venue_name: "Comedy Club Bar", 
    address: "ул. Арбат, 45", 
    district: "Смоленская", 
    start_time: "2026-06-26T20:00:00", 
    duration_hours: 3, 
    price_min: 1500, 
    price_max: 3000, 
    image_url: img("club"), 
    external_url: null,
    lat: 55.7456,
    lng: 37.5889
  },
  { 
    title: "Пивной фестиваль", 
    description: "Крафтовое пиво от российских пивоварен. Фудтраки, музыка, конкурсы", 
    category: "bar", 
    venue_name: "Дизайн-завод", 
    address: "ул. Нижняя Сыромятническая, 10", 
    district: "Чкаловская", 
    start_time: "2026-06-26T15:00:00", 
    duration_hours: 8, 
    price_min: 500, 
    price_max: 2000, 
    image_url: img("bar"), 
    external_url: null,
    lat: 55.7536,
    lng: 37.6598
  },
  
  // 27 июня 2026 (суббота)
  { 
    title: "Балет «Лебединое озеро»", 
    description: "Классический балет в исполнении мастеров сцены", 
    category: "theater", 
    venue_name: "Большой Театр", 
    address: "Театральная пл., 1", 
    district: "Театральная", 
    start_time: "2026-06-27T19:00:00", 
    duration_hours: 3, 
    price_min: 5000, 
    price_max: 25000, 
    image_url: img("theater"), 
    external_url: "https://bolshoi.ru",
    lat: 55.7596,
    lng: 37.6177
  },
  { 
    title: "Арт-выставка «Импрессия»", 
    description: "Картины импрессионистов из частных коллекций. Экскурсии включены", 
    category: "exhibition", 
    venue_name: "Манеж", 
    address: "Манежная пл., 1", 
    district: "Охотный ряд", 
    start_time: "2026-06-27T10:00:00", 
    duration_hours: 6, 
    price_min: 600, 
    price_max: 1200, 
    image_url: img("exhibition"), 
    external_url: "https://manege.ru",
    lat: 55.7526,
    lng: 37.6145
  },
  { 
    title: "Ночной забег по Москве", 
    description: "Спортивное событие для всех. Маршрут 5км и 10км. Медаль финишёра", 
    category: "club", 
    venue_name: "Парк Горького", 
    address: "Крымский Вал, 9", 
    district: "Парк Горького", 
    start_time: "2026-06-27T22:00:00", 
    duration_hours: 4, 
    price_min: 1500, 
    price_max: 2500, 
    image_url: img("club"), 
    external_url: "https://nightrun.ru",
    lat: 55.7297,
    lng: 37.6015
  },
  
  // 28 июня 2026 (воскресенье)
  { 
    title: "Бранч с живой музыкой", 
    description: "Воскресный бранч с джазовым сопровождением. Шведский стол", 
    category: "bar", 
    venue_name: "Ресторан Матрёшка", 
    address: "ул. Воздвиженка, 10", 
    district: "Арбатская", 
    start_time: "2026-06-28T12:00:00", 
    duration_hours: 4, 
    price_min: 3000, 
    price_max: 5000, 
    image_url: img("bar"), 
    external_url: null,
    lat: 55.7456,
    lng: 37.6025
  },
  { 
    title: "Концерт классической музыки", 
    description: "Произведения Чайковского и Рахманинова. Симфонический оркестр", 
    category: "concert", 
    venue_name: "Консерватория", 
    address: "Большая Никитская, 13", 
    district: "Тверская", 
    start_time: "2026-06-28T18:00:00", 
    duration_hours: 2, 
    price_min: 1500, 
    price_max: 4000, 
    image_url: img("concert"), 
    external_url: "https://meloman.ru",
    lat: 55.7558,
    lng: 37.6089
  },
  { 
    title: "Выставка ретро-автомобилей", 
    description: "Коллекционные авто СССР и мира. Фото-зона, экскурсии", 
    category: "exhibition", 
    venue_name: "ВДНХ", 
    address: "пр-т Мира, 119", 
    district: "ВДНХ", 
    start_time: "2026-06-28T10:00:00", 
    duration_hours: 5, 
    price_min: 400, 
    price_max: 800, 
    image_url: img("exhibition"), 
    external_url: "https://vdnh.ru",
    lat: 55.8263,
    lng: 37.6374
  },
  
  // 29 июня 2026 (понедельник)
  { 
    title: "Караоке-ночь", 
    description: "Пой любимые песни в караоке-баре. Призы за лучшее исполнение", 
    category: "club", 
    venue_name: "Караоке Bar", 
    address: "ул. Тверская, 22", 
    district: "Тверская", 
    start_time: "2026-06-29T21:00:00", 
    duration_hours: 5, 
    price_min: 1000, 
    price_max: 3000, 
    image_url: img("club"), 
    external_url: null,
    lat: 55.7626,
    lng: 37.6044
  },
  { 
    title: "Мастер-класс по коктейлям", 
    description: "Научитесь готовить авторские коктейли. Дегустация включена", 
    category: "bar", 
    venue_name: "Коктейльная студия", 
    address: "ул. Сретенка, 15", 
    district: "Сухаревская", 
    start_time: "2026-06-29T19:00:00", 
    duration_hours: 3, 
    price_min: 2500, 
    price_max: 4000, 
    image_url: img("bar"), 
    external_url: null,
    lat: 55.7725,
    lng: 37.6325
  },
];
