import { NextRequest } from 'next/server';
import { products, getProductsByCategory } from '@/data/products';
import { successResponse, errorResponse } from '@/lib/responses';
import { productFilterSchema } from '@/lib/validation';
import type { InsuranceCategory, Product } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate filters
    const rawFilters = {
      category: searchParams.get('category') ?? undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
      sortBy: searchParams.get('sortBy') ?? undefined,
      search: searchParams.get('search') ?? undefined,
    };

    const filters = productFilterSchema.parse(rawFilters);
    
    // Start with all products or filtered by category
    let filteredProducts: Product[] = filters.category 
      ? getProductsByCategory(filters.category as InsuranceCategory)
      : [...products];

    // Apply price filters
    if (filters.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter((p) => p.priceFrom >= (filters.minPrice ?? 0));
    }
    if (filters.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter((p) => p.priceFrom <= (filters.maxPrice ?? Infinity));
    }

    // Apply rating filter
    if (filters.minRating !== undefined) {
      filteredProducts = filteredProducts.filter((p) => p.rating >= (filters.minRating ?? 0));
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.provider.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.bestFor.some((b) => b.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-asc':
          filteredProducts.sort((a, b) => a.priceFrom - b.priceFrom);
          break;
        case 'price-desc':
          filteredProducts.sort((a, b) => b.priceFrom - a.priceFrom);
          break;
        case 'rating':
          filteredProducts.sort((a, b) => b.rating - a.rating);
          break;
        case 'popular':
          filteredProducts.sort((a, b) => b.reviewCount - a.reviewCount);
          break;
      }
    }

    return successResponse(filteredProducts);
  } catch (error) {
    return errorResponse(error);
  }
}
