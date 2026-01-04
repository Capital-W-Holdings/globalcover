import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/responses';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { RateLimitError } from '@/lib/errors';
import { payments } from '@/lib/payments';
import { analytics } from '@/lib/analytics';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const checkoutSchema = z.object({
  email: z.string().email('Valid email required'),
  planType: z.enum(['monthly', 'annual'], { 
    errorMap: () => ({ message: 'Plan type must be monthly or annual' })
  }),
  firstName: z.string().min(1, 'First name is required').optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(clientId, 'quote'); // Reuse quote rate limit
    
    if (!rateLimit.allowed) {
      throw new RateLimitError();
    }

    // Parse and validate request body
    const body = await request.json() as unknown;
    const { email, planType, firstName } = checkoutSchema.parse(body);

    // Get the base URL for success/cancel redirects
    const origin = request.headers.get('origin') ?? 'http://localhost:3000';

    // Track checkout started
    analytics.trackCheckoutStarted({
      planType,
      price: planType === 'monthly' ? 999 : 9900,
      email,
    });

    // Create Stripe checkout session
    const session = await payments.createCheckoutSession({
      email,
      planType,
      successUrl: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/checkout/cancel`,
      metadata: {
        email,
        planType,
        firstName: firstName ?? '',
      },
    });

    // Create pending payment record
    await db.createPayment({
      stripe_session_id: session.id,
      stripe_customer_id: session.customerId ?? null,
      stripe_subscription_id: session.subscriptionId ?? null,
      email,
      amount: planType === 'monthly' ? 999 : 9900,
      currency: 'usd',
      status: 'pending',
      plan_type: planType,
    });

    return successResponse({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(_request: NextRequest) {
  try {
    // Return pricing information
    const prices = payments.getPrices();
    const publishableKey = payments.getPublishableKey();

    return successResponse({
      prices: {
        monthly: {
          amount: prices.monthly,
          formatted: `$${prices.monthly.toFixed(2)}`,
          period: 'month',
        },
        annual: {
          amount: prices.annual,
          formatted: `$${prices.annual.toFixed(2)}`,
          period: 'year',
          savings: `$${((prices.monthly * 12) - prices.annual).toFixed(2)}`,
        },
      },
      currency: prices.currency,
      publishableKey,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
