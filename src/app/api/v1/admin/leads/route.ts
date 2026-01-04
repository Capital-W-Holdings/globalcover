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
    const status = searchParams.get('status') as 'new' | 'contacted' | 'qualified' | 'converted' | 'lost' | null;
    
    // Safe parsing with bounds checking
    const limit = safeParseInt(searchParams.get('limit'), 50, 1, 100);
    const offset = safeParseInt(searchParams.get('offset'), 0, 0, 100000);

    const { leads, total } = await db.getAllLeads({
      status: status ?? undefined,
      limit,
      offset,
    });

    // Transform to API format
    const transformedLeads = leads.map((lead) => ({
      id: lead.id,
      productId: lead.product_id,
      productName: lead.product_name,
      firstName: lead.first_name,
      lastName: lead.last_name,
      email: lead.email,
      phone: lead.phone,
      country: lead.country,
      startDate: lead.start_date,
      message: lead.message,
      referralCode: lead.referral_code,
      status: lead.status,
      createdAt: lead.created_at.toISOString(),
      updatedAt: lead.updated_at.toISOString(),
    }));

    return successResponse({
      leads: transformedLeads,
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
