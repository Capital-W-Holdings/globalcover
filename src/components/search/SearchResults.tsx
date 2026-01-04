'use client';

import { Sparkles, ArrowRight, X } from 'lucide-react';
import type { Product, InsuranceCategory } from '@/types';
import { ProductCard } from '../products';
import Button from '../ui/Button';

interface SearchResultsProps {
  query: string;
  results: Product[];
  suggestedCategory: InsuranceCategory | null;
  confidence: 'high' | 'medium' | 'low';
  explanation: string;
  onClear: () => void;
  onViewAll?: (category: InsuranceCategory) => void;
}

export default function SearchResults({
  query,
  results,
  suggestedCategory,
  confidence,
  explanation,
  onClear,
  onViewAll,
}: SearchResultsProps) {
  const confidenceColors = {
    high: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-sand-100 text-sand-600 border-sand-200',
  };

  const confidenceLabels = {
    high: 'High confidence',
    medium: 'Moderate confidence',
    low: 'Low confidence',
  };

  return (
    <div className="mb-8 animate-fade-in">
      {/* Results Header */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-6 mb-6 border border-primary-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary-100 rounded-xl">
              <Sparkles className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sand-900">AI Recommendations</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${confidenceColors[confidence]}`}>
                  {confidenceLabels[confidence]}
                </span>
              </div>
              <p className="text-sand-600 text-sm mb-2">
                Searching for: <span className="font-medium text-sand-800">&quot;{query}&quot;</span>
              </p>
              <p className="text-sand-700">{explanation}</p>
            </div>
          </div>
          <button
            onClick={onClear}
            className="p-2 text-sand-400 hover:text-sand-600 hover:bg-sand-100 rounded-lg transition-colors"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* View all in category */}
        {suggestedCategory && onViewAll && (
          <div className="mt-4 pt-4 border-t border-primary-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewAll(suggestedCategory)}
              className="text-primary-600 hover:text-primary-700"
            >
              View all {suggestedCategory} insurance
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Results Grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-sand-50 rounded-2xl">
          <p className="text-sand-600">
            No products found matching your search. Try different keywords or browse categories.
          </p>
        </div>
      )}
    </div>
  );
}
