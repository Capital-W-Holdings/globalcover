'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Gift, ArrowRight, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';

interface SessionDetails {
  email: string;
  planType: string;
  amount: number;
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);

  useEffect(() => {
    // In production, verify the session with the backend
    // For now, show success state after a brief delay
    const timer = setTimeout(() => {
      setSessionDetails({
        email: 'member@example.com',
        planType: 'Annual',
        amount: 9900,
      });
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-sand-600">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-lg w-full text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center animate-scale-in">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-display font-bold text-sand-900 mb-3">
          Welcome to GlobalCover!
        </h1>
        <p className="text-lg text-sand-600 mb-8">
          Your membership is now active. You have access to all member benefits.
        </p>

        {/* Order Summary */}
        {sessionDetails && (
          <div className="bg-sand-50 rounded-2xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-sand-900 mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sand-600">Plan</span>
                <span className="font-medium text-sand-900">{sessionDetails.planType} Membership</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand-600">Amount</span>
                <span className="font-medium text-sand-900">
                  ${(sessionDetails.amount / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand-600">Email</span>
                <span className="font-medium text-sand-900">{sessionDetails.email}</span>
              </div>
            </div>
          </div>
        )}

        {/* Benefits Preview */}
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-6 mb-8 text-left border border-primary-100">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="h-6 w-6 text-primary-600" />
            <h3 className="font-semibold text-sand-900">Your Member Benefits</h3>
          </div>
          <ul className="space-y-2 text-sand-700">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>Up to 40% off partner products</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>Priority insurance quote processing</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>Exclusive member-only deals</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>24/7 concierge support</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg">
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/#membership">
            <Button variant="outline" size="lg">
              Explore Benefits
            </Button>
          </Link>
        </div>

        {/* Confirmation Email Note */}
        <p className="text-sm text-sand-500 mt-8">
          A confirmation email has been sent to your inbox with your membership details.
        </p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary-600 animate-spin" />
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
