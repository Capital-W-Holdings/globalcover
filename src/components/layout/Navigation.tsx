'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Globe, Shield, Gift, ChevronDown, User } from 'lucide-react';
import Button from '../ui/Button';
import WaitlistModal from '../forms/WaitlistModal';
import { useMemberAuth } from '../auth';

export default function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated, member, logout } = useMemberAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);

  // Don't render on dashboard, login, or admin pages (they have their own nav)
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/login') || pathname.startsWith('/admin')) {
    return null;
  }

  const handleSignOut = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
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

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <Link 
              href="/#insurance" 
              className="flex items-center gap-2 px-4 py-2 text-sand-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Shield className="h-4 w-4" />
              <span className="font-medium">Insurance</span>
            </Link>
            <Link 
              href="/join" 
              className="flex items-center gap-2 px-4 py-2 text-sand-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Gift className="h-4 w-4" />
              <span className="font-medium">Membership</span>
            </Link>
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 text-sand-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                <span className="font-medium">Resources</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-white rounded-xl shadow-xl border border-sand-200 p-2 min-w-[200px]">
                  {isAuthenticated && (
                    <Link href="/dashboard" className="block px-4 py-2 text-sand-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                      Member Dashboard
                    </Link>
                  )}
                  <span className="block px-4 py-2 text-sand-400 cursor-not-allowed">
                    Insurance 101 (Coming Soon)
                  </span>
                  <span className="block px-4 py-2 text-sand-400 cursor-not-allowed">
                    Country Guides (Coming Soon)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop CTA - Changes based on auth state */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sand-700 hover:text-primary-600 rounded-lg transition-colors">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{member?.firstName || 'Dashboard'}</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Button size="sm" onClick={() => setShowWaitlist(true)}>
                  Join Waitlist
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-sand-700 hover:bg-sand-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-sand-200 animate-slide-down">
          <div className="px-4 py-4 space-y-1">
            <Link 
              href="/#insurance"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sand-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
            >
              <Shield className="h-5 w-5" />
              <span className="font-medium">Insurance</span>
            </Link>
            <Link 
              href="/join"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sand-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
            >
              <Gift className="h-5 w-5" />
              <span className="font-medium">Membership</span>
            </Link>
            {isAuthenticated && (
              <Link 
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sand-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </Link>
            )}
            <div className="pt-4 space-y-2">
              {isAuthenticated ? (
                <Button variant="outline" fullWidth onClick={handleSignOut}>
                  Sign Out
                </Button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" fullWidth>
                      Sign In
                    </Button>
                  </Link>
                  <Button fullWidth onClick={() => { setIsMobileMenuOpen(false); setShowWaitlist(true); }}>
                    Join Waitlist
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
    
    <WaitlistModal isOpen={showWaitlist} onClose={() => setShowWaitlist(false)} />
    </>
  );
}
