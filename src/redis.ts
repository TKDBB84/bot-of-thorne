import Redis from 'ioredis';
const redis = new Redis({ keyPrefix: 'CotBot:' });
await redis.connect();
export default redis;
