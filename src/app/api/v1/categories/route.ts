import { insuranceCategories } from '@/data/products';
import { successResponse, errorResponse } from '@/lib/responses';

export const dynamic = 'force-static';
export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    return successResponse(insuranceCategories);
  } catch (error) {
    return errorResponse(error);
  }
}
