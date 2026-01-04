import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/responses';
import { validateAdminAuth } from '@/lib/admin-auth';
import { getAllCircuitStats } from '@/lib/circuit-breaker';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Validate admin authentication (throws on failure)
    validateAdminAuth(request);

    const stats = getAllCircuitStats();

    return successResponse({
      circuits: stats,
      summary: {
        total: Object.keys(stats).length,
        open: Object.values(stats).filter(s => s.state === 'OPEN').length,
        halfOpen: Object.values(stats).filter(s => s.state === 'HALF_OPEN').length,
        closed: Object.values(stats).filter(s => s.state === 'CLOSED').length,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
