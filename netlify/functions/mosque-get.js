import { getRedisClient } from './_redis.js';

export async function handler(event) {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const mosque_id = event.queryStringParameters?.mosque_id;
    if (!mosque_id) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing mosque_id parameter' }),
        };
    }

    const key = `mosque:${mosque_id}`;
    const client = await getRedisClient();
    const result = await client.get(key);
    await client.quit();

    if (!result) {
        return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Mosque not found' }),
        };
    }

    return {
        statusCode: 200,
        body: result,
    };
}
