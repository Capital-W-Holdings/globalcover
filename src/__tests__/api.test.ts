/**
 * API Integration Tests
 * 
 * Tests API route handlers with mock requests.
 * These tests verify the full request/response cycle.
 */

import { NextRequest } from 'next/server';

// Import route handlers
import { GET as getProducts } from '../app/api/v1/products/route';
import { GET as getBenefits } from '../app/api/v1/benefits/route';
import { GET as getCategories } from '../app/api/v1/categories/route';
import { POST as postSearch } from '../app/api/v1/search/route';
import { POST as postQuote } from '../app/api/v1/leads/quote/route';
import { POST as postWaitlist } from '../app/api/v1/waitlist/route';
import { GET as getCheckoutPricing, POST as postCheckout } from '../app/api/v1/checkout/route';

// Helper to create mock requests
function createRequest(
  url: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  } = {}
): NextRequest {
  const { method = 'GET', body, headers = {} } = options;
  
  const requestHeaders = new Headers({
    'Content-Type': 'application/json',
    'x-forwarded-for': `test-${Date.now()}`, // Unique IP per test
    ...headers,
  });
  
  const requestInit: {
    method: string;
    headers: Headers;
    body?: string;
  } = {
    method,
    headers: requestHeaders,
  };
  
  if (body) {
    requestInit.body = JSON.stringify(body);
  }
  
  return new NextRequest(new URL(url, 'http://localhost:3000'), requestInit);
}

// Helper to parse JSON response
async function parseResponse(response: Response): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { success: false, error: text };
  }
}

