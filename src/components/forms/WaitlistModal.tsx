'use client';

import { useState } from 'react';
import { CheckCircle, Gift, Sparkles, TrendingUp } from 'lucide-react';
import type { BenefitCategory, WaitlistFormData } from '@/types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ShareReferral from './ShareReferral';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const interestOptions: { value: BenefitCategory; label: string }[] = [
  { value: 'wearables', label: '⌚ Wearables & Tech' },
  { value: 'wellness', label: '🧘 Wellness & Fitness' },
  { value: 'travel', label: '✈️ Travel & Hospitality' },
  { value: 'lifestyle', label: '🎬 Lifestyle & Entertainment' },
  { value: 'finance', label: '💰 Finance & Banking' },
  { value: 'professional', label: '💼 Professional Services' },
];

type FormStep = 'form' | 'success';

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [step, setStep] = useState<FormStep>('form');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null);
  const [referralCode, setReferralCode] = useState<string>('');
  const [formData, setFormData] = useState<Partial<WaitlistFormData>>({
    email: '',
    firstName: '',
    interests: [],
    referralCode: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const toggleInterest = (interest: BenefitCategory) => {
    setFormData((prev) => {
      const current = prev.interests ?? [];
      const updated = current.includes(interest)
        ? current.filter((i) => i !== interest)
        : [...current, interest];
      return { ...prev, interests: updated };
    });
    if (errors.interests) {
      setErrors((prev) => ({ ...prev, interests: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.interests || formData.interests.length === 0) {
      newErrors.interests = 'Select at least one interest';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/v1/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json() as { 
        success: boolean; 
        error?: string;
        data?: { position: number; referralCode: string };
      };

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? 'Failed to join waitlist');
      }

      if (result.data) {
        setWaitlistPosition(result.data.position);
        setReferralCode(result.data.referralCode);
      }
      setStep('success');
    } catch (err) {
      setErrors({ 
        submit: err instanceof Error ? err.message : 'Something went wrong. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('form');
    setErrors({});
    setWaitlistPosition(null);
    setReferralCode('');
    setFormData({
      email: '',
      firstName: '',
      interests: [],
      referralCode: '',
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={step === 'form' ? 'Join the Waitlist' : undefined}>
      {step === 'form' ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Benefits Banner */}
          <div className="p-4 bg-gradient-to-r from-accent-50 to-amber-50 rounded-xl border border-accent-200">
            <div className="flex items-center gap-3 mb-2">
              <Gift className="h-5 w-5 text-accent-600" />
              <span className="font-semibold text-sand-900">Early Access Benefits</span>
            </div>
            <ul className="text-sm text-sand-700 space-y-1">
              <li>✓ Founding member pricing (up to 40% off)</li>
              <li>✓ Priority access to exclusive deals</li>
              <li>✓ Skip the line with referrals</li>
            </ul>
          </div>

          {/* Name */}
          <Input
            label="First Name"
            name="firstName"
            value={formData.firstName ?? ''}
            onChange={handleChange}
            error={errors.firstName}
            required
          />

          {/* Email */}
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email ?? ''}
            onChange={handleChange}
            error={errors.email}
            required
          />

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-sand-800 mb-2">
              What interests you most?
              <span className="text-accent-500 ml-1">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {interestOptions.map((option) => {
                const isSelected = formData.interests?.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleInterest(option.value)}
                    className={`
                      p-3 rounded-xl text-sm text-left transition-all duration-200
                      ${isSelected 
                        ? 'bg-primary-100 border-2 border-primary-500 text-primary-800' 
                        : 'bg-sand-50 border-2 border-transparent hover:bg-sand-100 text-sand-700'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            {errors.interests && (
              <p className="mt-1.5 text-sm text-red-600">{errors.interests}</p>
            )}
          </div>

          {/* Referral Code */}
          <Input
            label="Referral Code"
            name="referralCode"
            value={formData.referralCode ?? ''}
            onChange={handleChange}
            helperText="Got a code from a friend? Skip ahead in line!"
          />

          {/* Error Message */}
          {errors.submit && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">
              {errors.submit}
            </div>
          )}

          {/* Submit */}
          <Button type="submit" fullWidth loading={loading}>
            <Sparkles className="h-4 w-4 mr-2" />
            Join Waitlist
          </Button>

          <p className="text-xs text-sand-500 text-center">
            We&apos;ll only email you about membership updates. No spam, ever.
          </p>
        </form>
      ) : (
        <div className="py-4">
          {/* Success Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-display font-bold text-sand-900 mb-2">
              You&apos;re on the list!
            </h3>
            {waitlistPosition && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full">
                <TrendingUp className="h-4 w-4 text-primary-600" />
                <span className="text-primary-700">
                  Position <span className="font-bold">#{waitlistPosition}</span>
                </span>
              </div>
            )}
          </div>
          
          {/* Share Section */}
          {referralCode && (
            <div className="border-t border-sand-100 pt-6">
              <h4 className="text-lg font-semibold text-sand-900 mb-4 text-center">
                🚀 Skip the line! Share to move up
              </h4>
              <ShareReferral 
                referralCode={referralCode} 
                position={waitlistPosition ?? undefined} 
              />
            </div>
          )}

          <Button onClick={handleClose} variant="ghost" fullWidth className="mt-6">
            Done
          </Button>
        </div>
      )}
    </Modal>
  );
}
