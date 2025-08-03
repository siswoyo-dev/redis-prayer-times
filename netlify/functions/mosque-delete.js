import { getRedisClient } from './_redis.js';
import { verifyToken } from './verify-token.js';

export async function handler(event) {
    if (event.httpMethod !== 'DELETE') {
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

    const { mosque_id } = JSON.parse(event.body);
    const key = `mosque:${mosque_id}`;
    const client = await getRedisClient();

    const result = await client.del(key);
    await client.lRem('mosque_keys', 0, key); // Remove from list
    await client.quit();

    if (result === 0) {
        return { statusCode: 404, body: 'Mosque not found' };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Mosque deleted', id: mosque_id }),
    };
}