describe('Products API', () => {
  test('GET /api/v1/products returns all products', async () => {
    const request = createRequest('http://localhost:3000/api/v1/products');
    const response = await getProducts(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect((json.data as unknown[]).length).toBeGreaterThan(0);
  });

  test('GET /api/v1/products?category=travel filters by category', async () => {
    const request = createRequest('http://localhost:3000/api/v1/products?category=travel');
    const response = await getProducts(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    const products = json.data as Array<{ category: string }>;
    expect(products.every(p => p.category === 'travel')).toBe(true);
  });

  test('GET /api/v1/products?minPrice=100 filters by price', async () => {
    const request = createRequest('http://localhost:3000/api/v1/products?minPrice=100');
    const response = await getProducts(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(200);
    const products = json.data as Array<{ priceFrom: number }>;
    expect(products.every(p => p.priceFrom >= 100)).toBe(true);
  });

  test('GET /api/v1/products?sortBy=rating sorts correctly', async () => {
    const request = createRequest('http://localhost:3000/api/v1/products?sortBy=rating');
    const response = await getProducts(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(200);
    const products = json.data as Array<{ rating: number }>;
    for (let i = 0; i < products.length - 1; i++) {
      expect(products[i]?.rating).toBeGreaterThanOrEqual(products[i + 1]?.rating ?? 0);
    }
  });

  test('GET /api/v1/products?category=invalid returns validation error', async () => {
    const request = createRequest('http://localhost:3000/api/v1/products?category=invalid');
    const response = await getProducts(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
  });
});

describe('Benefits API', () => {
  test('GET /api/v1/benefits returns all benefits', async () => {
    const request = createRequest('http://localhost:3000/api/v1/benefits');
    const response = await getBenefits(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
  });

  test('GET /api/v1/benefits?category=wellness filters correctly', async () => {
    const request = createRequest('http://localhost:3000/api/v1/benefits?category=wellness');
    const response = await getBenefits(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(200);
    const benefits = json.data as Array<{ category: string }>;
    expect(benefits.every(b => b.category === 'wellness')).toBe(true);
  });

  test('GET /api/v1/benefits?exclusive=true filters exclusive', async () => {
    const request = createRequest('http://localhost:3000/api/v1/benefits?exclusive=true');
    const response = await getBenefits(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(200);
    const benefits = json.data as Array<{ exclusive: boolean }>;
    expect(benefits.every(b => b.exclusive === true)).toBe(true);
  });
});

describe('Categories API', () => {
  test('GET /api/v1/categories returns categories', async () => {
    // Note: Categories route is static and doesn't take a request argument
    const response = await getCategories();
    const json = await parseResponse(response);
    
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
  });
});

describe('Search API', () => {
  test('POST /api/v1/search returns recommendations', async () => {
    const request = createRequest('http://localhost:3000/api/v1/search', {
      method: 'POST',
      body: { query: 'travel insurance for nomads' },
    });
    const response = await postSearch(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    const data = json.data as { results: unknown[]; confidence: string };
    expect(Array.isArray(data.results)).toBe(true);
    expect(['low', 'medium', 'high']).toContain(data.confidence);
  });

  test('POST /api/v1/search validates query', async () => {
    const request = createRequest('http://localhost:3000/api/v1/search', {
      method: 'POST',
      body: { query: '' },
    });
    const response = await postSearch(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
  });

  test('POST /api/v1/search respects limit parameter', async () => {
    const request = createRequest('http://localhost:3000/api/v1/search', {
      method: 'POST',
      body: { query: 'insurance', limit: 3 },
    });
    const response = await postSearch(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(200);
    const data = json.data as { results: unknown[] };
    expect(data.results.length).toBeLessThanOrEqual(3);
  });
});

describe('Quote API', () => {
  test('POST /api/v1/leads/quote creates lead', async () => {
    const request = createRequest('http://localhost:3000/api/v1/leads/quote', {
      method: 'POST',
      body: {
        productId: 'travel-001',
        productName: 'Test Insurance',
        firstName: 'John',
        lastName: 'Doe',
        email: `test-${Date.now()}@example.com`,
        country: 'US',
        startDate: '2025-03-01',
      },
    });
    const response = await postQuote(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    const data = json.data as { id: string };
    expect(data.id).toMatch(/^lead_/);
  });

  test('POST /api/v1/leads/quote validates email', async () => {
    const request = createRequest('http://localhost:3000/api/v1/leads/quote', {
      method: 'POST',
      body: {
        productId: 'travel-001',
        productName: 'Test',
        firstName: 'John',
        lastName: 'Doe',
        email: 'not-an-email',
        country: 'US',
        startDate: '2025-03-01',
      },
    });
    const response = await postQuote(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
  });

  test('POST /api/v1/leads/quote validates phone format', async () => {
    const request = createRequest('http://localhost:3000/api/v1/leads/quote', {
      method: 'POST',
      body: {
        productId: 'travel-001',
        productName: 'Test',
        firstName: 'John',
        lastName: 'Doe',
        email: 'valid@email.com',
        phone: 'invalid-phone-format!',
        country: 'US',
        startDate: '2025-03-01',
      },
    });
    const response = await postQuote(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
  });

  test('POST /api/v1/leads/quote accepts valid phone', async () => {
    const request = createRequest('http://localhost:3000/api/v1/leads/quote', {
      method: 'POST',
      body: {
        productId: 'travel-001',
        productName: 'Test',
        firstName: 'John',
        lastName: 'Doe',
        email: `phone-test-${Date.now()}@example.com`,
        phone: '+1 (555) 123-4567',
        country: 'US',
        startDate: '2025-03-01',
      },
    });
    const response = await postQuote(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
  });
});

describe('Waitlist API', () => {
  test('POST /api/v1/waitlist creates entry', async () => {
    const request = createRequest('http://localhost:3000/api/v1/waitlist', {
      method: 'POST',
      body: {
        email: `waitlist-${Date.now()}@example.com`,
        firstName: 'Jane',
        interests: ['travel', 'wellness'],
      },
    });
    const response = await postWaitlist(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    const data = json.data as { id: string; position: number; referralCode: string };
    expect(data.id).toMatch(/^wl_/);
    expect(data.position).toBeGreaterThan(0);
    expect(data.referralCode).toHaveLength(8);
  });

  test('POST /api/v1/waitlist requires interests', async () => {
    const request = createRequest('http://localhost:3000/api/v1/waitlist', {
      method: 'POST',
      body: {
        email: 'test@example.com',
        firstName: 'Jane',
        interests: [],
      },
    });
    const response = await postWaitlist(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
  });

  test('POST /api/v1/waitlist rejects duplicate email', async () => {
    const email = `duplicate-${Date.now()}@example.com`;
    
    // First signup
    const request1 = createRequest('http://localhost:3000/api/v1/waitlist', {
      method: 'POST',
      body: { email, firstName: 'First', interests: ['travel'] },
    });
    await postWaitlist(request1);
    
    // Duplicate signup (different IP to bypass rate limit)
    const request2 = createRequest('http://localhost:3000/api/v1/waitlist', {
      method: 'POST',
      body: { email, firstName: 'Second', interests: ['wellness'] },
      headers: { 'x-forwarded-for': `different-ip-${Date.now()}` },
    });
    const response = await postWaitlist(request2);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toContain('already on the waitlist');
  });
});

describe('Checkout API', () => {
  test('GET /api/v1/checkout returns pricing', async () => {
    const request = createRequest('http://localhost:3000/api/v1/checkout');
    const response = await getCheckoutPricing(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    const data = json.data as { prices: { monthly: unknown; annual: unknown } };
    expect(data.prices.monthly).toBeDefined();
    expect(data.prices.annual).toBeDefined();
  });

  test('POST /api/v1/checkout creates session', async () => {
    const request = createRequest('http://localhost:3000/api/v1/checkout', {
      method: 'POST',
      body: {
        email: `checkout-${Date.now()}@example.com`,
        planType: 'monthly',
      },
    });
    const response = await postCheckout(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    const data = json.data as { sessionId: string; url: string };
    expect(data.sessionId).toBeDefined();
    expect(data.url).toContain('checkout');
  });

  test('POST /api/v1/checkout validates planType', async () => {
    const request = createRequest('http://localhost:3000/api/v1/checkout', {
      method: 'POST',
      body: {
        email: 'test@example.com',
        planType: 'invalid',
      },
    });
    const response = await postCheckout(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
  });
});
