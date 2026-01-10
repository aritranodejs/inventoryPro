import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
});

redisClient.on('connect', () => {
    console.log('Redis Client Connected');
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});

export default redisClient;
