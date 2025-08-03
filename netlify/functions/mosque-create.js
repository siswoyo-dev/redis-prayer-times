import { getRedisClient } from './_redis.js';
import { verifyToken } from './verify-token.js';

export async function handler(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // 🔐 Verify JWT
    const auth = await verifyToken(event);
    if (!auth.valid) {
       return {
         statusCode: 401,
        body: JSON.stringify({ error: auth.error }),
       };
    } 

    const data = JSON.parse(event.body);
    const client = await getRedisClient();

    const key = `mosque:${data.mosque_id}`;
    await client.set(key, JSON.stringify(data));
    await client.rPush('mosque_keys', key); // Track all mosques
    await client.quit();

    return {
        statusCode: 201,
        body: JSON.stringify({ message: 'Mosque created', id: data.mosque_id }),
    };
}
