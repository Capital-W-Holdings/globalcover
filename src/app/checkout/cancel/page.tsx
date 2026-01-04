'use client';

import Link from 'next/link';
import { XCircle, ArrowLeft, HelpCircle, MessageSquare } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-lg w-full text-center">
        {/* Cancel Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-sand-100 flex items-center justify-center">
          <XCircle className="h-10 w-10 text-sand-500" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-display font-bold text-sand-900 mb-3">
          Payment Cancelled
        </h1>
        <p className="text-lg text-sand-600 mb-8">
          Your payment was cancelled. No charges were made to your account.
        </p>

        {/* Reasons Section */}
        <div className="bg-sand-50 rounded-2xl p-6 mb-8 text-left">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="h-5 w-5 text-sand-500" />
            <h3 className="font-semibold text-sand-900">Changed your mind?</h3>
          </div>
          <p className="text-sand-600 mb-4">
            No worries! Here are some things you might want to know:
          </p>
          <ul className="space-y-3 text-sand-700">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-semibold mt-0.5">•</span>
              <span>You can restart checkout anytime - your progress is saved</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-semibold mt-0.5">•</span>
              <span>Annual plans save you $20 compared to monthly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-semibold mt-0.5">•</span>
              <span>30-day money-back guarantee on all plans</span>
            </li>
          </ul>
        </div>

        {/* Help Section */}
        <div className="bg-primary-50 rounded-2xl p-6 mb-8 border border-primary-100">
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare className="h-5 w-5 text-primary-600" />
            <h3 className="font-semibold text-sand-900">Have questions?</h3>
          </div>
          <p className="text-sand-600 text-sm">
            Our team is here to help. Reach out at{' '}
            <a href="mailto:support@globalcover.com" className="text-primary-600 hover:underline">
              support@globalcover.com
            </a>
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/#membership">
            <Button size="lg">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Membership
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg">
              Browse Insurance
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
