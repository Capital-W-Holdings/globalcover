'use client';

import { useState, useEffect } from 'react';
import { X, Check, Minus, Star, ArrowRight, Scale } from 'lucide-react';
import type { Product } from '@/types';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import QuoteModal from '../forms/QuoteModal';

interface ProductComparisonProps {
  products: Product[];
  onRemove: (productId: string) => void;
  onClear: () => void;
}

export default function ProductComparison({ products, onRemove, onClear }: ProductComparisonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [quoteProduct, setQuoteProduct] = useState<Product | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [dismissedHint, setDismissedHint] = useState(false);

  // Show hint after user has been on page for a bit
  useEffect(() => {
    if (products.length === 0 && !dismissedHint) {
      const timer = setTimeout(() => setShowHint(true), 8000);
      return () => clearTimeout(timer);
    } else {
      setShowHint(false);
    }
    return undefined;
  }, [products.length, dismissedHint]);

  // Hide hint when products are added
  useEffect(() => {
    if (products.length > 0) {
      setShowHint(false);
    }
  }, [products.length]);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const periodLabels: Record<Product['pricePeriod'], string> = {
    month: '/mo',
    year: '/yr',
    trip: '/trip',
  };

  // Get all unique features across selected products
  const allFeatures = Array.from(
    new Set(products.flatMap((p) => p.features))
  );

  // Empty state hint
  if (products.length === 0) {
    if (!showHint) return null;
    
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
        <div className="bg-white rounded-2xl shadow-lg border border-sand-200 px-4 py-3 flex items-center gap-3 max-w-md">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <Scale className="h-5 w-5 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sand-900">Compare products side-by-side</p>
            <p className="text-xs text-sand-500">Click the + button on any product card</p>
          </div>
          <button
            onClick={() => setDismissedHint(true)}
            className="p-1 text-sand-400 hover:text-sand-600 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Floating Comparison Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-sand-200 shadow-2xl animate-slide-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Selected Products */}
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Scale className="h-4 w-4 text-primary-600 hidden sm:block" />
                <span className="text-sm font-medium text-sand-600 whitespace-nowrap">
                  Compare <span className="text-primary-600">({products.length}/4)</span>
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 bg-primary-50 rounded-lg border border-primary-200 animate-scale-in"
                  >
                    <span className="text-xs sm:text-sm font-medium text-primary-700 whitespace-nowrap max-w-[80px] sm:max-w-none truncate">
                      {product.name}
                    </span>
                    <button
                      onClick={() => onRemove(product.id)}
                      className="p-0.5 hover:bg-primary-100 rounded transition-colors flex-shrink-0"
                      aria-label={`Remove ${product.name} from comparison`}
                    >
                      <X className="h-3.5 w-3.5 text-primary-500" />
                    </button>
                  </div>
                ))}
                {products.length < 4 && (
                  <div className="px-2 sm:px-3 py-1.5 border-2 border-dashed border-sand-300 rounded-lg text-xs text-sand-400 whitespace-nowrap">
                    + Add more
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={onClear}
                className="text-xs sm:text-sm text-sand-500 hover:text-sand-700 transition-colors hidden sm:block"
              >
                Clear
              </button>
              <Button
                size="sm"
                onClick={() => setIsExpanded(true)}
                disabled={products.length < 2}
                className="whitespace-nowrap"
              >
                {products.length < 2 ? (
                  <span className="hidden sm:inline">Add 1 more</span>
                ) : (
                  <>
                    <span className="hidden sm:inline">Compare Now</span>
                    <span className="sm:hidden">Compare</span>
                  </>
                )}
                <ArrowRight className="ml-1 sm:ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Progress indicator */}
          {products.length > 0 && products.length < 2 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1 bg-sand-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 rounded-full transition-all duration-300"
                  style={{ width: `${(products.length / 2) * 100}%` }}
                />
              </div>
              <span className="text-xs text-sand-500 flex-shrink-0">
                {2 - products.length} more to compare
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Modal */}
      <Modal
        isOpen={isExpanded}
        onClose={() => setIsExpanded(false)}
        title="Product Comparison"
      >
        <div className="max-h-[70vh] overflow-auto -mx-6 px-6">
          {/* Products Header */}
          <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${products.length}, minmax(0, 1fr))` }}>
            {products.map((product) => (
              <div key={product.id} className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-sand-100 to-sand-200 flex items-center justify-center">
                  <span className="text-lg font-bold text-sand-500">
                    {product.provider.charAt(0)}
                  </span>
                </div>
                <h4 className="font-semibold text-sand-900 text-sm line-clamp-1">
                  {product.name}
                </h4>
                <p className="text-xs text-sand-500">{product.provider}</p>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="space-y-4">
            {/* Price Row */}
            <div className="bg-sand-50 rounded-xl p-4">
              <h5 className="text-xs font-medium text-sand-500 uppercase tracking-wide mb-3">
                Price
              </h5>
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${products.length}, minmax(0, 1fr))` }}>
                {products.map((product) => (
                  <div key={product.id} className="text-center">
                    <span className="text-xl font-bold text-sand-900">
                      {formatPrice(product.priceFrom, product.currency)}
                    </span>
                    <span className="text-sand-500 text-sm">
                      {periodLabels[product.pricePeriod]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating Row */}
            <div className="bg-sand-50 rounded-xl p-4">
              <h5 className="text-xs font-medium text-sand-500 uppercase tracking-wide mb-3">
                Rating
              </h5>
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${products.length}, minmax(0, 1fr))` }}>
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-sand-900">{product.rating}</span>
                    <span className="text-xs text-sand-500">({product.reviewCount})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coverage Row */}
            <div className="bg-sand-50 rounded-xl p-4">
              <h5 className="text-xs font-medium text-sand-500 uppercase tracking-wide mb-3">
                Coverage Limit
              </h5>
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${products.length}, minmax(0, 1fr))` }}>
                {products.map((product) => (
                  <div key={product.id} className="text-center">
                    <span className="font-semibold text-sand-900">{product.coverageLimit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Deductible Row */}
            <div className="bg-sand-50 rounded-xl p-4">
              <h5 className="text-xs font-medium text-sand-500 uppercase tracking-wide mb-3">
                Deductible
              </h5>
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${products.length}, minmax(0, 1fr))` }}>
                {products.map((product) => (
                  <div key={product.id} className="text-center">
                    <span className="font-semibold text-sand-900">{product.deductible}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features Comparison */}
            <div className="bg-sand-50 rounded-xl p-4">
              <h5 className="text-xs font-medium text-sand-500 uppercase tracking-wide mb-3">
                Features
              </h5>
              <div className="space-y-2">
                {allFeatures.slice(0, 8).map((feature) => (
                  <div 
                    key={feature} 
                    className="grid gap-4 py-2 border-b border-sand-200 last:border-0"
                    style={{ gridTemplateColumns: `repeat(${products.length}, minmax(0, 1fr))` }}
                  >
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center justify-center">
                        {product.features.includes(feature) ? (
                          <div className="flex items-center gap-1.5">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-xs text-sand-600 line-clamp-1 hidden sm:block">
                              {feature.length > 20 ? feature.slice(0, 20) + '...' : feature}
                            </span>
                          </div>
                        ) : (
                          <Minus className="h-4 w-4 text-sand-300" />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Get Quote Buttons */}
          <div 
            className="grid gap-4 mt-6 pt-4 border-t border-sand-200"
            style={{ gridTemplateColumns: `repeat(${products.length}, minmax(0, 1fr))` }}
          >
            {products.map((product) => (
              <Button
                key={product.id}
                size="sm"
                onClick={() => setQuoteProduct(product)}
                fullWidth
              >
                Get Quote
              </Button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Quote Modal */}
      {quoteProduct && (
        <QuoteModal
          isOpen={!!quoteProduct}
          onClose={() => setQuoteProduct(null)}
          product={quoteProduct}
        />
      )}
    </>
  );
}
