/**
 * Rate Limiting Tests
 */

import { checkRateLimit, getClientIdentifier, getRateLimitConfig } from '../lib/rate-limit';

describe('Rate Limiting', () => {
  describe('checkRateLimit', () => {
    test('allows first request', () => {
      const result = checkRateLimit('test-user-1', 'default');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
    });

    test('tracks request count', () => {
      const id = `test-user-${Date.now()}`;
      
      const first = checkRateLimit(id, 'quote');
      expect(first.allowed).toBe(true);
      expect(first.remaining).toBe(4); // 5 max - 1 used
      
      const second = checkRateLimit(id, 'quote');
      expect(second.allowed).toBe(true);
      expect(second.remaining).toBe(3);
    });

    test('blocks after limit exceeded', () => {
      const id = `rate-test-${Date.now()}`;
      
      // Use up all 3 waitlist requests
      for (let i = 0; i < 3; i++) {
        checkRateLimit(id, 'waitlist');
      }
      
      // Fourth request should be blocked
      const blocked = checkRateLimit(id, 'waitlist');
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.resetIn).toBeGreaterThan(0);
    });

    test('uses different limits per type', () => {
      const id = `multi-${Date.now()}`;
      
      // Quote has limit of 5
      const quote = checkRateLimit(id, 'quote');
      expect(quote.remaining).toBe(4);
      
      // Waitlist has limit of 3
      const waitlist = checkRateLimit(id, 'waitlist');
      expect(waitlist.remaining).toBe(2);
      
      // Different stores, so counts are independent
    });

    test('falls back to default config for unknown limit', () => {
      const result = checkRateLimit('test', 'unknown-limit-name');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(29); // default is 30
    });
  });

  describe('getClientIdentifier', () => {
    test('extracts IP from x-forwarded-for', () => {
      const request = new Request('http://localhost', {
        headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
      });
      expect(getClientIdentifier(request)).toBe('1.2.3.4');
    });

    test('prefers cf-connecting-ip', () => {
      const request = new Request('http://localhost', {
        headers: {
          'cf-connecting-ip': '10.0.0.1',
          'x-forwarded-for': '1.2.3.4',
        },
      });
      expect(getClientIdentifier(request)).toBe('10.0.0.1');
    });

    test('returns anonymous when no IP headers', () => {
      const request = new Request('http://localhost');
      expect(getClientIdentifier(request)).toBe('anonymous');
    });

    test('handles x-real-ip header', () => {
      const request = new Request('http://localhost', {
        headers: { 'x-real-ip': '192.168.1.1' },
      });
      expect(getClientIdentifier(request)).toBe('192.168.1.1');
    });
  });

  describe('getRateLimitConfig', () => {
    test('returns config for known limit', () => {
      const config = getRateLimitConfig('quote');
      expect(config.maxRequests).toBe(5);
      expect(config.windowMs).toBe(60000);
    });

    test('returns default for unknown limit', () => {
      const config = getRateLimitConfig('nonexistent');
      expect(config.maxRequests).toBe(30);
    });
  });
});
