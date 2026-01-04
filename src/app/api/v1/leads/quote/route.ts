import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/responses';
import { quoteFormSchema } from '@/lib/validation';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { RateLimitError } from '@/lib/errors';
import { db } from '@/lib/db';
import { emailService } from '@/lib/email';
import { analytics } from '@/lib/analytics';
import { products } from '@/data/products';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(clientId, 'quote');
    
    if (!rateLimit.allowed) {
      throw new RateLimitError();
    }

    // Parse and validate request body
    const body = await request.json() as unknown;
    const validatedData = quoteFormSchema.parse(body);

    // Get product provider for email
    const product = products.find(p => p.id === validatedData.productId);
    const provider = product?.provider ?? 'GlobalCover Partner';

    // Create lead record using centralized db client
    const lead = await db.createLead({
      product_id: validatedData.productId,
      product_name: validatedData.productName,
      first_name: validatedData.firstName,
      last_name: validatedData.lastName,
      email: validatedData.email,
      phone: validatedData.phone ?? null,
      country: validatedData.country,
      start_date: validatedData.startDate,
      message: validatedData.message ?? null,
      referral_code: validatedData.referralCode ?? null,
      status: 'new',
    });

    // Send confirmation email to user (fire and forget - don't fail the request if email fails)
    emailService.sendQuoteConfirmation(validatedData.email, {
      firstName: validatedData.firstName,
      productName: validatedData.productName,
      provider,
    }).catch(err => {
      console.error('[Quote] Failed to send confirmation email:', err);
    });

    // Send notification to admin
    emailService.sendAdminLeadNotification({
      productName: validatedData.productName,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      country: validatedData.country,
    }).catch(err => {
      console.error('[Quote] Failed to send admin notification:', err);
    });

    // Track analytics event
    analytics.trackLeadCreated({
      leadId: lead.id,
      productId: validatedData.productId,
      productName: validatedData.productName,
      country: validatedData.country,
      hasReferral: !!validatedData.referralCode,
    });

    return successResponse(
      { id: lead.id },
      'Quote request received successfully',
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
}
