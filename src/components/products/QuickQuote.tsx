'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle, Loader2, Mail } from 'lucide-react';
import type { Product } from '@/types';

interface QuickQuoteProps {
  product: Product;
  onSuccess?: () => void;
  onExpandForm?: () => void;
}

type QuoteStatus = 'idle' | 'loading' | 'success' | 'error';

export default function QuickQuote({ product, onSuccess, onExpandForm }: QuickQuoteProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<QuoteStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      const response = await fetch('/api/v1/leads/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          email,
          firstName: '', // Optional in quick flow
          lastName: '',
          country: 'US', // Default, can be updated later
          startDate: new Date().toISOString().split('T')[0],
        }),
      });

      const result = await response.json() as { success: boolean; error?: string };

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? 'Failed to submit quote');
      }

      setStatus('success');
      onSuccess?.();
      
      // Reset after delay
      setTimeout(() => {
        setStatus('idle');
        setEmail('');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">Quote requested!</p>
          <p className="text-xs text-green-600">We&apos;ll email you within 24 hours.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sand-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            placeholder="Enter your email"
            className={`
              w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm
              ${error 
                ? 'border-red-300 focus:ring-red-200' 
                : 'border-sand-300 focus:ring-primary-200'
              }
              focus:ring-2 focus:border-transparent transition-all
            `}
            disabled={status === 'loading'}
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium text-sm 
                     hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors flex items-center gap-2 flex-shrink-0"
        >
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Get Quote
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
      
      {error && (
        <p className="text-xs text-red-600 px-1">{error}</p>
      )}
      
      {onExpandForm && (
        <button
          type="button"
          onClick={onExpandForm}
          className="text-xs text-sand-500 hover:text-primary-600 transition-colors"
        >
          Need to add more details? Click here
        </button>
      )}
    </form>
  );
}
