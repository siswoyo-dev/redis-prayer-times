import { getRedisClient } from './_redis.js';
import { v4 as uuidv4 } from 'uuid';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Only POST method allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { mosque_name, address = '', image_url = '', latitude, longitude } = await req.json();

    if (!mosque_name || typeof latitude !== 'number' || typeof longitude !== 'number') {
      return new Response(
        JSON.stringify({
          error: 'Missing or invalid fields: mosque_name, latitude, longitude are required',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const id = uuidv4();
    const redis = await getRedisClient();

    // GEOADD to spatial index
    await redis.sendCommand([
      'GEOADD',
      'mosques:locations',
      longitude.toString(),
      latitude.toString(),
      id,
    ]);

    // Save mosque metadata
    await redis.set(
      `mosque:${id}`,
      JSON.stringify({
        mosque_name,
        address,
        image_url,
        latitude,
        longitude,
      })
    );

    await redis.quit();

    return new Response(
      JSON.stringify({
        success: true,
        mosque: {
          id,
          mosque_name,
          address,
          image_url,
          latitude,
          longitude,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Mosque GEOADD Error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
