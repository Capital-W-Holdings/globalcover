'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Globe, Mail, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useMemberAuth } from '@/components/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useMemberAuth();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await login(email);
    
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Login failed');
      setIsLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-50">
        <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary-500/20 rounded-xl blur-lg group-hover:bg-primary-500/30 transition-colors" />
            <div className="relative bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-2">
              <Globe className="h-6 w-6 text-white" />
            </div>
          </div>
          <span className="font-display text-xl font-bold text-sand-900">
            Global<span className="text-primary-600">Cover</span>
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-sand-900 mb-2">
              Welcome back
            </h1>
            <p className="text-sand-600">
              Sign in to access your member dashboard
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-sand-200 shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-sand-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-sand-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    placeholder="you@example.com"
                    required
                    className={`
                      w-full pl-12 pr-4 py-3 rounded-xl border text-sand-900
                      ${error 
                        ? 'border-red-300 focus:ring-red-200' 
                        : 'border-sand-300 focus:ring-primary-200'
                      }
                      focus:ring-2 focus:border-transparent transition-all
                    `}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
                {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-sand-200 text-center">
              <p className="text-sm text-sand-600">
                Not a member yet?{' '}
                <Link href="/join" className="text-primary-600 hover:text-primary-700 font-medium">
                  Join GlobalCover
                </Link>
              </p>
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-6 p-4 bg-primary-50 border border-primary-100 rounded-xl">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-primary-900">Demo Mode</p>
                <p className="text-primary-700">
                  Enter any valid email to access the member dashboard. In production, this would verify your membership.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
