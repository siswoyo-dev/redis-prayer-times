// netlify/functions/register-user.js
import { getRedisClient } from './_redis.js';
import bcrypt from 'bcryptjs';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Only POST method allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'username and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const redis = await getRedisClient();

    // refuse duplicates
    if (await redis.exists(`user:${username}`)) {
      await redis.quit();
      return new Response(JSON.stringify({ error: 'Username already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const hash = await bcrypt.hash(password, 10); // 10 = salt rounds
    await redis.set(`user:${username}`, hash);
    await redis.quit();

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Register error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
