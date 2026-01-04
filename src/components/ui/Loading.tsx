'use client';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <svg
      className={`animate-spin ${sizes[size]} text-primary-600`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function Loading({ size = 'md', text }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <LoadingSpinner size={size} />
      {text && (
        <p className="mt-4 text-sand-600 font-medium">{text}</p>
      )}
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="h-12 w-12 rounded-xl bg-sand-200" />
        <div className="h-6 w-20 rounded-lg bg-sand-200" />
      </div>
      <div className="h-6 w-3/4 rounded-lg bg-sand-200 mb-2" />
      <div className="h-4 w-1/2 rounded-lg bg-sand-200 mb-4" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-sand-200" />
        <div className="h-3 w-5/6 rounded bg-sand-200" />
        <div className="h-3 w-4/6 rounded bg-sand-200" />
      </div>
      <div className="flex gap-3 mt-6">
        <div className="h-10 flex-1 rounded-xl bg-sand-200" />
        <div className="h-10 w-24 rounded-xl bg-sand-200" />
      </div>
    </div>
  );
}

export function LoadingCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loading size="lg" text="Loading..." />
    </div>
  );
}
