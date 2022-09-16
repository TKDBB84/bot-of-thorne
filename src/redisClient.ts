import Redis from 'ioredis';

const redisClient = new Redis({ keyPrefix: 'CotBot:' });
export default redisClient;
