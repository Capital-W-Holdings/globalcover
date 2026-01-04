'use client';

import { Star, ExternalLink, Percent, Lock } from 'lucide-react';
import type { Benefit } from '@/types';
import Button from '../ui/Button';

interface BenefitCardProps {
  benefit: Benefit;
}

export default function BenefitCard({ benefit }: BenefitCardProps) {
  const hasDiscount = benefit.discountPercent && benefit.discountPercent > 0;
  
  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === 0) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: benefit.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const availabilityLabels: Record<Benefit['availability'], string> = {
    'global': '🌍 Global',
    'us-only': '🇺🇸 US Only',
    'eu-only': '🇪🇺 EU Only',
    'select-countries': '🗺️ Select Countries',
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-sand-200 hover:border-accent-300 transition-all duration-300 hover:shadow-lg hover:shadow-accent-100/50 hover:-translate-y-1">
      {/* Exclusive Badge */}
      {benefit.exclusive && (
        <div className="absolute -top-2 -left-2 z-10">
          <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold rounded-lg shadow-lg">
            <Star className="h-3 w-3 fill-current" />
            Exclusive
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          {/* Provider Logo Placeholder */}
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-100 to-accent-200 flex items-center justify-center">
            <span className="text-xl font-bold text-accent-600">
              {benefit.provider.charAt(0)}
            </span>
          </div>

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg">
              <Percent className="h-4 w-4" />
              <span className="font-bold">{benefit.discountPercent}% OFF</span>
            </div>
          )}
        </div>

        {/* Title & Provider */}
        <div className="mb-3">
          <h3 className="font-display font-semibold text-lg text-sand-900 group-hover:text-accent-700 transition-colors">
            {benefit.name}
          </h3>
          <p className="text-sand-500 text-sm">by {benefit.provider}</p>
        </div>

        {/* Description */}
        <p className="text-sand-600 text-sm line-clamp-2 mb-4">
          {benefit.shortDescription}
        </p>

        {/* Features */}
        <ul className="space-y-1.5 mb-4">
          {benefit.features.slice(0, 3).map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-sand-600">
              <span className="text-accent-500">•</span>
              <span className="line-clamp-1">{feature}</span>
            </li>
          ))}
        </ul>

        {/* Availability */}
        <div className="text-xs text-sand-500 mb-4">
          {availabilityLabels[benefit.availability]}
        </div>

        {/* Price Section */}
        <div className="flex items-end justify-between mb-4">
          <div>
            {hasDiscount && benefit.retailPrice ? (
              <>
                <span className="text-sm text-sand-400 line-through">
                  {formatPrice(benefit.retailPrice)}
                </span>
                <div className="text-2xl font-display font-bold text-sand-900">
                  {formatPrice(benefit.memberPrice)}
                </div>
              </>
            ) : benefit.memberPrice === 0 ? (
              <div className="text-2xl font-display font-bold text-green-600">
                Free
              </div>
            ) : (
              <div className="text-2xl font-display font-bold text-sand-900">
                {formatPrice(benefit.memberPrice)}
              </div>
            )}
          </div>
          
          {/* Redemption Method */}
          <div className="text-xs text-sand-500 capitalize px-2 py-1 bg-sand-100 rounded-md">
            {benefit.redemptionMethod === 'code' ? '🎟️ Code' : 
             benefit.redemptionMethod === 'link' ? '🔗 Link' :
             benefit.redemptionMethod === 'app' ? '📱 App' : '💳 Card'}
          </div>
        </div>

        {/* CTA */}
        <Button 
          variant="secondary" 
          fullWidth
          className="group/btn"
        >
          <Lock className="h-4 w-4 mr-2" />
          Unlock with Membership
          <ExternalLink className="ml-2 h-4 w-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
        </Button>
      </div>
    </div>
  );
}
