'use client';

import type { Product } from '@/types';
import ProductCard from './ProductCard';
import { LoadingCards } from '../ui/Loading';
import { ErrorCard } from '../ui/Error';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  selectedForComparison?: string[];
  onCompareToggle?: (product: Product) => void;
  maxComparison?: number;
  showQuickQuote?: boolean;
}

export default function ProductGrid({ 
  products, 
  loading = false, 
  error,
  onRetry,
  selectedForComparison = [],
  onCompareToggle,
  maxComparison = 4,
  showQuickQuote = false,
}: ProductGridProps) {
  if (loading) {
    return <LoadingCards count={6} />;
  }

  if (error) {
    return <ErrorCard message={error} retry={onRetry} />;
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sand-100 flex items-center justify-center">
          <span className="text-2xl">🔍</span>
        </div>
        <h3 className="text-lg font-semibold text-sand-900 mb-2">
          No products found
        </h3>
        <p className="text-sand-600">
          Try adjusting your filters or search criteria
        </p>
      </div>
    );
  }

  const compareDisabled = selectedForComparison.length >= maxComparison;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product, index) => (
        <div 
          key={product.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <ProductCard 
            product={product}
            isSelected={selectedForComparison.includes(product.id)}
            onCompareToggle={onCompareToggle}
            compareDisabled={compareDisabled && !selectedForComparison.includes(product.id)}
            showQuickQuote={showQuickQuote}
          />
        </div>
      ))}
    </div>
  );
}
