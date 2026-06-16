import axios from 'axios';

export async function fetchTimePadEvents(limit = 50) {
  try {
    console.log('[TimePad] Fetching events from Moscow...');
    
    // TimePad API - публичные события Москвы
    const response = await axios.get('https://api.timepad.ru/2/events/list.json', {
      params: {
        organization_id: 1, // Moscow events
        limit: limit,
        status: 'active',
        sort: 'date'
      },
      timeout: 10000,
    });
    
    console.log('[TimePad] Response status:', response.status);
    console.log('[TimePad] Total events:', response.data?.length || 0);
    
    if (!response.data || response.data.length === 0) {
      console.warn('[TimePad] No events returned');
      return [];
    }
    
    const events = response.data.map((e: any, idx: number) => {
      const eventDate = new Date(e.start_date || Date.now());
      return {
        title: e.name || 'Без названия',
        description: (e.description || 'Событие от TimePad').replace(/<[^>]*>?/gm, '').slice(0, 500),
        category: mapCategory(e.category?.name || 'exhibition'),
        venue_name: e.place?.name || 'Место уточняется',
        address: e.place?.address || 'Москва',
        district: 'Москва',
        start_time: eventDate.toISOString(),
        duration_hours: 3,
        price_min: e.price?.min || 0,
        price_max: e.price?.max || 0,
        image_url: e.preview_image?.url || 'https://placehold.co/800x600/3390ec/ffffff?text=EVENT',
        external_url: e.event_url || null,
        lat: e.place?.latitude || 55.7558,
        lng: e.place?.longitude || 37.6173,
      };
    });
    
    console.log('[TimePad] Mapped', events.length, 'events');
    return events;
  } catch (err: any) {
    console.error('[TimePad] Error:', err.message || err);
    return [];
  }
}

function mapCategory(slug: string): 'concert' | 'theater' | 'bar' | 'club' | 'exhibition' {
  const s = slug.toLowerCase();
  if (['concert', 'music', 'концерт'].includes(s)) return 'concert';
  if (['theater', 'performance', 'театр', 'спектакль'].includes(s)) return 'theater';
  if (['bar', 'food', 'еда', 'напитки'].includes(s)) return 'bar';
  if (['club', 'party', 'вечеринка', 'клуб'].includes(s)) return 'club';
  return 'exhibition';
}