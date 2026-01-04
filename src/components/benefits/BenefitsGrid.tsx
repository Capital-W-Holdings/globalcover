'use client';

import { useState } from 'react';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import type { Benefit } from '@/types';
import BenefitCard from './BenefitCard';
import { LoadingCards } from '../ui/Loading';
import { ErrorCard } from '../ui/Error';
import Button from '../ui/Button';

interface BenefitsGridProps {
  benefits: Benefit[];
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  showProgressiveDisclosure?: boolean;
  unlockedCount?: number;
  onJoinClick?: () => void;
}

export default function BenefitsGrid({ 
  benefits, 
  loading = false, 
  error,
  onRetry,
  showProgressiveDisclosure = true,
  unlockedCount = 3,
  onJoinClick,
}: BenefitsGridProps) {
  const [hoveredLockedId, setHoveredLockedId] = useState<string | null>(null);

  if (loading) {
    return <LoadingCards count={6} />;
  }

  if (error) {
    return <ErrorCard message={error} retry={onRetry} />;
  }

  if (benefits.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sand-100 flex items-center justify-center">
          <span className="text-2xl">🎁</span>
        </div>
        <h3 className="text-lg font-semibold text-sand-900 mb-2">
          No benefits found
        </h3>
        <p className="text-sand-600">
          Try selecting a different category
        </p>
      </div>
    );
  }

  // Calculate total potential savings from locked benefits
  const lockedBenefits = showProgressiveDisclosure ? benefits.slice(unlockedCount) : [];
  const totalLockedSavings = lockedBenefits.reduce((acc, b) => acc + (b.discountPercent ?? 0), 0);

  return (
    <div className="space-y-8">
      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((benefit, index) => {
          const isLocked = showProgressiveDisclosure && index >= unlockedCount;
          
          if (isLocked) {
            return (
              <div 
                key={benefit.id}
                className="relative animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
                onMouseEnter={() => setHoveredLockedId(benefit.id)}
                onMouseLeave={() => setHoveredLockedId(null)}
              >
                {/* Blurred Card */}
                <div className="relative overflow-hidden rounded-2xl">
                  <div className="blur-sm pointer-events-none select-none">
                    <BenefitCard benefit={benefit} />
                  </div>
                  
                  {/* Lock Overlay */}
                  <div 
                    className={`
                      absolute inset-0 bg-gradient-to-t from-white via-white/90 to-white/70
                      flex flex-col items-center justify-center p-6 transition-opacity duration-200
                      ${hoveredLockedId === benefit.id ? 'opacity-100' : 'opacity-95'}
                    `}
                  >
                    <div className={`
                      w-12 h-12 rounded-full bg-sand-100 flex items-center justify-center mb-3
                      transition-transform duration-200
                      ${hoveredLockedId === benefit.id ? 'scale-110' : 'scale-100'}
                    `}>
                      <Lock className="h-5 w-5 text-sand-500" />
                    </div>
                    <p className="text-sm font-medium text-sand-700 text-center mb-1">
                      Member Exclusive
                    </p>
                    {benefit.discountPercent && (
                      <p className="text-xs text-accent-600 font-semibold">
                        Save up to {benefit.discountPercent}%
                      </p>
                    )}
                    {hoveredLockedId === benefit.id && onJoinClick && (
                      <button
                        onClick={onJoinClick}
                        className="mt-3 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg
                                   hover:bg-primary-700 transition-colors animate-fade-in"
                      >
                        Unlock Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div 
              key={benefit.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <BenefitCard benefit={benefit} />
            </div>
          );
        })}
      </div>

      {/* Join CTA Banner (if there are locked benefits) */}
      {showProgressiveDisclosure && lockedBenefits.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 p-6 sm:p-8">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-accent-400" />
                <span className="text-accent-300 text-sm font-medium">Member Benefits</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-2">
                Unlock {lockedBenefits.length} More Exclusive Benefits
              </h3>
              <p className="text-primary-100 text-sm sm:text-base">
                {totalLockedSavings > 0 
                  ? `Join to save up to ${totalLockedSavings}% with member-only discounts`
                  : 'Join to access all partner discounts and exclusive deals'
                }
              </p>
            </div>
            
            {onJoinClick ? (
              <Button 
                onClick={onJoinClick}
                size="lg"
                className="bg-white text-primary-700 hover:bg-primary-50 flex-shrink-0"
              >
                Join Membership
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <a href="/join">
                <Button 
                  size="lg"
                  className="bg-white text-primary-700 hover:bg-primary-50"
                >
                  Join Membership
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
