/**
 * Rate Limiting Module
 * 
 * IMPORTANT: In-memory rate limiting does NOT work in serverless environments
 * where each request may hit a different instance with fresh memory.
 * 
 * For production, use one of these approaches:
 * 1. Upstash Redis: npm install @upstash/ratelimit @upstash/redis
 * 2. Vercel KV: Use Vercel's built-in KV store
 * 3. External Redis: Use ioredis with a Redis instance
 * 
 * This implementation provides:
 * - In-memory fallback for local development
 * - Clear warnings when used in production without proper backend
 * - Interface compatible with Redis-based implementation
 */

type RateLimitStore = Map<string, { count: number; resetTime: number }>;

const stores: Map<string, RateLimitStore> = new Map();
let warnedAboutMemoryStore = false;

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

const defaultConfigs: Record<string, RateLimitConfig> = {
  quote: { maxRequests: 5, windowMs: 60000 },     // 5 per minute
  waitlist: { maxRequests: 3, windowMs: 60000 },  // 3 per minute
  search: { maxRequests: 10, windowMs: 60000 },   // 10 per minute
  checkout: { maxRequests: 5, windowMs: 60000 },  // 5 per minute
  default: { maxRequests: 30, windowMs: 60000 },  // 30 per minute
};

// Check if we're in a serverless environment
function isServerless(): boolean {
  return !!(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY
  );
}

function getStore(name: string): RateLimitStore {
  let store = stores.get(name);
  if (!store) {
    store = new Map();
    stores.set(name, store);
  }
  return store;
}

function cleanupStore(store: RateLimitStore): void {
  const now = Date.now();
  const keysToDelete: string[] = [];
  store.forEach((value, key) => {
    if (now > value.resetTime) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach((key) => store.delete(key));
}

/**
 * Check rate limit for an identifier
 * 
 * WARNING: This in-memory implementation is for development only.
 * In production serverless environments, this will NOT work correctly.
 * 
 * To implement proper rate limiting, use:
 * ```typescript
 * import { Ratelimit } from '@upstash/ratelimit';
 * import { Redis } from '@upstash/redis';
 * 
 * const redis = Redis.fromEnv();
 * const ratelimit = new Ratelimit({
 *   redis,
 *   limiter: Ratelimit.slidingWindow(10, '60 s'),
 *   analytics: true,
 * });
 * 
 * const { success, remaining, reset } = await ratelimit.limit(identifier);
 * ```
 */
export function checkRateLimit(
  identifier: string,
  limitName: string = 'default'
): RateLimitResult {
  // Warn once about using in-memory store in serverless
  if (isServerless() && !warnedAboutMemoryStore && process.env.NODE_ENV === 'production') {
    console.warn(
      '[RateLimit] WARNING: Using in-memory rate limiting in serverless environment. ' +
      'This is INEFFECTIVE. Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN ' +
      'for production rate limiting.'
    );
    warnedAboutMemoryStore = true;
  }

  const config = defaultConfigs[limitName] ?? defaultConfigs.default;
  if (!config) {
    return { allowed: true, remaining: 30, resetIn: 60000 };
  }
  
  const store = getStore(limitName);
  const now = Date.now();
  
  // Cleanup old entries periodically
  if (Math.random() < 0.1) {
    cleanupStore(store);
  }
  
  const record = store.get(identifier);
  
  if (!record || now > record.resetTime) {
    store.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }
  
  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: record.resetTime - now,
    };
  }
  
  record.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetIn: record.resetTime - now,
  };
}

/**
 * Async version for Redis-based rate limiting (future implementation)
 * This interface is ready for when you switch to Upstash/Redis
 */
export async function checkRateLimitAsync(
  identifier: string,
  limitName: string = 'default'
): Promise<RateLimitResult> {
  // TODO: Implement Redis-based rate limiting
  // Example with Upstash:
  // const { success, remaining, reset } = await ratelimit.limit(`${limitName}:${identifier}`);
  // return { allowed: success, remaining, resetIn: reset - Date.now() };
  
  return checkRateLimit(identifier, limitName);
}

export function getClientIdentifier(request: Request): string {
  // Try multiple headers for client IP (in order of reliability)
  const headers = [
    'cf-connecting-ip',      // Cloudflare
    'x-real-ip',             // Nginx
    'x-forwarded-for',       // Standard proxy header
    'x-vercel-forwarded-for', // Vercel
  ];
  
  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first (client IP)
      return value.split(',')[0]?.trim() ?? 'anonymous';
    }
  }
  
  return 'anonymous';
}

/**
 * Get rate limit configuration for a specific limit type
 */
export function getRateLimitConfig(limitName: string): RateLimitConfig {
  return defaultConfigs[limitName] ?? defaultConfigs.default ?? { maxRequests: 30, windowMs: 60000 };
}
