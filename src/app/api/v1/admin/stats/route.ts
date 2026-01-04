import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/responses';
import { validateAdminAuth } from '@/lib/admin-auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Validate admin authentication
    validateAdminAuth(request);

    const stats = await db.getStats();

    // Calculate conversion rates
    const leadConversionRate = stats.totalLeads > 0 
      ? ((stats.convertedLeads / stats.totalLeads) * 100).toFixed(1) 
      : '0.0';
    
    const waitlistVerificationRate = stats.totalWaitlist > 0 
      ? ((stats.verifiedWaitlist / stats.totalWaitlist) * 100).toFixed(1) 
      : '0.0';

    return successResponse({
      leads: {
        total: stats.totalLeads,
        new: stats.newLeads,
        converted: stats.convertedLeads,
        conversionRate: `${leadConversionRate}%`,
      },
      waitlist: {
        total: stats.totalWaitlist,
        verified: stats.verifiedWaitlist,
        verificationRate: `${waitlistVerificationRate}%`,
      },
      payments: {
        total: stats.totalPayments,
        revenue: {
          amount: stats.totalRevenue,
          formatted: `$${(stats.totalRevenue / 100).toFixed(2)}`,
        },
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
