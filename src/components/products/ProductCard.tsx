'use client';

import { useState } from 'react';
import { Star, Check, ArrowRight, ExternalLink, Plus, CheckCircle, ChevronUp } from 'lucide-react';
import type { Product } from '@/types';
import Button from '../ui/Button';
import QuoteModal from '../forms/QuoteModal';
import QuickQuote from './QuickQuote';

interface ProductCardProps {
  product: Product;
  isSelected?: boolean;
  onCompareToggle?: (product: Product) => void;
  compareDisabled?: boolean;
  showQuickQuote?: boolean;
}

export default function ProductCard({ 
  product, 
  isSelected = false,
  onCompareToggle,
  compareDisabled = false,
  showQuickQuote = false,
}: ProductCardProps) {
  const [showQuote, setShowQuote] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [quickQuoteExpanded, setQuickQuoteExpanded] = useState(false);

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(product.priceFrom);

  const periodLabels = {
    month: '/mo',
    year: '/yr',
    trip: '/trip',
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCompareToggle) {
      onCompareToggle(product);
    }
  };

  const handleQuickQuoteSuccess = () => {
    setTimeout(() => {
      setQuickQuoteExpanded(false);
    }, 3000);
  };

  return (
    <>
      <div 
        className={`
          group relative bg-white rounded-2xl border transition-all duration-300
          ${isSelected
            ? 'border-primary-500 ring-2 ring-primary-200 shadow-lg'
            : isHovered 
              ? 'border-primary-300 shadow-xl shadow-primary-100/50 -translate-y-1' 
              : 'border-sand-200 shadow-sm hover:shadow-lg'
          }
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Compare Toggle */}
        {onCompareToggle && (
          <button
            onClick={handleCompareClick}
            disabled={compareDisabled && !isSelected}
            className={`
              absolute top-3 left-3 z-10 p-2 rounded-lg transition-all duration-200
              ${isSelected
                ? 'bg-primary-600 text-white'
                : compareDisabled
                  ? 'bg-sand-100 text-sand-400 cursor-not-allowed'
                  : 'bg-white/90 text-sand-600 hover:bg-primary-50 hover:text-primary-600 shadow-sm border border-sand-200'
              }
            `}
            title={isSelected ? 'Remove from comparison' : compareDisabled ? 'Max 4 products' : 'Add to comparison'}
          >
            {isSelected ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            {/* Provider Logo Placeholder */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sand-100 to-sand-200 flex items-center justify-center">
              <span className="text-lg font-bold text-sand-500">
                {product.provider.charAt(0)}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 rounded-lg">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-amber-700 text-sm">{product.rating}</span>
              <span className="text-amber-600/70 text-xs">({product.reviewCount})</span>
            </div>
          </div>

          {/* Title & Provider */}
          <div className="mb-3">
            <h3 className="font-display font-semibold text-lg text-sand-900 group-hover:text-primary-700 transition-colors">
              {product.name}
            </h3>
            <p className="text-sand-500 text-sm">by {product.provider}</p>
          </div>

          {/* Description */}
          <p className="text-sand-600 text-sm line-clamp-2 mb-4">
            {product.shortDescription}
          </p>

          {/* Highlights */}
          <div className="flex flex-wrap gap-2 mb-4">
            {product.highlights.slice(0, 3).map((highlight) => (
              <span 
                key={highlight}
                className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-lg"
              >
                {highlight}
              </span>
            ))}
          </div>

          {/* Features Preview */}
          <ul className="space-y-2 mb-4">
            {product.features.slice(0, 3).map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-sand-600">
                <Check className="h-4 w-4 text-primary-500 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-1">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Divider */}
        <div className="border-t border-sand-100" />

        {/* Footer */}
        <div className="p-6 pt-4">
          {/* Price */}
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-sm text-sand-500">From</span>
            <span className="text-2xl font-display font-bold text-sand-900">
              {formattedPrice}
            </span>
            <span className="text-sand-500">{periodLabels[product.pricePeriod]}</span>
          </div>

          {/* Quick Quote Inline (if enabled) */}
          {showQuickQuote && quickQuoteExpanded && (
            <div className="mb-4 animate-slide-down">
              <QuickQuote 
                product={product} 
                onSuccess={handleQuickQuoteSuccess}
                onExpandForm={() => {
                  setQuickQuoteExpanded(false);
                  setShowQuote(true);
                }}
              />
            </div>
          )}

          {/* Actions */}
          {showQuickQuote ? (
            <div className="space-y-2">
              {!quickQuoteExpanded && (
                <Button 
                  fullWidth 
                  onClick={() => setQuickQuoteExpanded(true)}
                  className="group/btn"
                >
                  Quick Quote
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              )}
              <button
                onClick={() => {
                  if (quickQuoteExpanded) {
                    setQuickQuoteExpanded(false);
                  } else {
                    setShowQuote(true);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm 
                           text-sand-600 hover:text-primary-600 transition-colors"
              >
                {quickQuoteExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide quick quote
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4" />
                    Full quote form
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button 
                fullWidth 
                onClick={() => setShowQuote(true)}
                className="group/btn"
              >
                Get Quote
                <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" className="px-3">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Best For Badge */}
        {product.bestFor.length > 0 && (
          <div className="absolute -top-2 -right-2">
            <div className="px-3 py-1.5 bg-accent-500 text-white text-xs font-semibold rounded-lg shadow-lg transform rotate-3">
              Best for {product.bestFor[0]}
            </div>
          </div>
        )}
      </div>

      <QuoteModal
        isOpen={showQuote}
        onClose={() => setShowQuote(false)}
        product={product}
      />
    </>
  );
}
