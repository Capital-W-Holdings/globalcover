'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

interface ErrorProps {
  title?: string;
  message: string;
  retry?: () => void;
}

export function ErrorMessage({ title, message, retry }: ErrorProps) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <AlertCircle className="h-6 w-6 text-red-500" />
        </div>
        <div className="flex-1">
          {title && (
            <h3 className="text-lg font-semibold text-red-800 mb-1">{title}</h3>
          )}
          <p className="text-red-700">{message}</p>
          {retry && (
            <Button
              variant="outline"
              size="sm"
              onClick={retry}
              className="mt-4 border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ErrorCard({ message, retry }: ErrorProps) {
  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-6 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <p className="text-sand-700 mb-4">{message}</p>
      {retry && (
        <Button variant="outline" size="sm" onClick={retry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      )}
    </div>
  );
}

export function PageError({ message, retry }: ErrorProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
        <h2 className="text-2xl font-display font-bold text-sand-900 mb-3">
          Something went wrong
        </h2>
        <p className="text-sand-600 mb-6">{message}</p>
        {retry && (
          <Button onClick={retry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
