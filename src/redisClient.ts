import { Redis } from 'ioredis';

const redisClient = new Redis(`redis://default:@${
  process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,{
  keyPrefix: 'CotBot:'
});
export default redisClient;
