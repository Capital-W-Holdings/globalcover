'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { useAdminApi } from '@/components/admin/AdminAuthContext';

interface Lead {
  id: string;
  productId: string;
  productName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  country: string;
  startDate: string;
  message: string | null;
  referralCode: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

const statusConfig = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
  contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  qualified: { label: 'Qualified', color: 'bg-purple-100 text-purple-700', icon: CheckCircle },
  converted: { label: 'Converted', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  lost: { label: 'Lost', color: 'bg-red-100 text-red-700', icon: XCircle },
};

function LeadCard({ lead }: { lead: Lead }) {
  const status = statusConfig[lead.status];
  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-xl border border-sand-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sand-900 truncate">
              {lead.firstName} {lead.lastName}
            </h3>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </span>
          </div>
          <p className="text-sm text-primary-600 font-medium mb-3">{lead.productName}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-sand-600">
              <Mail className="h-4 w-4 text-sand-400" />
              <a href={`mailto:${lead.email}`} className="hover:text-primary-600 truncate">
                {lead.email}
              </a>
            </div>
            {lead.phone && (
              <div className="flex items-center gap-2 text-sand-600">
                <Phone className="h-4 w-4 text-sand-400" />
                <a href={`tel:${lead.phone}`} className="hover:text-primary-600">
                  {lead.phone}
                </a>
              </div>
            )}
            <div className="flex items-center gap-2 text-sand-600">
              <MapPin className="h-4 w-4 text-sand-400" />
              <span>{lead.country}</span>
            </div>
            <div className="flex items-center gap-2 text-sand-600">
              <Calendar className="h-4 w-4 text-sand-400" />
              <span>Start: {lead.startDate}</span>
            </div>
          </div>

          {lead.message && (
            <div className="mt-3 p-3 bg-sand-50 rounded-lg">
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-sand-400 mt-0.5" />
                <p className="text-sm text-sand-600 line-clamp-2">{lead.message}</p>
              </div>
            </div>
          )}

          {lead.referralCode && (
            <div className="mt-2">
              <span className="text-xs bg-accent-100 text-accent-700 px-2 py-1 rounded-full">
                Referral: {lead.referralCode}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-sand-100 flex items-center justify-between text-xs text-sand-400">
        <span>ID: {lead.id}</span>
        <span>Created: {new Date(lead.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

export default function AdminLeadsPage() {
  const { fetchWithAuth } = useAdminApi();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const loadLeads = useCallback(async (page: number = 0, status?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: '12',
        offset: String(page * 12),
      });
      if (status && status !== 'all') {
        params.set('status', status);
      }

      const response = await fetchWithAuth(`/api/v1/admin/leads?${params}`);
      setLeads(response.data.leads);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    void loadLeads(currentPage, statusFilter);
  }, [loadLeads, currentPage, statusFilter]);

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(0);
  };

  const filteredLeads = searchQuery
    ? leads.filter(lead => 
        lead.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.productName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : leads;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <div>
            <h3 className="font-medium text-red-800">Failed to load leads</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
        <button
          onClick={() => void loadLeads(currentPage, statusFilter)}
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
          <h1 className="text-2xl font-bold text-sand-900">Leads</h1>
          <p className="text-sand-500">
            {pagination ? `${pagination.total} total leads` : 'Loading...'}
          </p>
        </div>
        <button
          onClick={() => void loadLeads(currentPage, statusFilter)}
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
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-sand-400" />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-sand-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-colors"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Leads Grid */}
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
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-sand-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-sand-900 mb-2">No leads found</h3>
          <p className="text-sand-500">
            {searchQuery ? 'Try adjusting your search' : 'Leads will appear here when customers request quotes'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
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
