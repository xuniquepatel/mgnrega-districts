import Redis from 'ioredis';
import { config } from '../config.js';
export const redis = new Redis(config.redisUrl);
export async function cached<T>(key: string, ttlSec: number, fn: () => Promise<T>): Promise<T> {
  const cachedVal = await redis.get(key);
  if (cachedVal) return JSON.parse(cachedVal);
  const fresh = await fn();
  await redis.set(key, JSON.stringify(fresh), 'EX', ttlSec);
  return fresh;
}