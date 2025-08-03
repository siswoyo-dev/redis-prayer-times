import jwt from 'jsonwebtoken';
import { getRedisClient } from './_redis.js';

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

export async function verifyToken(req) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid Authorization header' };
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    const redis = await getRedisClient();
    const exists = await redis.exists(`jwt:${token}`);
    await redis.quit();

    if (!exists) {
      return { valid: false, error: 'Token revoked or expired' };
    }

    return { valid: true, payload: decoded };
  } catch (err) {
    return { valid: false, error: 'Invalid or expired token' };
  }
}
