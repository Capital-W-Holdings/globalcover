'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Sparkles, X, Loader2, TrendingUp, Clock, Users } from 'lucide-react';
import type { Product, InsuranceCategory } from '@/types';

interface SearchResult {
  query: string;
  results: Product[];
  suggestedCategory: InsuranceCategory | null;
  confidence: 'high' | 'medium' | 'low';
  explanation: string;
  resultCount: number;
}

interface SearchBarProps {
  onResults: (results: SearchResult | null) => void;
  onCategoryChange?: (category: InsuranceCategory | 'all') => void;
}

interface TrendingSuggestion {
  query: string;
  label: string;
  icon: 'trending' | 'clock' | 'users';
  badge?: string;
}

// Dynamic suggestions based on "trending" and seasonal relevance
const trendingSuggestions: TrendingSuggestion[] = [
  { query: "digital nomad health insurance", label: "Digital nomad health coverage", icon: 'trending', badge: 'Popular' },
  { query: "travel insurance thailand", label: "Thailand travel insurance", icon: 'users', badge: '47 searching' },
  { query: "remote worker liability", label: "Remote worker liability", icon: 'trending' },
  { query: "expat health coverage europe", label: "Expat health in Europe", icon: 'clock', badge: 'New' },
  { query: "laptop gear protection", label: "Electronics & gear protection", icon: 'users', badge: '23 searching' },
];

const quickFilters = [
  { label: 'Under $50/mo', value: 'budget' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Worldwide', value: 'global' },
];

export default function SearchBar({ onResults, onCategoryChange }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gc_recent_searches');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved) as string[]);
        } catch {
          // Invalid JSON, ignore
        }
      }
    }
  }, []);

  const saveRecentSearch = (searchQuery: string) => {
    if (typeof window !== 'undefined' && searchQuery.length >= 3) {
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 3);
      setRecentSearches(updated);
      localStorage.setItem('gc_recent_searches', JSON.stringify(updated));
    }
  };

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      onResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch('/api/v1/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, limit: 6 }),
      });

      const result = await response.json() as { success: boolean; data?: SearchResult; error?: string };

      if (result.success && result.data) {
        onResults(result.data);
        saveRecentSearch(searchQuery);
        
        // If high confidence, also update category filter
        if (result.data.confidence === 'high' && result.data.suggestedCategory && onCategoryChange) {
          onCategoryChange(result.data.suggestedCategory);
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, [onResults, onCategoryChange, recentSearches]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      void performSearch(value);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    void performSearch(suggestion);
  };

  const handleClear = () => {
    setQuery('');
    onResults(null);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void performSearch(query);
  };

  const handleQuickFilter = (filter: string) => {
    const filterQueries: Record<string, string> = {
      budget: 'affordable insurance under $50',
      rating: 'top rated insurance 4.5 stars',
      global: 'worldwide coverage international',
    };
    const filterQuery = filterQueries[filter] ?? '';
    setQuery(filterQuery);
    void performSearch(filterQuery);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const IconComponent = ({ type }: { type: 'trending' | 'clock' | 'users' }) => {
    switch (type) {
      case 'trending': return <TrendingUp className="h-4 w-4 text-accent-500" />;
      case 'clock': return <Clock className="h-4 w-4 text-primary-400" />;
      case 'users': return <Users className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          {/* Search Icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sand-400">
            {isSearching ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Describe your insurance needs..."
            className="w-full pl-12 pr-24 py-4 rounded-2xl border-2 border-sand-200 
                       bg-white text-sand-900 placeholder:text-sand-400
                       focus:border-primary-500 focus:ring-4 focus:ring-primary-100 
                       transition-all duration-200 text-base"
          />

          {/* Right side buttons */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-sand-400 hover:text-sand-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              disabled={isSearching || query.length < 3}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white 
                         rounded-lg text-sm font-medium hover:bg-primary-700 
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">AI Search</span>
            </button>
          </div>
        </div>
      </form>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mt-3">
        {quickFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleQuickFilter(filter.value)}
            className="px-3 py-1.5 text-xs font-medium bg-sand-100 text-sand-600 
                       rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors"
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && !query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-sand-200 shadow-xl z-20 overflow-hidden animate-slide-down">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-3 border-b border-sand-100">
              <p className="text-xs font-medium text-sand-500 uppercase tracking-wide mb-2">
                Recent Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(search)}
                    className="px-3 py-1.5 text-sm bg-sand-50 text-sand-700 rounded-lg 
                               hover:bg-primary-50 hover:text-primary-700 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Suggestions */}
          <div className="p-3">
            <p className="text-xs font-medium text-sand-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Trending Now
            </p>
          </div>
          <ul>
            {trendingSuggestions.map((suggestion, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion.query)}
                  className="w-full px-4 py-3 text-left text-sand-700 hover:bg-primary-50 
                             hover:text-primary-700 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <IconComponent type={suggestion.icon} />
                    <span>{suggestion.label}</span>
                  </div>
                  {suggestion.badge && (
                    <span className={`
                      text-xs font-medium px-2 py-0.5 rounded-full
                      ${suggestion.badge === 'Popular' ? 'bg-accent-100 text-accent-700' : 
                        suggestion.badge === 'New' ? 'bg-green-100 text-green-700' :
                        'bg-sand-100 text-sand-600'}
                    `}>
                      {suggestion.badge}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
