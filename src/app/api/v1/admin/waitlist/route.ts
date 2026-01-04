import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/responses';
import { validateAdminAuth } from '@/lib/admin-auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Helper to safely parse integer with bounds
function safeParseInt(value: string | null, defaultValue: number, min: number, max: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) return defaultValue;
  return Math.min(Math.max(parsed, min), max);
}

export async function GET(request: NextRequest) {
  try {
    // Validate admin authentication
    validateAdminAuth(request);

    const { searchParams } = new URL(request.url);
    const verifiedParam = searchParams.get('verified');
    const verified = verifiedParam === 'true' ? true : verifiedParam === 'false' ? false : undefined;
    
    // Safe parsing with bounds checking
    const limit = safeParseInt(searchParams.get('limit'), 50, 1, 100);
    const offset = safeParseInt(searchParams.get('offset'), 0, 0, 100000);

    const { entries, total } = await db.getAllWaitlistEntries({
      verified,
      limit,
      offset,
    });

    // Transform to API format
    const transformedEntries = entries.map((entry) => ({
      id: entry.id,
      email: entry.email,
      firstName: entry.first_name,
      interests: entry.interests,
      referralCode: entry.referral_code,
      referredBy: entry.referred_by,
      position: entry.position,
      verified: entry.verified,
      verifiedAt: entry.verified_at?.toISOString() ?? null,
      createdAt: entry.created_at.toISOString(),
      updatedAt: entry.updated_at.toISOString(),
    }));

    return successResponse({
      entries: transformedEntries,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
