'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Sparkles, Shield, Gift, Zap, Crown, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import ExitIntentModal from '@/components/ui/ExitIntentModal';

const features = [
  { icon: Shield, text: 'Priority insurance quote processing' },
  { icon: Gift, text: 'Up to 40% off partner products' },
  { icon: Zap, text: 'Exclusive member-only deals' },
  { icon: Crown, text: '24/7 concierge support' },
];

const plans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 9.99,
    period: '/month',
    description: 'Perfect for trying out',
    popular: false,
  },
  {
    id: 'annual',
    name: 'Annual',
    price: 99,
    period: '/year',
    description: 'Best value - save $20',
    popular: true,
    savings: 20,
  },
];

function JoinPageContent() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');
  
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discountApplied, setDiscountApplied] = useState(false);

  useEffect(() => {
    if (refCode) {
      // Could validate referral code here
      console.log('Referral code:', refCode);
    }
  }, [refCode]);

  const handleApplyDiscount = (code: string) => {
    console.log('Discount code applied:', code);
    setDiscountApplied(true);
  };

  // Calculate prices with potential discount
  const getDisplayPrice = (basePrice: number) => {
    if (discountApplied) {
      return (basePrice * 0.85).toFixed(2); // 15% off
    }
    return basePrice.toFixed(2);
  };

  const handleCheckout = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName,
          planType: selectedPlan,
          discountCode: discountApplied ? 'STAYWITHUS' : undefined,
        }),
      });

      const result = await response.json() as { success: boolean; data?: { url: string }; error?: string };

      if (!result.success) {
        throw new Error(result.error ?? 'Checkout failed');
      }

      // Redirect to Stripe checkout
      if (result.data?.url) {
        window.location.href = result.data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Hero Section */}
      <div className="pt-16 pb-12 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-100 text-accent-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Founding Member Pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-sand-900 mb-4">
            Join GlobalCover Membership
          </h1>
          <p className="text-lg text-sand-600 max-w-2xl mx-auto">
            Unlock exclusive insurance deals, partner discounts, and premium benefits designed for digital nomads.
          </p>
          {refCode && (
            <p className="mt-4 text-sm text-primary-600">
              Referral code <span className="font-semibold">{refCode}</span> applied
            </p>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        {/* Discount Applied Banner */}
        {discountApplied && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">15% discount applied!</p>
              <p className="text-sm text-green-600">Code STAYWITHUS saved you money on your membership.</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id as 'monthly' | 'annual')}
              className={`
                relative p-6 rounded-2xl border-2 text-left transition-all
                ${selectedPlan === plan.id
                  ? 'border-primary-500 bg-primary-50 shadow-lg'
                  : 'border-sand-200 bg-white hover:border-sand-300'
                }
              `}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-accent-500 text-white text-xs font-semibold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-sand-900">{plan.name}</h3>
                  <p className="text-sm text-sand-600">{plan.description}</p>
                </div>
                <div className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center
                  ${selectedPlan === plan.id
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-sand-300'
                  }
                `}>
                  {selectedPlan === plan.id && (
                    <Check className="h-4 w-4 text-white" />
                  )}
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                {discountApplied && (
                  <span className="text-lg text-sand-400 line-through">
                    ${plan.price}
                  </span>
                )}
                <span className="text-3xl font-display font-bold text-sand-900">
                  ${getDisplayPrice(plan.price)}
                </span>
                <span className="text-sand-500">{plan.period}</span>
              </div>

              {plan.savings && (
                <p className="mt-2 text-sm text-green-600 font-medium">
                  Save ${discountApplied ? Math.round(plan.savings * 1.15) : plan.savings} per year
                </p>
              )}
            </button>
          ))}
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl border border-sand-200 p-8 mb-8">
          <h3 className="text-lg font-semibold text-sand-900 mb-6 text-center">
            What&apos;s included in your membership
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature) => (
              <div key={feature.text} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-primary-600" />
                </div>
                <span className="text-sand-700">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Checkout Form */}
        <div className="bg-white rounded-2xl border border-sand-200 p-8">
          <h3 className="text-lg font-semibold text-sand-900 mb-6">
            Complete your membership
          </h3>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-sand-700 mb-1">
                First Name (optional)
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Alex"
                className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sand-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <Button
            fullWidth
            size="lg"
            onClick={handleCheckout}
            loading={loading}
            disabled={loading}
          >
            {loading ? (
              'Processing...'
            ) : (
              <>
                Subscribe to {selectedPlan === 'monthly' ? 'Monthly' : 'Annual'} - $
                {selectedPlan === 'monthly' ? '9.99/mo' : '99/yr'}
              </>
            )}
          </Button>

          <p className="mt-4 text-center text-sm text-sand-500">
            30-day money-back guarantee. Cancel anytime.
          </p>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 text-center">
          <p className="text-sm text-sand-500 mb-4">Secure payment powered by</p>
          <div className="flex items-center justify-center gap-8">
            <span className="text-sand-400 font-semibold">Stripe</span>
            <span className="text-sand-400 font-semibold">256-bit SSL</span>
            <span className="text-sand-400 font-semibold">PCI Compliant</span>
          </div>
        </div>
      </div>

      {/* Exit Intent Modal for abandonment recovery */}
      <ExitIntentModal
        isEnabled={!discountApplied}
        discountCode="STAYWITHUS"
        discountPercent={15}
        onApplyDiscount={handleApplyDiscount}
      />
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary-600 animate-spin" />
      </div>
    }>
      <JoinPageContent />
    </Suspense>
  );
}
