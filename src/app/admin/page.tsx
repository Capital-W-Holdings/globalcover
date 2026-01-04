'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  ClipboardList, 
  DollarSign, 
  TrendingUp,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAdminApi } from '@/components/admin/AdminAuthContext';

interface Stats {
  totalLeads: number;
  newLeads: number;
  convertedLeads: number;
  totalWaitlist: number;
  verifiedWaitlist: number;
  totalPayments: number;
  totalRevenue: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { value: number; positive: boolean };
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ title, value, subtitle, icon: Icon, trend, color }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-sand-100">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend.positive ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`h-4 w-4 ${!trend.positive && 'rotate-180'}`} />
            {trend.value}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-sand-900">{value}</p>
        <p className="text-sm text-sand-500 mt-1">{title}</p>
        {subtitle && (
          <p className="text-xs text-sand-400 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

interface RecentActivity {
  id: string;
  type: 'lead' | 'waitlist' | 'payment';
  title: string;
  description: string;
  time: string;
  status: 'success' | 'pending' | 'new';
}

function ActivityItem({ activity }: { activity: RecentActivity }) {
  const icons = {
    lead: ClipboardList,
    waitlist: Users,
    payment: DollarSign,
  };
  const statusIcons = {
    success: CheckCircle,
    pending: Clock,
    new: AlertCircle,
  };
  const statusColors = {
    success: 'text-green-500',
    pending: 'text-orange-500',
    new: 'text-blue-500',
  };

  const Icon = icons[activity.type];
  const StatusIcon = statusIcons[activity.status];

  return (
    <div className="flex items-start gap-4 p-4 hover:bg-sand-50 rounded-xl transition-colors">
      <div className="p-2 bg-sand-100 rounded-lg">
        <Icon className="h-5 w-5 text-sand-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-sand-900">{activity.title}</p>
        <p className="text-sm text-sand-500 truncate">{activity.description}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <StatusIcon className={`h-4 w-4 ${statusColors[activity.status]}`} />
        <span className="text-xs text-sand-400">{activity.time}</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { fetchWithAuth } = useAdminApi();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth('/api/v1/admin/stats');
      setStats(response.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    void loadStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => void loadStats(), 30000);
    return () => clearInterval(interval);
  }, [loadStats]);

  // Mock recent activity (in production, fetch from API)
  const recentActivity: RecentActivity[] = [
    { id: '1', type: 'lead', title: 'New Quote Request', description: 'Travel insurance for Thailand', time: '2m ago', status: 'new' },
    { id: '2', type: 'waitlist', title: 'Waitlist Signup', description: 'john.doe@example.com joined', time: '5m ago', status: 'success' },
    { id: '3', type: 'payment', title: 'Subscription Started', description: 'Annual plan - $99.00', time: '12m ago', status: 'success' },
    { id: '4', type: 'lead', title: 'Quote Requested', description: 'Health insurance for Portugal', time: '25m ago', status: 'pending' },
    { id: '5', type: 'waitlist', title: 'Referral Used', description: 'Code ABC123 redeemed', time: '1h ago', status: 'success' },
  ];

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <div>
            <h3 className="font-medium text-red-800">Failed to load dashboard</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
        <button
          onClick={() => void loadStats()}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sand-900">Dashboard</h1>
          <p className="text-sand-500">
            {lastUpdated 
              ? `Last updated ${lastUpdated.toLocaleTimeString()}`
              : 'Loading...'
            }
          </p>
        </div>
        <button
          onClick={() => void loadStats()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-sand-200 rounded-xl text-sand-700 hover:bg-sand-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Leads"
          value={isLoading ? '—' : stats?.totalLeads ?? 0}
          subtitle={`${stats?.newLeads ?? 0} new`}
          icon={ClipboardList}
          color="blue"
        />
        <StatCard
          title="Waitlist Signups"
          value={isLoading ? '—' : stats?.totalWaitlist ?? 0}
          subtitle={`${stats?.verifiedWaitlist ?? 0} verified`}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Conversions"
          value={isLoading ? '—' : stats?.convertedLeads ?? 0}
          subtitle={stats && stats.totalLeads > 0 
            ? `${((stats.convertedLeads / stats.totalLeads) * 100).toFixed(1)}% rate`
            : 'No leads yet'
          }
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Revenue"
          value={isLoading ? '—' : `$${((stats?.totalRevenue ?? 0) / 100).toLocaleString()}`}
          subtitle={`${stats?.totalPayments ?? 0} payments`}
          icon={DollarSign}
          color="orange"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-sand-100">
          <div className="px-6 py-4 border-b border-sand-100">
            <h2 className="font-semibold text-sand-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-sand-100">
            {recentActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-sand-100">
          <div className="px-6 py-4 border-b border-sand-100">
            <h2 className="font-semibold text-sand-900">Quick Actions</h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <a
              href="/admin/leads"
              className="p-4 rounded-xl border border-sand-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
            >
              <ClipboardList className="h-6 w-6 text-sand-400 group-hover:text-primary-600 mb-2" />
              <p className="font-medium text-sand-900">View Leads</p>
              <p className="text-sm text-sand-500">Manage quote requests</p>
            </a>
            <a
              href="/admin/waitlist"
              className="p-4 rounded-xl border border-sand-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
            >
              <Users className="h-6 w-6 text-sand-400 group-hover:text-primary-600 mb-2" />
              <p className="font-medium text-sand-900">Waitlist</p>
              <p className="text-sm text-sand-500">View signups</p>
            </a>
            <a
              href="/admin/health"
              className="p-4 rounded-xl border border-sand-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
            >
              <TrendingUp className="h-6 w-6 text-sand-400 group-hover:text-primary-600 mb-2" />
              <p className="font-medium text-sand-900">System Health</p>
              <p className="text-sm text-sand-500">Monitor services</p>
            </a>
            <a
              href="/"
              target="_blank"
              className="p-4 rounded-xl border border-sand-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
            >
              <DollarSign className="h-6 w-6 text-sand-400 group-hover:text-primary-600 mb-2" />
              <p className="font-medium text-sand-900">View Site</p>
              <p className="text-sm text-sand-500">Open public site</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
