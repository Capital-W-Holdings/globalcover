'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import type { Product, QuoteFormData } from '@/types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

const countries = [
  { value: '', label: 'Select country' },
  { value: 'US', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'ES', label: 'Spain' },
  { value: 'PT', label: 'Portugal' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'TH', label: 'Thailand' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'MX', label: 'Mexico' },
  { value: 'CO', label: 'Colombia' },
  { value: 'BR', label: 'Brazil' },
  { value: 'JP', label: 'Japan' },
  { value: 'AU', label: 'Australia' },
  { value: 'CA', label: 'Canada' },
  { value: 'OTHER', label: 'Other' },
];

type FormStep = 'form' | 'success';

export default function QuoteModal({ isOpen, onClose, product }: QuoteModalProps) {
  const [step, setStep] = useState<FormStep>('form');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<QuoteFormData>>({
    productId: product.id,
    productName: product.name,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    startDate: '',
    message: '',
    referralCode: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/v1/leads/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json() as { success: boolean; error?: string };

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? 'Failed to submit quote');
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
    setFormData({
      productId: product.id,
      productName: product.name,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: '',
      startDate: '',
      message: '',
      referralCode: '',
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={step === 'form' ? `Get Quote: ${product.name}` : undefined}>
      {step === 'form' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Info */}
          <div className="p-3 bg-sand-50 rounded-xl mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-bold text-primary-600">
                  {product.provider.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-sand-900">{product.name}</p>
                <p className="text-sm text-sand-500">by {product.provider}</p>
              </div>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="firstName"
              value={formData.firstName ?? ''}
              onChange={handleChange}
              error={errors.firstName}
              required
            />
            <Input
              label="Last Name"
              name="lastName"
              value={formData.lastName ?? ''}
              onChange={handleChange}
              error={errors.lastName}
              required
            />
          </div>

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

          {/* Phone */}
          <Input
            label="Phone"
            name="phone"
            type="tel"
            value={formData.phone ?? ''}
            onChange={handleChange}
            error={errors.phone}
            helperText="Optional - for urgent inquiries"
          />

          {/* Country & Start Date */}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Country"
              name="country"
              value={formData.country ?? ''}
              onChange={handleChange}
              options={countries}
              error={errors.country}
              required
            />
            <Input
              label="Coverage Start"
              name="startDate"
              type="date"
              value={formData.startDate ?? ''}
              onChange={handleChange}
              error={errors.startDate}
              required
              min={new Date().toISOString().split('T')[0]}
              max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            />
          </div>

          {/* Message */}
          <div className="w-full">
            <label className="block text-sm font-medium text-sand-800 mb-1.5">
              Message
            </label>
            <textarea
              name="message"
              value={formData.message ?? ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-sand-300 hover:border-sand-400 transition-all duration-200 bg-white text-sand-900 placeholder:text-sand-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Tell us about your coverage needs..."
            />
          </div>

          {/* Referral Code */}
          <Input
            label="Referral Code"
            name="referralCode"
            value={formData.referralCode ?? ''}
            onChange={handleChange}
            helperText="Have a referral code? Enter it here for priority"
          />

          {/* Error Message */}
          {errors.submit && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">
              {errors.submit}
            </div>
          )}

          {/* Submit */}
          <Button type="submit" fullWidth loading={loading}>
            Request Quote
          </Button>

          <p className="text-xs text-sand-500 text-center">
            By submitting, you agree to our Privacy Policy and Terms of Service.
          </p>
        </form>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-display font-bold text-sand-900 mb-2">
            Quote Request Received!
          </h3>
          <p className="text-sand-600 mb-6">
            We&apos;ll get back to you within 24 hours with a personalized quote for{' '}
            <span className="font-medium text-sand-900">{product.name}</span>.
          </p>
          <Button onClick={handleClose} variant="outline" fullWidth>
            Close
          </Button>
        </div>
      )}
    </Modal>
  );
}
