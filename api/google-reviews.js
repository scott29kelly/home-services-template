// In-memory cache (persists across warm invocations on Vercel)
let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
  const PLACE_ID = process.env.GOOGLE_PLACE_ID;

  if (!API_KEY || !PLACE_ID) {
    return res.status(200).json({
      configured: false,
      reviews: [],
      rating: 0,
      userRatingCount: 0,
    });
  }

  // Return cached data if fresh
  if (cache.data && Date.now() - cache.timestamp < CACHE_TTL) {
    return res.status(200).json(cache.data);
  }

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${PLACE_ID}`,
      {
        headers: {
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'reviews,rating,userRatingCount',
        },
      }
    );

    if (!response.ok) {
      console.error('Google Places API error:', response.status, await response.text());
      return res.status(200).json({
        configured: true,
        reviews: [],
        rating: 0,
        userRatingCount: 0,
      });
    }

    const data = await response.json();

    const result = {
      configured: true,
      reviews: (data.reviews || []).map((r) => ({
        authorName: r.authorAttribution?.displayName || 'Anonymous',
        authorPhoto: r.authorAttribution?.photoUri || '',
        authorUrl: r.authorAttribution?.uri || '',
        rating: r.rating || 5,
        text: r.text?.text || '',
        relativeTime: r.relativePublishTimeDescription || '',
      })),
      rating: data.rating || 0,
      userRatingCount: data.userRatingCount || 0,
    };

    cache = { data: result, timestamp: Date.now() };
    return res.status(200).json(result);
  } catch (error) {
    console.error('Google Reviews fetch error:', error);
    return res.status(200).json({
      configured: true,
      reviews: [],
      rating: 0,
      userRatingCount: 0,
    });
  }
}
