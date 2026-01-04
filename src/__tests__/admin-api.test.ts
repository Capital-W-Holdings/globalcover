/**
 * Admin API Tests
 * 
 * Tests admin endpoints with authentication.
 */

import { NextRequest } from 'next/server';

// Import route handlers
import { GET as getAdminLeads } from '../app/api/v1/admin/leads/route';
import { GET as getAdminWaitlist } from '../app/api/v1/admin/waitlist/route';
import { GET as getAdminStats } from '../app/api/v1/admin/stats/route';

// Store original env
const originalEnv = process.env;

beforeAll(() => {
  // Set test admin API key
  process.env = {
    ...originalEnv,
    ADMIN_API_KEY: 'test-admin-key-12345',
  };
});

afterAll(() => {
  process.env = originalEnv;
});

// Helper to create mock requests
function createAdminRequest(
  url: string,
  options: {
    apiKey?: string;
    includeAuth?: boolean;
  } = {}
): NextRequest {
  const { apiKey = 'test-admin-key-12345', includeAuth = true } = options;
  
  const headers = new Headers({
    'Content-Type': 'application/json',
  });
  
  if (includeAuth) {
    headers.set('Authorization', `Bearer ${apiKey}`);
  }
  
  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method: 'GET',
    headers,
  });
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

describe('Admin Authentication', () => {
  test('rejects request without auth header', async () => {
    const request = createAdminRequest('http://localhost:3000/api/v1/admin/leads', {
      includeAuth: false,
    });
    const response = await getAdminLeads(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error).toContain('Authorization');
  });

  test('rejects request with invalid API key', async () => {
    const request = createAdminRequest('http://localhost:3000/api/v1/admin/leads', {
      apiKey: 'wrong-key',
    });
    const response = await getAdminLeads(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error).toContain('Invalid');
  });

  test('rejects request with malformed auth header', async () => {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': 'Basic not-bearer-format',
    });
    
    const request = new NextRequest(
      new URL('http://localhost:3000/api/v1/admin/leads'),
      { method: 'GET', headers }
    );
    const response = await getAdminLeads(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(401);
    expect(json.success).toBe(false);
  });
});

describe('Admin Leads API', () => {
  test('GET /api/v1/admin/leads returns leads with valid auth', async () => {
    const request = createAdminRequest('http://localhost:3000/api/v1/admin/leads');
    const response = await getAdminLeads(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    const data = json.data as { leads: unknown[]; pagination: unknown };
    expect(Array.isArray(data.leads)).toBe(true);
    expect(data.pagination).toBeDefined();
  });

  test('GET /api/v1/admin/leads respects pagination', async () => {
    const request = createAdminRequest('http://localhost:3000/api/v1/admin/leads?limit=5&offset=0');
    const response = await getAdminLeads(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(200);
    const data = json.data as { leads: unknown[]; pagination: { limit: number } };
    expect(data.pagination.limit).toBe(5);
  });

  test('GET /api/v1/admin/leads handles invalid pagination gracefully', async () => {
    const request = createAdminRequest('http://localhost:3000/api/v1/admin/leads?limit=invalid&offset=NaN');
    const response = await getAdminLeads(request);
    const json = await parseResponse(response);
    
    // Should use defaults instead of failing
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    const data = json.data as { pagination: { limit: number; offset: number } };
    expect(data.pagination.limit).toBe(50); // default
    expect(data.pagination.offset).toBe(0); // default
  });

  test('GET /api/v1/admin/leads?status=new filters by status', async () => {
    const request = createAdminRequest('http://localhost:3000/api/v1/admin/leads?status=new');
    const response = await getAdminLeads(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
  });
});

describe('Admin Waitlist API', () => {
  test('GET /api/v1/admin/waitlist returns entries with valid auth', async () => {
    const request = createAdminRequest('http://localhost:3000/api/v1/admin/waitlist');
    const response = await getAdminWaitlist(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    const data = json.data as { entries: unknown[]; pagination: unknown };
    expect(Array.isArray(data.entries)).toBe(true);
    expect(data.pagination).toBeDefined();
  });

  test('GET /api/v1/admin/waitlist?verified=true filters verified', async () => {
    const request = createAdminRequest('http://localhost:3000/api/v1/admin/waitlist?verified=true');
    const response = await getAdminWaitlist(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
  });

  test('GET /api/v1/admin/waitlist?verified=false filters unverified', async () => {
    const request = createAdminRequest('http://localhost:3000/api/v1/admin/waitlist?verified=false');
    const response = await getAdminWaitlist(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
  });

  test('GET /api/v1/admin/waitlist handles invalid pagination', async () => {
    const request = createAdminRequest('http://localhost:3000/api/v1/admin/waitlist?limit=-5&offset=abc');
    const response = await getAdminWaitlist(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(200);
    const data = json.data as { pagination: { limit: number; offset: number } };
    // -5 gets clamped to minimum of 1, 'abc' falls back to default 0
    expect(data.pagination.limit).toBe(1); // clamped to min
    expect(data.pagination.offset).toBe(0); // default
  });
});

describe('Admin Stats API', () => {
  test('GET /api/v1/admin/stats returns stats with valid auth', async () => {
    const request = createAdminRequest('http://localhost:3000/api/v1/admin/stats');
    const response = await getAdminStats(request);
    const json = await parseResponse(response);
    
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    
    const data = json.data as {
      leads: { total: number; new: number; converted: number; conversionRate: string };
      waitlist: { total: number; verified: number; verificationRate: string };
      payments: { total: number; revenue: { amount: number; formatted: string } };
      generatedAt: string;
    };
    
    expect(data.leads).toBeDefined();
    expect(data.waitlist).toBeDefined();
    expect(data.payments).toBeDefined();
    expect(data.generatedAt).toBeDefined();
  });

  test('stats include calculated conversion rates', async () => {
    const request = createAdminRequest('http://localhost:3000/api/v1/admin/stats');
    const response = await getAdminStats(request);
    const json = await parseResponse(response);
    
    const data = json.data as {
      leads: { conversionRate: string };
      waitlist: { verificationRate: string };
    };
    
    expect(data.leads.conversionRate).toMatch(/^\d+\.\d+%$/);
    expect(data.waitlist.verificationRate).toMatch(/^\d+\.\d+%$/);
  });

  test('stats include formatted revenue', async () => {
    const request = createAdminRequest('http://localhost:3000/api/v1/admin/stats');
    const response = await getAdminStats(request);
    const json = await parseResponse(response);
    
    const data = json.data as {
      payments: { revenue: { formatted: string } };
    };
    
    expect(data.payments.revenue.formatted).toMatch(/^\$\d+\.\d{2}$/);
  });

  test('rejects stats request without auth', async () => {
    const request = createAdminRequest('http://localhost:3000/api/v1/admin/stats', {
      includeAuth: false,
    });
    const response = await getAdminStats(request);
    
    expect(response.status).toBe(401);
  });
});
