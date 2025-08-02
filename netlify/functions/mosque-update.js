import { getRedisClient } from './_redis.js';

export async function handler(event) {
    if (event.httpMethod !== 'PUT') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { mosque_id, ...updateData } = JSON.parse(event.body);
    const key = `mosque:${mosque_id}`;
    const client = await getRedisClient();

    const existing = await client.get(key);
    if (!existing) {
        await client.quit();
        return { statusCode: 404, body: 'Mosque not found' };
    }

    const updated = { ...JSON.parse(existing), ...updateData };
    await client.set(key, JSON.stringify(updated));
    await client.quit();

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Mosque updated', id: mosque_id }),
    };
}
