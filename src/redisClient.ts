import Redis from 'ioredis';
const redisClient = new Redis({ keyPrefix: 'CotBot:' });
await redisClient.connect();
export default redisClient;
