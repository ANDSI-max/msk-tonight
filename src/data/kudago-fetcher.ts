import axios from 'axios';

export async function fetchKudaGoEvents(limit = 50) {
  try {
    console.log('[KudaGo] Fetching from API...');
    const response = await axios.get('https://kudago.com/public-api/v1.4/event-list/', {
      params: { 
        location: 'msk', 
        page_size: limit, 
        expand: 'place,images,categories',
        order_by: 'datetime',
        show_future: 'true'
      },
      timeout: 10000,
    });
    
    console.log('[KudaGo] Response status:', response.status);
    console.log('[KudaGo] Results count:', response.data?.results?.length);
    
    if (!response.data?.results || response.data.results.length === 0) {
      console.warn('[KudaGo] No events returned');
      return [];
    }
    
    const events = response.data.results.map((e: any) => {
      const eventDate = new Date(e.time_range?.starts_at * 1000 || Date.now());
      return {
        title: e.title || 'Без названия',
        description: (e.description || 'Событие от KudaGo').replace(/<[^>]*>?/gm, '').slice(0, 500),
        category: mapCategory(e.categories?.[0]?.slug || 'exhibition'),
        venue_name: e.place?.title || 'Место уточняется',
        address: e.place?.address || 'Москва',
        district: 'Москва',
        start_time: eventDate.toISOString(),
        duration_hours: 3,
        price_min: e.price_from || 0,
        price_max: e.price_to || 0,
        image_url: e.images?.[0]?.url || 'https://placehold.co/800x600/3390ec/ffffff?text=EVENT',
        external_url: e.url || null,
        lat: e.place?.geo?.lat || 55.7558,
        lng: e.place?.geo?.lon || 37.6173,
      };
    });
    
    console.log('[KudaGo] Mapped', events.length, 'events');
    return events;
  } catch (err: any) {
    console.error('[KudaGo] Error:', err.message || err);
    return [];
  }
}

function mapCategory(slug: string): 'concert' | 'theater' | 'bar' | 'club' | 'exhibition' {
  if (['concert', 'music'].includes(slug)) return 'concert';
  if (['theater', 'performance'].includes(slug)) return 'theater';
  if (['bar', 'food'].includes(slug)) return 'bar';
  if (['club', 'party'].includes(slug)) return 'club';
  return 'exhibition';
}