import { NextRequest, NextResponse } from 'next/server';
import { payments } from '@/lib/payments';
import { db } from '@/lib/db';
import { emailService } from '@/lib/email';
import { analytics } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

// Disable body parsing for webhook signature verification
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const event = payments.verifyWebhookSignature(body, signature);

    if (!event) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    console.log('[Webhook] Received event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as {
          id: string;
          customer_email?: string;
          customer?: string;
          subscription?: string;
          amount_total?: number;
          currency?: string;
          metadata?: Record<string, string>;
        };

        // Update payment record
        const payment = await db.getPaymentBySessionId(session.id);
        if (payment) {
          await db.updatePayment(payment.id, {
            status: 'completed',
            stripe_customer_id: session.customer ?? null,
            stripe_subscription_id: session.subscription ?? null,
          });

          // Send confirmation email
          const firstName = session.metadata?.firstName ?? 'there';
          const planType = session.metadata?.planType ?? 'membership';
          
          await emailService.sendPaymentConfirmation(
            session.customer_email ?? payment.email,
            {
              firstName,
              planType,
              amount: session.amount_total ?? payment.amount,
            }
          );

          // Track payment completed
          analytics.trackPaymentCompleted({
            planType,
            amount: session.amount_total ?? payment.amount,
            email: session.customer_email ?? payment.email,
            stripeSessionId: session.id,
          });
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as { id: string };
        
        // Update payment record to failed
        const payment = await db.getPaymentBySessionId(session.id);
        if (payment) {
          await db.updatePayment(payment.id, { status: 'failed' });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as { 
          id: string;
          customer?: string;
        };
        
        console.log('[Webhook] Subscription cancelled:', subscription.id);
        // In production, update user's membership status
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as {
          customer_email?: string;
          subscription?: string;
        };
        
        console.log('[Webhook] Invoice payment failed:', invoice.subscription);
        
        if (invoice.customer_email) {
          analytics.trackPaymentFailed({
            planType: 'subscription',
            email: invoice.customer_email,
            error: 'Payment failed',
          });
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as {
          payment_intent?: string;
          amount_refunded?: number;
        };
        
        console.log('[Webhook] Charge refunded:', charge.payment_intent);
        // In production, update payment record and revoke access
        break;
      }

      default:
        console.log('[Webhook] Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
