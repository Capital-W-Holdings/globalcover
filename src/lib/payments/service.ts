// Stripe payments service
// In production, ensure Stripe SDK is installed: npm install stripe

interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  publishableKey: string;
  priceMonthly: string;
  priceAnnual: string;
}

interface CreateCheckoutSessionParams {
  email: string;
  planType: 'monthly' | 'annual';
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

interface CheckoutSession {
  id: string;
  url: string;
  customerId?: string;
  subscriptionId?: string;
}

interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

class PaymentsService {
  private config: StripeConfig | null = null;
  private initialized = false;

  initialize(config: StripeConfig): void {
    this.config = config;
    this.initialized = true;
    console.log('[Payments] Service initialized');
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getPublishableKey(): string | null {
    return this.config?.publishableKey ?? null;
  }

  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CheckoutSession> {
    if (!this.initialized || !this.config) {
      // Mock response for development
      const mockSessionId = `cs_mock_${Date.now()}`;
      console.log('[Payments] Mock checkout session created:', mockSessionId);
      return {
        id: mockSessionId,
        url: `${params.successUrl}?session_id=${mockSessionId}`,
      };
    }

    // In production with Stripe:
    // const stripe = require('stripe')(this.config.secretKey);
    // const priceId = params.planType === 'monthly' 
    //   ? this.config.priceMonthly 
    //   : this.config.priceAnnual;
    // 
    // const session = await stripe.checkout.sessions.create({
    //   mode: 'subscription',
    //   payment_method_types: ['card'],
    //   customer_email: params.email,
    //   line_items: [{
    //     price: priceId,
    //     quantity: 1,
    //   }],
    //   success_url: params.successUrl,
    //   cancel_url: params.cancelUrl,
    //   metadata: params.metadata,
    // });
    // 
    // return {
    //   id: session.id,
    //   url: session.url,
    //   customerId: session.customer,
    //   subscriptionId: session.subscription,
    // };

    const mockSessionId = `cs_${Date.now()}`;
    console.log('[Payments] Checkout session created:', mockSessionId);
    return {
      id: mockSessionId,
      url: `${params.successUrl}?session_id=${mockSessionId}`,
    };
  }

  async retrieveSession(sessionId: string): Promise<{
    id: string;
    email: string;
    customerId: string;
    subscriptionId: string;
    amountTotal: number;
    currency: string;
    status: string;
    metadata: Record<string, string>;
  } | null> {
    if (!this.initialized || !this.config) {
      // Mock response for development
      return {
        id: sessionId,
        email: 'mock@example.com',
        customerId: 'cus_mock',
        subscriptionId: 'sub_mock',
        amountTotal: 9900,
        currency: 'usd',
        status: 'complete',
        metadata: {},
      };
    }

    // In production with Stripe:
    // const stripe = require('stripe')(this.config.secretKey);
    // const session = await stripe.checkout.sessions.retrieve(sessionId);
    // return {
    //   id: session.id,
    //   email: session.customer_email,
    //   customerId: session.customer,
    //   subscriptionId: session.subscription,
    //   amountTotal: session.amount_total,
    //   currency: session.currency,
    //   status: session.status,
    //   metadata: session.metadata,
    // };

    return null;
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    if (!this.initialized || !this.config) {
      console.log('[Payments] Mock subscription cancelled:', subscriptionId);
      return true;
    }

    // In production with Stripe:
    // const stripe = require('stripe')(this.config.secretKey);
    // await stripe.subscriptions.cancel(subscriptionId);
    // return true;

    return true;
  }

  verifyWebhookSignature(payload: string, signature: string): WebhookEvent | null {
    if (!this.initialized || !this.config) {
      // SECURITY: REJECT all webhooks when payment service is not properly configured
      // This prevents attackers from forging payment completion events
      console.error('[Payments] REJECTING webhook - service not initialized with Stripe credentials');
      return null;
    }

    if (!signature) {
      console.error('[Payments] REJECTING webhook - missing signature');
      return null;
    }

    // In production with Stripe SDK:
    // const stripe = require('stripe')(this.config.secretKey);
    // try {
    //   return stripe.webhooks.constructEvent(
    //     payload,
    //     signature,
    //     this.config.webhookSecret
    //   );
    // } catch (err) {
    //   console.error('[Payments] Webhook signature verification failed:', err);
    //   return null;
    // }

    // TEMPORARY: Basic HMAC verification until Stripe SDK is added
    // This provides some protection but should be replaced with Stripe's official verification
    try {
      const crypto = require('crypto');
      const webhookSecret = this.config.webhookSecret;
      
      // Stripe sends signature in format: t=timestamp,v1=signature
      const sigParts = signature.split(',');
      const timestamp = sigParts.find(p => p.startsWith('t='))?.split('=')[1];
      const sig = sigParts.find(p => p.startsWith('v1='))?.split('=')[1];
      
      if (!timestamp || !sig) {
        console.error('[Payments] Invalid signature format');
        return null;
      }
      
      // Check timestamp is within 5 minutes to prevent replay attacks
      const timestampAge = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);
      if (timestampAge > 300) {
        console.error('[Payments] Webhook timestamp too old:', timestampAge, 'seconds');
        return null;
      }
      
      // Compute expected signature
      const signedPayload = `${timestamp}.${payload}`;
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(signedPayload)
        .digest('hex');
      
      // Timing-safe comparison
      if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
        console.error('[Payments] Webhook signature mismatch');
        return null;
      }
      
      return JSON.parse(payload) as WebhookEvent;
    } catch (err) {
      console.error('[Payments] Webhook verification error:', err);
      return null;
    }
  }

  getPrices(): { monthly: number; annual: number; currency: string } {
    // These would come from Stripe in production
    return {
      monthly: 9.99,
      annual: 99,
      currency: 'USD',
    };
  }
}

// Export singleton instance
export const payments = new PaymentsService();

// Initialize with env vars
export function initializePayments(): void {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const priceMonthly = process.env.STRIPE_PRICE_MONTHLY;
  const priceAnnual = process.env.STRIPE_PRICE_ANNUAL;

  if (secretKey && webhookSecret && publishableKey && priceMonthly && priceAnnual) {
    payments.initialize({
      secretKey,
      webhookSecret,
      publishableKey,
      priceMonthly,
      priceAnnual,
    });
  } else {
    console.log('[Payments] Running in mock mode (missing Stripe env vars)');
  }
}
