// Analytics service - Segment ready
// In production, replace with actual Segment API calls

type EventName =
  | 'quote_requested'
  | 'waitlist_signup'
  | 'waitlist_verified'
  | 'search_performed'
  | 'product_viewed'
  | 'product_compared'
  | 'referral_code_used'
  | 'checkout_started'
  | 'payment_completed'
  | 'payment_failed';

interface AnalyticsConfig {
  writeKey: string;
  gaTrackingId?: string;
}

interface UserTraits {
  email?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  createdAt?: string;
  plan?: string;
  referralCode?: string;
}

interface EventProperties {
  [key: string]: string | number | boolean | string[] | undefined;
}

class AnalyticsService {
  private _config: AnalyticsConfig | null = null;
  private initialized = false;

  initialize(config: AnalyticsConfig): void {
    this._config = config;
    this.initialized = true;
    console.log('[Analytics] Service initialized');
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getConfig(): AnalyticsConfig | null {
    return this._config;
  }

  identify(userId: string, traits?: UserTraits): void {
    if (!this.initialized) {
      console.log('[Analytics] Mock identify:', userId, traits);
      return;
    }

    // In production with Segment:
    // const Analytics = require('analytics-node');
    // const analytics = new Analytics(this.config.writeKey);
    // analytics.identify({ userId, traits });

    console.log('[Analytics] Identify:', userId, traits);
  }

  track(event: EventName, properties?: EventProperties, userId?: string): void {
    const payload = {
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
      },
      userId,
    };

    if (!this.initialized) {
      console.log('[Analytics] Mock track:', payload);
      return;
    }

    // In production with Segment:
    // const Analytics = require('analytics-node');
    // const analytics = new Analytics(this.config.writeKey);
    // analytics.track(payload);

    console.log('[Analytics] Track:', payload);
  }

  page(name: string, properties?: EventProperties, _userId?: string): void {
    if (!this.initialized) {
      console.log('[Analytics] Mock page:', name, properties);
      return;
    }

    // In production with Segment:
    // analytics.page({ userId, name, properties });

    console.log('[Analytics] Page:', name, properties);
  }

  // Convenience methods for common events
  trackQuoteRequested(data: { 
    productId: string; 
    productName: string; 
    category: string;
    email: string;
    country: string;
  }): void {
    this.track('quote_requested', {
      product_id: data.productId,
      product_name: data.productName,
      category: data.category,
      email: data.email,
      country: data.country,
    });
  }

  trackLeadCreated(data: {
    leadId: string;
    productId: string;
    productName: string;
    country: string;
    hasReferral: boolean;
  }): void {
    this.track('quote_requested', {
      lead_id: data.leadId,
      product_id: data.productId,
      product_name: data.productName,
      country: data.country,
      has_referral: data.hasReferral,
    });
  }

  trackWaitlistSignup(data: {
    email: string;
    position: number;
    interests: string[];
    hasReferral: boolean;
  }): void {
    this.track('waitlist_signup', {
      email: data.email,
      position: data.position,
      interests: data.interests,
      has_referral: data.hasReferral,
    });
  }

  trackWaitlistVerified(data: {
    email: string;
    position: number;
  }): void {
    this.track('waitlist_verified', {
      email: data.email,
      position: data.position,
    });
  }

  trackSearchPerformed(data: {
    query: string;
    resultCount: number;
    confidence: string;
    suggestedCategory: string | null;
  }): void {
    this.track('search_performed', {
      query: data.query,
      result_count: data.resultCount,
      confidence: data.confidence,
      suggested_category: data.suggestedCategory ?? 'none',
    });
  }

  trackProductViewed(data: {
    productId: string;
    productName: string;
    category: string;
    price: number;
  }): void {
    this.track('product_viewed', {
      product_id: data.productId,
      product_name: data.productName,
      category: data.category,
      price: data.price,
    });
  }

  trackProductCompared(data: {
    productIds: string[];
    productNames: string[];
    category: string;
  }): void {
    this.track('product_compared', {
      product_count: data.productIds.length,
      category: data.category,
    });
  }

  trackReferralCodeUsed(data: {
    code: string;
    referrerId: string;
    newUserId: string;
  }): void {
    this.track('referral_code_used', {
      referral_code: data.code,
      referrer_id: data.referrerId,
      new_user_id: data.newUserId,
    });
  }

  trackCheckoutStarted(data: {
    planType: string;
    price: number;
    email: string;
  }): void {
    this.track('checkout_started', {
      plan_type: data.planType,
      price: data.price,
      email: data.email,
    });
  }

  trackPaymentCompleted(data: {
    planType: string;
    amount: number;
    email: string;
    stripeSessionId: string;
  }): void {
    this.track('payment_completed', {
      plan_type: data.planType,
      amount: data.amount,
      email: data.email,
      stripe_session_id: data.stripeSessionId,
    });
  }

  trackPaymentFailed(data: {
    planType: string;
    email: string;
    error: string;
  }): void {
    this.track('payment_failed', {
      plan_type: data.planType,
      email: data.email,
      error: data.error,
    });
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Initialize with env vars
export function initializeAnalytics(): void {
  const writeKey = process.env.SEGMENT_WRITE_KEY;
  const gaTrackingId = process.env.GA_TRACKING_ID;

  if (writeKey) {
    analytics.initialize({ writeKey, gaTrackingId });
  } else {
    console.log('[Analytics] Running in mock mode (no SEGMENT_WRITE_KEY)');
  }
}
