import Redis from "ioredis";
import { config } from "../config";

let redis: Redis;

export function initRedis(): Redis {
  redis = new Redis(config.redis.url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 1000);
    },
    lazyConnect: true,
  });

  redis.on("connect", () => console.log("[Redis] Connected"));
  redis.on("error", (err) => console.warn("[Redis] Error:", err.message));

  return redis;
}

export function getRedis(): Redis {
  if (!redis) return initRedis();
  return redis;
}

// ── Session Cache ─────────────────────────────────
export async function cacheSession(key: string, data: any, ttl = 86400): Promise<void> {
  const r = getRedis();
  await r.setex(`session:${key}`, ttl, JSON.stringify(data));
}

export async function getCachedSession(key: string): Promise<any | null> {
  const r = getRedis();
  const data = await r.get(`session:${key}`);
  return data ? JSON.parse(data) : null;
}

// ── Rate Limiting ─────────────────────────────────
export async function checkRateLimit(key: string, maxAttempts: number, windowSec: number): Promise<boolean> {
  const r = getRedis();
  const count = await r.incr(`ratelimit:${key}`);
  if (count === 1) await r.expire(`ratelimit:${key}`, windowSec);
  return count <= maxAttempts;
}

// ── Online Presence ───────────────────────────────
export async function setUserOnline(userId: string): Promise<void> {
  const r = getRedis();
  await r.setex(`presence:${userId}`, 300, "online"); // 5 min TTL
}

export async function setUserOffline(userId: string): Promise<void> {
  const r = getRedis();
  await r.del(`presence:${userId}`);
}

export async function isUserOnline(userId: string): Promise<boolean> {
  const r = getRedis();
  return (await r.exists(`presence:${userId}`)) === 1;
}
