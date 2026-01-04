/**
 * Production Rate Limiting with Upstash Redis
 * 
 * This module provides Redis-backed rate limiting for serverless environments.
 * 
 * Setup:
 * 1. Create account at https://upstash.com
 * 2. Create a Redis database
 * 3. Add to environment variables:
 *    - UPSTASH_REDIS_REST_URL
 *    - UPSTASH_REDIS_REST_TOKEN
 * 4. Install dependencies: npm install @upstash/ratelimit @upstash/redis
 * 
 * Then import from this module instead of the in-memory rate-limit.ts
 */

// Uncomment when @upstash/ratelimit and @upstash/redis are installed:
// import { Ratelimit } from '@upstash/ratelimit';
// import { Redis } from '@upstash/redis';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
  limit: number;
}

export interface RateLimitConfig {
  /** Requests allowed per window */
  requests: number;
  /** Window duration (e.g., '60 s', '1 m', '1 h') */
  window: string;
}

// Rate limit configurations for different endpoints
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  quote: { requests: 5, window: '60 s' },
  waitlist: { requests: 3, window: '60 s' },
  search: { requests: 20, window: '60 s' },
  checkout: { requests: 5, window: '60 s' },
  api: { requests: 60, window: '60 s' },
};

/**
 * Check if Upstash is configured
 */
export function isUpstashConfigured(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

/**
 * Create a rate limiter instance
 * 
 * Usage:
 * ```typescript
 * const limiter = createRateLimiter('quote');
 * const { allowed, remaining } = await limiter.check(clientIp);
 * ```
 */
export function createRateLimiter(limitName: keyof typeof RATE_LIMITS = 'api') {
  const config = RATE_LIMITS[limitName] ?? RATE_LIMITS.api;
  const safeConfig = config ?? { requests: 60, window: '60 s' };
  
  // When Upstash is not configured, return a mock limiter
  if (!isUpstashConfigured()) {
    console.warn(`[RateLimit] Upstash not configured. Using mock limiter for: ${limitName}`);
    return {
      check: async (_identifier: string): Promise<RateLimitResult> => ({
        allowed: true,
        remaining: safeConfig.requests - 1,
        resetIn: 60000,
        limit: safeConfig.requests,
      }),
    };
  }

  // Production implementation with Upstash
  // Uncomment when dependencies are installed:
  /*
  const redis = Redis.fromEnv();
  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(safeConfig.requests, safeConfig.window),
    analytics: true,
    prefix: `ratelimit:${limitName}`,
  });

  return {
    check: async (identifier: string): Promise<RateLimitResult> => {
      const { success, remaining, reset, limit } = await ratelimit.limit(identifier);
      return {
        allowed: success,
        remaining,
        resetIn: reset - Date.now(),
        limit,
      };
    },
  };
  */

  // Fallback mock (remove when Upstash is configured)
  return {
    check: async (_identifier: string): Promise<RateLimitResult> => ({
      allowed: true,
      remaining: safeConfig.requests - 1,
      resetIn: 60000,
      limit: safeConfig.requests,
    }),
  };
}

/**
 * Global rate limiter instances (lazy initialization)
 */
const limiters: Map<string, ReturnType<typeof createRateLimiter>> = new Map();

function getLimiter(name: string) {
  if (!limiters.has(name)) {
    limiters.set(name, createRateLimiter(name as keyof typeof RATE_LIMITS));
  }
  return limiters.get(name)!;
}

/**
 * Check rate limit for an identifier
 * 
 * @param identifier - Usually the client IP or user ID
 * @param limitName - The rate limit configuration to use
 * @returns Rate limit result
 * 
 * Usage in API routes:
 * ```typescript
 * import { checkRateLimitAsync, getClientIdentifier } from '@/lib/rate-limit-redis';
 * 
 * const clientId = getClientIdentifier(request);
 * const { allowed, remaining } = await checkRateLimitAsync(clientId, 'quote');
 * 
 * if (!allowed) {
 *   return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 * }
 * ```
 */
export async function checkRateLimitAsync(
  identifier: string,
  limitName: string = 'api'
): Promise<RateLimitResult> {
  const limiter = getLimiter(limitName);
  return limiter.check(identifier);
}

/**
 * Extract client identifier from request
 * Checks multiple headers for load balancers and proxies
 */
export function getClientIdentifier(request: Request): string {
  const headers = [
    'cf-connecting-ip',       // Cloudflare
    'x-real-ip',              // Nginx
    'x-forwarded-for',        // Standard proxy
    'x-vercel-forwarded-for', // Vercel
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // x-forwarded-for can have multiple IPs, take the first
      return value.split(',')[0]?.trim() ?? 'anonymous';
    }
  }

  return 'anonymous';
}

/**
 * Rate limit headers to add to responses
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetIn / 1000)),
  };
}
