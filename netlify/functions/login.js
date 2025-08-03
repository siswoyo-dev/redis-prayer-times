import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getRedisClient } from './_redis.js';

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';
const TOKEN_TTL_S = 60 * 60;          // 1 hour

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
    const hash  = await redis.get(`user:${username}`);
    if (!hash || !(await bcrypt.compare(password, hash))) {
      await redis.quit();
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: TOKEN_TTL_S });
    await redis.set(`jwt:${token}`, 'valid', 'EX', TOKEN_TTL_S);
    await redis.quit();

    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Login error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
