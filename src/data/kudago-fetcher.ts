import axios from 'axios';

interface KudaGoEvent {
  id: number;
  title: string;
  description: string;
  place: { title: string; address: string; geo: { lat: number; lon: number } };
  price_from: number;
  price_to: number;
  images: { url: string }[];
  categories: { slug: string }[];
  time_range: { starts_at: number; ends_at: number };
  url: string;
}

export async function fetchKudaGoEvents(limit = 50) {
  try {
    const response = await axios.get('https://kudago.com/public-api/v1.4/event-list/', {
      params: { location: 'msk', page_size: limit, expand: 'place,images,categories' },
    });
    return response.data.results.map((e: KudaGoEvent) => ({
      title: e.title,
      description: 'Событие от KudaGo',
      category: 'concert' as any,
      venue_name: e.place?.title || 'Unknown',
      address: e.place?.address || 'Moscow',
      district: 'Moscow',
      start_time: new Date(e.time_range.starts_at * 1000).toISOString(),
      duration_hours: 3,
      price_min: e.price_from || 0,
      price_max: e.price_to || 0,
      image_url: e.images?.[0]?.url || 'https://placehold.co/800x600',
      external_url: e.url,
      lat: e.place?.geo?.lat || 55.75,
      lng: e.place?.geo?.lon || 37.61,
    }));
  } catch (err) {
    console.error('KudaGo error:', err);
    return [];
  }
}