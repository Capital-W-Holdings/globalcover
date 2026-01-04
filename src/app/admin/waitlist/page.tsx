'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Mail,
  Hash,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Share2,
  Tag
} from 'lucide-react';
import { useAdminApi } from '@/components/admin/AdminAuthContext';

interface WaitlistEntry {
  id: string;
  email: string;
  firstName: string;
  interests: string[];
  referralCode: string;
  referredBy: string | null;
  position: number;
  verified: boolean;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

const interestLabels: Record<string, string> = {
  travel: 'Travel',
  wellness: 'Wellness',
  wearables: 'Wearables',
  lifestyle: 'Lifestyle',
  finance: 'Finance',
  professional: 'Professional',
};

function WaitlistCard({ entry }: { entry: WaitlistEntry }) {
  return (
    <div className="bg-white rounded-xl border border-sand-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sand-900 truncate">
              {entry.firstName}
            </h3>
            {entry.verified ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <CheckCircle className="h-3 w-3" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                <Clock className="h-3 w-3" />
                Pending
              </span>
            )}
          </div>
          
          <div className="space-y-2 mt-3 text-sm">
            <div className="flex items-center gap-2 text-sand-600">
              <Mail className="h-4 w-4 text-sand-400" />
              <a href={`mailto:${entry.email}`} className="hover:text-primary-600 truncate">
                {entry.email}
              </a>
            </div>
            <div className="flex items-center gap-2 text-sand-600">
              <Hash className="h-4 w-4 text-sand-400" />
              <span className="font-mono">Position #{entry.position}</span>
            </div>
            <div className="flex items-center gap-2 text-sand-600">
              <Share2 className="h-4 w-4 text-sand-400" />
              <span className="font-mono text-xs bg-sand-100 px-2 py-0.5 rounded">
                {entry.referralCode}
              </span>
            </div>
          </div>

          {/* Interests */}
          {entry.interests.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {entry.interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary-50 text-primary-700"
                >
                  <Tag className="h-3 w-3" />
                  {interestLabels[interest] ?? interest}
                </span>
              ))}
            </div>
          )}

          {entry.referredBy && (
            <div className="mt-2">
              <span className="text-xs bg-accent-100 text-accent-700 px-2 py-1 rounded-full">
                Referred by: {entry.referredBy}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-sand-100 flex items-center justify-between text-xs text-sand-400">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Joined: {new Date(entry.createdAt).toLocaleDateString()}
        </span>
        {entry.verifiedAt && (
          <span>Verified: {new Date(entry.verifiedAt).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
}

export default function AdminWaitlistPage() {
  const { fetchWithAuth } = useAdminApi();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const loadEntries = useCallback(async (page: number = 0, verified?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: '12',
        offset: String(page * 12),
      });
      if (verified === 'verified') {
        params.set('verified', 'true');
      } else if (verified === 'pending') {
        params.set('verified', 'false');
      }

      const response = await fetchWithAuth(`/api/v1/admin/waitlist?${params}`);
      setEntries(response.data.entries);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load waitlist');
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    void loadEntries(currentPage, verifiedFilter);
  }, [loadEntries, currentPage, verifiedFilter]);

  const handleFilterChange = (filter: string) => {
    setVerifiedFilter(filter);
    setCurrentPage(0);
  };

  const filteredEntries = searchQuery
    ? entries.filter(entry => 
        entry.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.referralCode.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : entries;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <div>
            <h3 className="font-medium text-red-800">Failed to load waitlist</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
        <button
          onClick={() => void loadEntries(currentPage, verifiedFilter)}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sand-900">Waitlist</h1>
          <p className="text-sand-500">
            {pagination ? `${pagination.total} total signups` : 'Loading...'}
          </p>
        </div>
        <button
          onClick={() => void loadEntries(currentPage, verifiedFilter)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-sand-200 rounded-xl text-sand-700 hover:bg-sand-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-sand-400" />
          <input
            type="text"
            placeholder="Search by name, email, or referral code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={verifiedFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-sand-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-colors"
          >
            <option value="all">All Signups</option>
            <option value="verified">Verified Only</option>
            <option value="pending">Pending Only</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-sand-200 p-4">
          <p className="text-sm text-sand-500">Total Signups</p>
          <p className="text-2xl font-bold text-sand-900">{pagination?.total ?? '—'}</p>
        </div>
        <div className="bg-white rounded-xl border border-sand-200 p-4">
          <p className="text-sm text-sand-500">Verified</p>
          <p className="text-2xl font-bold text-green-600">
            {entries.filter(e => e.verified).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-sand-200 p-4">
          <p className="text-sm text-sand-500">Referrals Used</p>
          <p className="text-2xl font-bold text-primary-600">
            {entries.filter(e => e.referredBy).length}
          </p>
        </div>
      </div>

      {/* Entries Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-sand-200 p-5 animate-pulse">
              <div className="h-6 w-3/4 bg-sand-200 rounded mb-2" />
              <div className="h-4 w-1/2 bg-sand-200 rounded mb-4" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-sand-100 rounded" />
                <div className="h-4 w-2/3 bg-sand-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-sand-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-sand-900 mb-2">No waitlist entries found</h3>
          <p className="text-sand-500">
            {searchQuery ? 'Try adjusting your search' : 'Signups will appear here'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredEntries.map((entry) => (
            <WaitlistCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total > 12 && (
        <div className="flex items-center justify-between pt-4 border-t border-sand-200">
          <p className="text-sm text-sand-500">
            Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-2 rounded-lg border border-sand-200 hover:bg-sand-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="px-3 py-1 text-sm text-sand-600">
              Page {currentPage + 1}
            </span>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={!pagination.hasMore}
              className="p-2 rounded-lg border border-sand-200 hover:bg-sand-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
