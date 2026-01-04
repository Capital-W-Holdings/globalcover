import { GET } from '../app/api/v1/health/route';

// Mock the dependencies
jest.mock('../lib/db', () => ({
  db: {
    isConnected: jest.fn().mockReturnValue(true),
    connect: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../lib/payments', () => ({
  payments: {
    isInitialized: jest.fn().mockReturnValue(false),
  },
}));

jest.mock('../lib/analytics', () => ({
  analytics: {
    isInitialized: jest.fn().mockReturnValue(false),
  },
}));

describe('Health Check API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return health status with all services', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('version');
    expect(data).toHaveProperty('uptime');
    expect(data).toHaveProperty('services');
    expect(data.services).toHaveProperty('database');
    expect(data.services).toHaveProperty('payments');
    expect(data.services).toHaveProperty('analytics');
    expect(data.services).toHaveProperty('email');
  });

  it('should report database as up when connected', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.services.database.status).toBe('up');
    expect(data.services.database).toHaveProperty('latency');
  });

  it('should report payments as degraded when not initialized', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.services.payments.status).toBe('degraded');
    expect(data.services.payments.message).toBe('Running in mock mode');
  });

  it('should report analytics as degraded when not initialized', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.services.analytics.status).toBe('degraded');
    expect(data.services.analytics.message).toBe('Running in mock mode');
  });

  it('should report email as degraded without SENDGRID_API_KEY', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.services.email.status).toBe('degraded');
    expect(data.services.email.message).toBe('Running in mock mode');
  });

  it('should return overall degraded status when services are in mock mode', async () => {
    const response = await GET();
    const data = await response.json();

    // With payments, analytics, and email in degraded state
    expect(data.status).toBe('degraded');
  });

  it('should include timestamp in ISO format', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('should include uptime in seconds', async () => {
    const response = await GET();
    const data = await response.json();

    expect(typeof data.uptime).toBe('number');
    expect(data.uptime).toBeGreaterThanOrEqual(0);
  });
});

describe('Health Check - Database Down', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should return 503 when database is down', async () => {
    // Re-mock with database failing
    jest.mock('../lib/db', () => ({
      db: {
        isConnected: jest.fn().mockReturnValue(false),
        connect: jest.fn().mockRejectedValue(new Error('Connection refused')),
      },
    }));

    // Re-import to get fresh mocks
    const { GET: getHealth } = await import('../app/api/v1/health/route');
    const response = await getHealth();
    
    expect(response.status).toBe(503);
    const data = await response.json();
    expect(data.status).toBe('unhealthy');
  });
});
