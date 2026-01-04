import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/responses';
import { searchQuerySchema } from '@/lib/validation';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { RateLimitError } from '@/lib/errors';
import { getRecommendations } from '@/lib/ai/recommendations';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(clientId, 'search');
    
    if (!rateLimit.allowed) {
      throw new RateLimitError();
    }

    // Parse and validate request body
    const body = await request.json() as unknown;
    const { query, limit } = searchQuerySchema.parse(body);

    // Get AI recommendations
    const recommendations = getRecommendations(query, limit);

    return successResponse({
      query,
      results: recommendations.products,
      suggestedCategory: recommendations.suggestedCategory,
      confidence: recommendations.confidence,
      explanation: recommendations.explanation,
      resultCount: recommendations.products.length,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
