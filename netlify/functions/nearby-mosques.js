// netlify/functions/nearby-mosques.js
import { getRedisClient } from './_redis.js';

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Only POST allowed' }), {
      status: 405,
    });
  }

  try {
    const { lat, lon, radius = 5 } = await req.json();

    if (!lat || !lon) {
      return new Response(JSON.stringify({ error: 'Latitude and longitude are required' }), {
        status: 400,
      });
    }

    const redis = await getRedisClient();

    const results = await redis.sendCommand([
      'GEORADIUS',
      'mosques:locations',
      lon.toString(),
      lat.toString(),
      radius.toString(),
      'km',
      'WITHDIST',
      'ASC'
    ]);

    const mosques = [];

    for (const [id, distance] of results) {
      const raw = await redis.get(`mosque:${id}`);
      let mosqueInfo = {
        id,
        distance: parseFloat(distance),
        name: id, //fallback to ID
      };

      if (raw) {
        const parsed = JSON.parse(raw);
        mosqueInfo = {
          ...mosqueInfo,
          name: parsed.mosque_name || id,
          address: parsed.address || '',
          image_url: parsed.image_url || '',
          latitude: parsed.latitude,
          longitude: parsed.longitude,
        };
      }

      mosques.push(mosqueInfo);
    }

    await redis.quit();

    return new Response(JSON.stringify({ mosques }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Nearby Mosque Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
};
