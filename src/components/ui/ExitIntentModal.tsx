'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Gift, Clock, ArrowRight, Sparkles } from 'lucide-react';
import Button from '../ui/Button';

interface ExitIntentModalProps {
  isEnabled?: boolean;
  discountCode?: string;
  discountPercent?: number;
  onClose?: () => void;
  onApplyDiscount?: (code: string) => void;
}

export default function ExitIntentModal({
  isEnabled = true,
  discountCode = 'STAYWITHUS',
  discountPercent = 15,
  onClose,
  onApplyDiscount,
}: ExitIntentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  // Detect exit intent (mouse leaving viewport)
  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Only trigger when mouse moves to top of viewport (likely leaving to close tab/back)
    if (e.clientY <= 0 && !hasShown && isEnabled) {
      setIsOpen(true);
      setHasShown(true);
    }
  }, [hasShown, isEnabled]);

  // Setup exit intent listener
  useEffect(() => {
    if (!isEnabled) return;

    // Check if already shown this session
    if (typeof window !== 'undefined') {
      const shown = sessionStorage.getItem('gc_exit_shown');
      if (shown) {
        setHasShown(true);
        return;
      }
    }

    // Add listener after a delay (don't show immediately)
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isEnabled, handleMouseLeave]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, timeLeft]);

  // Mark as shown in session storage
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      sessionStorage.setItem('gc_exit_shown', 'true');
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(discountCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleApplyDiscount = () => {
    onApplyDiscount?.(discountCode);
    handleClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-sand-400 hover:text-sand-600 
                     transition-colors rounded-lg hover:bg-sand-100 z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top accent bar */}
        <div className="h-2 bg-gradient-to-r from-accent-500 to-primary-500" />

        {/* Content */}
        <div className="p-6 pt-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent-100 to-primary-100 flex items-center justify-center">
            <Gift className="h-8 w-8 text-accent-600" />
          </div>

          {/* Headline */}
          <h2 className="text-2xl font-display font-bold text-sand-900 mb-2">
            Wait! Don&apos;t leave yet
          </h2>

          {/* Subheadline */}
          <p className="text-sand-600 mb-6">
            We&apos;d hate to see you go. Here&apos;s a special offer just for you!
          </p>

          {/* Discount Box */}
          <div className="bg-gradient-to-r from-accent-50 to-primary-50 rounded-xl p-5 mb-6 border border-accent-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-accent-600" />
              <span className="text-sm font-medium text-accent-700">Exclusive Offer</span>
            </div>
            <div className="text-4xl font-display font-bold text-sand-900 mb-1">
              {discountPercent}% OFF
            </div>
            <p className="text-sm text-sand-600 mb-4">
              Your first year of membership
            </p>

            {/* Discount Code */}
            <div className="flex items-center gap-2 justify-center">
              <code className="px-4 py-2 bg-white rounded-lg border-2 border-dashed border-accent-300 font-mono text-lg text-accent-700 font-semibold">
                {discountCode}
              </code>
              <button
                onClick={handleCopyCode}
                className="px-3 py-2 bg-accent-600 text-white rounded-lg text-sm font-medium
                           hover:bg-accent-700 transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Urgency Timer */}
          {timeLeft > 0 && (
            <div className="flex items-center justify-center gap-2 mb-6 text-sand-600">
              <Clock className="h-4 w-4 text-red-500" />
              <span className="text-sm">
                Offer expires in <span className="font-semibold text-red-600">{formatTime(timeLeft)}</span>
              </span>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button 
              fullWidth 
              size="lg"
              onClick={handleApplyDiscount}
              className="group"
            >
              Claim My Discount
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <button
              onClick={handleClose}
              className="w-full py-2 text-sm text-sand-500 hover:text-sand-700 transition-colors"
            >
              No thanks, I&apos;ll pay full price
            </button>
          </div>
        </div>

        {/* Bottom note */}
        <div className="px-6 py-4 bg-sand-50 border-t border-sand-100 text-center">
          <p className="text-xs text-sand-500">
            This offer is exclusive to you and cannot be combined with other promotions.
          </p>
        </div>
      </div>
    </div>
  );
}
