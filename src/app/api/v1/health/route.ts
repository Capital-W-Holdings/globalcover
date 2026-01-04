import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { payments } from '@/lib/payments';
import { analytics } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: ServiceHealth;
    payments: ServiceHealth;
    analytics: ServiceHealth;
    email: ServiceHealth;
  };
}

interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  latency?: number;
  message?: string;
}

const startTime = Date.now();

async function checkDatabase(): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    // Check if database is connected
    const isConnected = db.isConnected();
    if (!isConnected) {
      await db.connect();
    }
    return {
      status: 'up',
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'down',
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : 'Database connection failed',
    };
  }
}

function checkPayments(): ServiceHealth {
  try {
    const isInitialized = payments.isInitialized();
    return {
      status: isInitialized ? 'up' : 'degraded',
      message: isInitialized ? undefined : 'Running in mock mode',
    };
  } catch (error) {
    return {
      status: 'down',
      message: error instanceof Error ? error.message : 'Payment service check failed',
    };
  }
}

function checkAnalytics(): ServiceHealth {
  try {
    const isInitialized = analytics.isInitialized();
    return {
      status: isInitialized ? 'up' : 'degraded',
      message: isInitialized ? undefined : 'Running in mock mode',
    };
  } catch (error) {
    return {
      status: 'down',
      message: error instanceof Error ? error.message : 'Analytics service check failed',
    };
  }
}

function checkEmail(): ServiceHealth {
  // Email service is fire-and-forget, so we just check if it's configured
  const hasConfig = !!process.env.SENDGRID_API_KEY;
  return {
    status: hasConfig ? 'up' : 'degraded',
    message: hasConfig ? undefined : 'Running in mock mode',
  };
}

function determineOverallStatus(services: HealthStatus['services']): 'healthy' | 'degraded' | 'unhealthy' {
  const statuses = Object.values(services).map(s => s.status);
  
  if (statuses.some(s => s === 'down')) {
    // If database is down, system is unhealthy
    if (services.database.status === 'down') {
      return 'unhealthy';
    }
    // Other services down = degraded
    return 'degraded';
  }
  
  if (statuses.some(s => s === 'degraded')) {
    return 'degraded';
  }
  
  return 'healthy';
}

export async function GET(): Promise<NextResponse<HealthStatus>> {
  const services = {
    database: await checkDatabase(),
    payments: checkPayments(),
    analytics: checkAnalytics(),
    email: checkEmail(),
  };

  const overallStatus = determineOverallStatus(services);
  
  const health: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    services,
  };

  // Return appropriate HTTP status code
  const httpStatus = overallStatus === 'unhealthy' ? 503 : 200;

  return NextResponse.json(health, { status: httpStatus });
}
