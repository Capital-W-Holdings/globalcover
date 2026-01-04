import { NextRequest } from 'next/server';
import { benefits, getBenefitsByCategory } from '@/data/benefits';
import { successResponse, errorResponse } from '@/lib/responses';
import { benefitFilterSchema } from '@/lib/validation';
import type { BenefitCategory, Benefit } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate filters
    const rawFilters = {
      category: searchParams.get('category') ?? undefined,
      exclusive: searchParams.get('exclusive') === 'true' ? true : undefined,
      availability: searchParams.get('availability') ?? undefined,
      sortBy: searchParams.get('sortBy') ?? undefined,
    };

    const filters = benefitFilterSchema.parse(rawFilters);
    
    // Start with all benefits or filtered by category
    let filteredBenefits: Benefit[] = filters.category 
      ? getBenefitsByCategory(filters.category as BenefitCategory)
      : [...benefits];

    // Apply exclusive filter
    if (filters.exclusive !== undefined) {
      filteredBenefits = filteredBenefits.filter((b) => b.exclusive === filters.exclusive);
    }

    // Apply availability filter
    if (filters.availability) {
      filteredBenefits = filteredBenefits.filter((b) => b.availability === filters.availability);
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'discount':
          filteredBenefits.sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0));
          break;
        case 'popular':
          // Sort by discount for now (would be based on actual usage data in production)
          filteredBenefits.sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0));
          break;
        case 'newest':
          // Keep original order (would be based on createdAt in production)
          break;
      }
    }

    return successResponse(filteredBenefits);
  } catch (error) {
    return errorResponse(error);
  }
}
