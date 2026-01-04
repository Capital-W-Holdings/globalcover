'use client';

import { useState } from 'react';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';

interface ProductFiltersProps {
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'popular';
  onFiltersChange: (filters: {
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'popular';
  }) => void;
}

const priceRanges = [
  { label: 'Any Price', min: undefined, max: undefined },
  { label: 'Under $25/mo', min: undefined, max: 25 },
  { label: '$25 - $50/mo', min: 25, max: 50 },
  { label: '$50 - $100/mo', min: 50, max: 100 },
  { label: '$100 - $200/mo', min: 100, max: 200 },
  { label: 'Over $200/mo', min: 200, max: undefined },
];

const ratingOptions = [
  { label: 'Any Rating', value: undefined },
  { label: '4.5+ Stars', value: 4.5 },
  { label: '4.0+ Stars', value: 4.0 },
  { label: '3.5+ Stars', value: 3.5 },
];

const sortOptions = [
  { label: 'Most Popular', value: 'popular' as const },
  { label: 'Highest Rated', value: 'rating' as const },
  { label: 'Price: Low to High', value: 'price-asc' as const },
  { label: 'Price: High to Low', value: 'price-desc' as const },
];

export default function ProductFilters({
  minPrice,
  maxPrice,
  minRating,
  sortBy = 'popular',
  onFiltersChange,
}: ProductFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFiltersCount = [
    minPrice !== undefined || maxPrice !== undefined,
    minRating !== undefined,
    sortBy !== 'popular',
  ].filter(Boolean).length;

  const handlePriceChange = (min?: number, max?: number) => {
    onFiltersChange({ minPrice: min, maxPrice: max, minRating, sortBy });
  };

  const handleRatingChange = (rating?: number) => {
    onFiltersChange({ minPrice, maxPrice, minRating: rating, sortBy });
  };

  const handleSortChange = (sort: typeof sortBy) => {
    onFiltersChange({ minPrice, maxPrice, minRating, sortBy: sort });
  };

  const clearFilters = () => {
    onFiltersChange({
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      sortBy: 'popular',
    });
  };

  const getCurrentPriceLabel = () => {
    const range = priceRanges.find(
      (r) => r.min === minPrice && r.max === maxPrice
    );
    return range?.label ?? 'Custom';
  };

  const getCurrentRatingLabel = () => {
    const option = ratingOptions.find((r) => r.value === minRating);
    return option?.label ?? 'Any Rating';
  };

  const getCurrentSortLabel = () => {
    const option = sortOptions.find((s) => s.value === sortBy);
    return option?.label ?? 'Most Popular';
  };

  return (
    <div className="mb-6">
      {/* Toggle Button */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm
            transition-all duration-200
            ${isExpanded || activeFiltersCount > 0
              ? 'bg-primary-100 text-primary-700'
              : 'bg-sand-100 text-sand-700 hover:bg-sand-200'
            }
          `}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="px-1.5 py-0.5 bg-primary-600 text-white text-xs rounded-md">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-sand-500 hover:text-sand-700 transition-colors"
          >
            <X className="h-4 w-4" />
            Clear all
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="bg-sand-50 rounded-2xl p-4 space-y-4 animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-sand-700 mb-2">
                Price Range
              </label>
              <div className="relative">
                <select
                  value={`${minPrice ?? ''}-${maxPrice ?? ''}`}
                  onChange={(e) => {
                    const [min, max] = e.target.value.split('-');
                    handlePriceChange(
                      min ? Number(min) : undefined,
                      max ? Number(max) : undefined
                    );
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 bg-white 
                             text-sand-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent
                             appearance-none cursor-pointer"
                >
                  {priceRanges.map((range) => (
                    <option 
                      key={range.label} 
                      value={`${range.min ?? ''}-${range.max ?? ''}`}
                    >
                      {range.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sand-400 pointer-events-none" />
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-sand-700 mb-2">
                Minimum Rating
              </label>
              <div className="relative">
                <select
                  value={minRating ?? ''}
                  onChange={(e) => handleRatingChange(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 bg-white 
                             text-sand-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent
                             appearance-none cursor-pointer"
                >
                  {ratingOptions.map((option) => (
                    <option key={option.label} value={option.value ?? ''}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sand-400 pointer-events-none" />
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-sand-700 mb-2">
                Sort By
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 bg-white 
                             text-sand-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent
                             appearance-none cursor-pointer"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sand-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filter Pills */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {(minPrice !== undefined || maxPrice !== undefined) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  {getCurrentPriceLabel()}
                  <button onClick={() => handlePriceChange(undefined, undefined)}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}
              {minRating !== undefined && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  {getCurrentRatingLabel()}
                  <button onClick={() => handleRatingChange(undefined)}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}
              {sortBy !== 'popular' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  {getCurrentSortLabel()}
                  <button onClick={() => handleSortChange('popular')}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
