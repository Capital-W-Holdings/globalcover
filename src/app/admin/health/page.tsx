'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Database,
  CreditCard,
  BarChart3,
  Mail,
  Activity,
  Clock,
  Zap,
  Shield
} from 'lucide-react';
import { useAdminApi } from '@/components/admin/AdminAuthContext';

interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  latency?: number;
  message?: string;
}

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

interface CircuitStats {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failures: number;
  successes: number;
  lastFailure: string | null;
  lastSuccess: string | null;
  totalCalls: number;
  totalFailures: number;
}

interface CircuitsResponse {
  circuits: Record<string, CircuitStats>;
  summary: {
    total: number;
    open: number;
    halfOpen: number;
    closed: number;
  };
}

const serviceIcons: Record<string, React.ElementType> = {
  database: Database,
  payments: CreditCard,
  analytics: BarChart3,
  email: Mail,
};

const statusConfig = {
  up: { label: 'Healthy', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
  down: { label: 'Down', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  degraded: { label: 'Degraded', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: AlertTriangle },
};

const circuitStateConfig = {
  CLOSED: { label: 'Closed', color: 'bg-green-100 text-green-700', description: 'Normal operation' },
  OPEN: { label: 'Open', color: 'bg-red-100 text-red-700', description: 'Failing, requests blocked' },
  HALF_OPEN: { label: 'Half-Open', color: 'bg-yellow-100 text-yellow-700', description: 'Testing recovery' },
};

function ServiceCard({ name, health }: { name: string; health: ServiceHealth }) {
  const Icon = serviceIcons[name] ?? Activity;
  const status = statusConfig[health.status];
  const StatusIcon = status.icon;

  return (
    <div className={`bg-white rounded-xl border-2 p-5 transition-all ${status.color.replace('bg-', 'border-').replace('-100', '-200')}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${status.color.split(' ')[0]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sand-900 capitalize">{name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <StatusIcon className={`h-4 w-4 ${status.color.split(' ')[1]}`} />
              <span className={`text-sm font-medium ${status.color.split(' ')[1]}`}>
                {status.label}
              </span>
            </div>
          </div>
        </div>
        {health.latency !== undefined && (
          <div className="text-right">
            <p className="text-xs text-sand-500">Latency</p>
            <p className="font-mono text-sm font-medium text-sand-700">{health.latency}ms</p>
          </div>
        )}
      </div>
      {health.message && (
        <p className="mt-3 text-sm text-sand-600 bg-sand-50 p-2 rounded-lg">
          {health.message}
        </p>
      )}
    </div>
  );
}

function CircuitCard({ name, stats }: { name: string; stats: CircuitStats }) {
  const state = circuitStateConfig[stats.state];

  return (
    <div className="bg-white rounded-xl border border-sand-200 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sand-900 capitalize">{name}</h3>
          <p className="text-xs text-sand-500 mt-1">{state.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${state.color}`}>
          {state.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-sand-50 rounded-lg p-3">
          <p className="text-sand-500 text-xs">Total Calls</p>
          <p className="font-semibold text-sand-900">{stats.totalCalls}</p>
        </div>
        <div className="bg-sand-50 rounded-lg p-3">
          <p className="text-sand-500 text-xs">Total Failures</p>
          <p className="font-semibold text-sand-900">{stats.totalFailures}</p>
        </div>
        <div className="bg-sand-50 rounded-lg p-3">
          <p className="text-sand-500 text-xs">Recent Successes</p>
          <p className="font-semibold text-green-600">{stats.successes}</p>
        </div>
        <div className="bg-sand-50 rounded-lg p-3">
          <p className="text-sand-500 text-xs">Recent Failures</p>
          <p className="font-semibold text-red-600">{stats.failures}</p>
        </div>
      </div>

      {(stats.lastFailure || stats.lastSuccess) && (
        <div className="mt-4 pt-4 border-t border-sand-100 text-xs text-sand-500 space-y-1">
          {stats.lastSuccess && (
            <p>Last success: {new Date(stats.lastSuccess).toLocaleString()}</p>
          )}
          {stats.lastFailure && (
            <p>Last failure: {new Date(stats.lastFailure).toLocaleString()}</p>
          )}
        </div>
      )}
    </div>
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds % 60}s`;
}

export default function AdminHealthPage() {
  const { fetchWithAuth } = useAdminApi();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [circuits, setCircuits] = useState<CircuitsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch both health and circuit status
      const [healthRes, circuitsRes] = await Promise.all([
        fetch('/api/v1/health').then(r => r.json()),
        fetchWithAuth('/api/v1/admin/circuits'),
      ]);
      
      setHealth(healthRes);
      setCircuits(circuitsRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load health data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    void loadData();
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => void loadData(), 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  const overallStatusConfig = {
    healthy: { label: 'All Systems Operational', color: 'bg-green-500', textColor: 'text-green-700' },
    degraded: { label: 'Partial Degradation', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
    unhealthy: { label: 'System Issues Detected', color: 'bg-red-500', textColor: 'text-red-700' },
  };

  const overallStatus = health ? overallStatusConfig[health.status] : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sand-900">System Health</h1>
          <p className="text-sand-500">
            {health ? `Last checked: ${new Date(health.timestamp).toLocaleTimeString()}` : 'Loading...'}
          </p>
        </div>
        <button
          onClick={() => void loadData()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-sand-200 rounded-xl text-sand-700 hover:bg-sand-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Overall Status Banner */}
      {health && overallStatus && (
        <div className={`rounded-2xl p-6 ${health.status === 'healthy' ? 'bg-green-50' : health.status === 'degraded' ? 'bg-yellow-50' : 'bg-red-50'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-4 h-4 rounded-full ${overallStatus.color} animate-pulse`} />
              <div>
                <h2 className={`text-lg font-semibold ${overallStatus.textColor}`}>
                  {overallStatus.label}
                </h2>
                <p className="text-sm text-sand-600">Version {health.version}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-sand-400" />
                <span className="text-sand-600">Uptime: {formatUptime(health.uptime)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Grid */}
      <div>
        <h2 className="text-lg font-semibold text-sand-900 mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary-600" />
          Service Status
        </h2>
        {isLoading && !health ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-sand-200 p-5 animate-pulse">
                <div className="h-10 w-10 bg-sand-200 rounded-lg mb-3" />
                <div className="h-5 w-24 bg-sand-200 rounded mb-2" />
                <div className="h-4 w-16 bg-sand-100 rounded" />
              </div>
            ))}
          </div>
        ) : health ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(health.services).map(([name, service]) => (
              <ServiceCard key={name} name={name} health={service} />
            ))}
          </div>
        ) : null}
      </div>

      {/* Circuit Breakers */}
      <div>
        <h2 className="text-lg font-semibold text-sand-900 mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary-600" />
          Circuit Breakers
        </h2>
        {circuits && (
          <>
            {/* Circuit Summary */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-700">{circuits.summary.closed}</p>
                <p className="text-sm text-green-600">Closed (Normal)</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-yellow-700">{circuits.summary.halfOpen}</p>
                <p className="text-sm text-yellow-600">Half-Open (Testing)</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-red-700">{circuits.summary.open}</p>
                <p className="text-sm text-red-600">Open (Blocked)</p>
              </div>
            </div>

            {/* Circuit Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(circuits.circuits).map(([name, stats]) => (
                <CircuitCard key={name} name={name} stats={stats} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-sand-50 rounded-xl p-6">
        <h3 className="font-semibold text-sand-900 mb-2">About Circuit Breakers</h3>
        <p className="text-sm text-sand-600 mb-4">
          Circuit breakers protect the system from cascade failures when external services are unavailable.
        </p>
        <ul className="text-sm text-sand-600 space-y-1">
          <li><span className="font-medium text-green-700">Closed:</span> Normal operation, requests pass through</li>
          <li><span className="font-medium text-red-700">Open:</span> Service failing, requests blocked to prevent overload</li>
          <li><span className="font-medium text-yellow-700">Half-Open:</span> Testing if service has recovered</li>
        </ul>
      </div>
    </div>
  );
}
