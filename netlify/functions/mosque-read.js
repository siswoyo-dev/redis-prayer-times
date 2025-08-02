import { getRedisClient } from './_redis.js';

export async function handler() {
    const client = await getRedisClient();
    const keys = await client.lRange('mosque_keys', 0, -1);
    const results = await Promise.all(keys.map(key => client.get(key)));
    await client.quit();

    const mosques = results.map(item => JSON.parse(item));
    return {
        statusCode: 200,
        body: JSON.stringify(mosques),
    };
}
