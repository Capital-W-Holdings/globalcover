import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/responses';
import { waitlistFormSchema } from '@/lib/validation';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { RateLimitError, ValidationError } from '@/lib/errors';
import { db } from '@/lib/db';
import { generateReferralCode } from '@/lib/referrals';
import { emailService } from '@/lib/email';
import { analytics } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(clientId, 'waitlist');
    
    if (!rateLimit.allowed) {
      throw new RateLimitError();
    }

    // Parse and validate request body
    const body = await request.json() as unknown;
    const validatedData = waitlistFormSchema.parse(body);

    // Check if email already exists
    const existingEntry = await db.getWaitlistEntryByEmail(validatedData.email);
    if (existingEntry) {
      throw new ValidationError('This email is already on the waitlist');
    }

    // Process referral code if provided
    let referredBy: string | null = null;
    let positionBoost = 0;
    
    if (validatedData.referralCode) {
      const referrer = await db.getWaitlistEntryByReferralCode(validatedData.referralCode);
      if (referrer) {
        referredBy = referrer.id;
        positionBoost = 5; // New user gets 5 position boost
        
        // Boost referrer's position by 10
        const newPosition = Math.max(1, referrer.position - 10);
        await db.updateWaitlistEntry(referrer.id, { position: newPosition });
        
        // Notify referrer (fire and forget)
        emailService.sendReferralSuccess(referrer.email, {
          firstName: referrer.first_name,
          newPosition,
          referredName: validatedData.firstName,
        }).catch(err => {
          console.error('[Waitlist] Failed to send referral notification:', err);
        });
      }
    }

    // Get next position in queue
    const nextPosition = await db.getNextWaitlistPosition();
    const assignedPosition = nextPosition - positionBoost;

    // Create waitlist entry using centralized db client
    const entry = await db.createWaitlistEntry({
      email: validatedData.email,
      first_name: validatedData.firstName,
      interests: validatedData.interests,
      referral_code: generateReferralCode(),
      referred_by: referredBy,
      position: assignedPosition,
      verified: false,
      verified_at: null,
    });

    // Send confirmation email (fire and forget)
    emailService.sendWaitlistConfirmation(entry.email, {
      firstName: entry.first_name,
      position: entry.position,
      referralCode: entry.referral_code,
    }).catch(err => {
      console.error('[Waitlist] Failed to send confirmation email:', err);
    });

    // Track analytics event
    analytics.trackWaitlistSignup({
      email: entry.email,
      position: entry.position,
      interests: entry.interests,
      hasReferral: !!referredBy,
    });

    return successResponse(
      { 
        id: entry.id,
        position: entry.position,
        referralCode: entry.referral_code,
      },
      'Successfully joined the waitlist',
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
}
