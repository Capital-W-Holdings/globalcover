'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, Gift, Shield, Share2, Settings, LogOut, 
  ExternalLink, Crown, TrendingUp, Clock, Globe, Loader2
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { LoadingCard } from '@/components/ui/Loading';
import DashboardQuickActions from '@/components/ui/DashboardQuickActions';
import { ShareReferral } from '@/components/forms';
import { useMemberAuth } from '@/components/auth';
import { benefits } from '@/data/benefits';
import type { Benefit } from '@/types';

interface TabProps {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabProps[] = [
  { id: 'overview', label: 'Overview', icon: <TrendingUp className="h-4 w-4" /> },
  { id: 'benefits', label: 'My Benefits', icon: <Gift className="h-4 w-4" /> },
  { id: 'insurance', label: 'My Insurance', icon: <Shield className="h-4 w-4" /> },
  { id: 'referrals', label: 'Referrals', icon: <Share2 className="h-4 w-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
];

export default function DashboardPage() {
  const router = useRouter();
  const { member, isAuthenticated, isLoading: authLoading, logout } = useMemberAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [memberBenefits, setMemberBenefits] = useState<Benefit[]>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    // Simulate loading benefits
    const timer = setTimeout(() => {
      setMemberBenefits(benefits.filter((b) => b.exclusive).slice(0, 6));
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSignOut = () => {
    logout();
    router.push('/');
  };

  // Show loading while checking auth
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-sand-50">
        <Loader2 className="h-8 w-8 text-primary-600 animate-spin mb-4" />
        <p className="text-sand-600">Loading your dashboard...</p>
      </div>
    );
  }

  // Member data from auth context (with fallbacks for demo)
  const todayDate = new Date().toISOString().split('T')[0] ?? new Date().toISOString().substring(0, 10);
  const memberData = {
    firstName: member?.firstName ?? 'Member',
    lastName: member?.lastName ?? '',
    email: member?.email ?? '',
    plan: member?.plan === 'monthly' ? 'Monthly' : 'Annual',
    memberSince: member?.memberSince ?? todayDate,
    referralCode: member?.referralCode ?? 'MEMBER123',
    referralCount: 0,
    savingsToDate: 0,
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleGetQuote = () => {
    window.location.href = '/#insurance';
  };

  const handleReferFriend = () => {
    setActiveTab('referrals');
  };

  const handleRedeemBenefit = () => {
    setActiveTab('benefits');
  };

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Simple Nav for Dashboard */}
      <nav className="bg-white border-b border-sand-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-2">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold text-sand-900">
              Global<span className="text-primary-600">Cover</span>
            </span>
          </Link>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sand-600 hover:text-sand-900 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-700 flex items-center justify-center">
                <User className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-display font-bold">
                    {memberData.firstName} {memberData.lastName}
                  </h1>
                  <span className="px-2 py-0.5 bg-accent-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    {memberData.plan}
                  </span>
                </div>
                <p className="text-primary-200">Member since {formatDate(memberData.memberSince)}</p>
              </div>
            </div>

            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 text-primary-200 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-primary-200 mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Savings to Date</span>
              </div>
              <p className="text-2xl font-bold">${memberData.savingsToDate}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-primary-200 mb-1">
                <Gift className="h-4 w-4" />
                <span className="text-sm">Active Benefits</span>
              </div>
              <p className="text-2xl font-bold">{memberBenefits.length}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-primary-200 mb-1">
                <Share2 className="h-4 w-4" />
                <span className="text-sm">Referrals</span>
              </div>
              <p className="text-2xl font-bold">{memberData.referralCount}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-primary-200 mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Plan Status</span>
              </div>
              <p className="text-lg font-bold text-green-400">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-2 -mx-4 px-4 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all
                ${activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-sand-600 hover:bg-sand-100 border border-sand-200'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-display font-bold text-sand-900 mb-4">Quick Actions</h2>
              <DashboardQuickActions
                onGetQuote={handleGetQuote}
                onReferFriend={handleReferFriend}
                onRedeemBenefit={handleRedeemBenefit}
                savingsGoal={500}
                currentSavings={memberData.savingsToDate}
              />
            </div>

            {/* Recent Activity Preview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-bold text-sand-900">Recent Benefits</h2>
                <button 
                  onClick={() => setActiveTab('benefits')}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <LoadingCard key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {memberBenefits.slice(0, 3).map((benefit) => (
                    <div key={benefit.id} className="bg-white rounded-xl border border-sand-200 p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-600">
                            {benefit.provider.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sand-900 truncate">{benefit.name}</h3>
                          <p className="text-xs text-sand-500">{benefit.provider}</p>
                        </div>
                        {benefit.discountPercent && (
                          <span className="text-xs font-semibold text-green-600">{benefit.discountPercent}% off</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'benefits' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-sand-900">Your Member Benefits</h2>
              <a href="/#membership" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All Benefits
              </a>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <LoadingCard key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {memberBenefits.map((benefit) => (
                  <div key={benefit.id} className="bg-white rounded-2xl border border-sand-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary-600">
                          {benefit.provider.charAt(0)}
                        </span>
                      </div>
                      {benefit.discountPercent && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-lg">
                          {benefit.discountPercent}% OFF
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-sand-900 mb-1">{benefit.name}</h3>
                    <p className="text-sm text-sand-600 mb-4">{benefit.shortDescription}</p>
                    <Button variant="outline" size="sm" fullWidth>
                      Redeem Benefit
                      <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'insurance' && (
          <div className="space-y-6">
            <h2 className="text-xl font-display font-bold text-sand-900">My Insurance Policies</h2>
            <div className="bg-white rounded-2xl border border-sand-200 p-8 text-center">
              <Shield className="h-12 w-12 text-sand-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-sand-900 mb-2">No Active Policies</h3>
              <p className="text-sand-600 mb-6">
                You haven&apos;t purchased any insurance policies yet. Browse our marketplace to find the perfect coverage.
              </p>
              <a href="/#insurance">
                <Button>Browse Insurance</Button>
              </a>
            </div>
          </div>
        )}

        {activeTab === 'referrals' && (
          <div className="space-y-6">
            <h2 className="text-xl font-display font-bold text-sand-900">Refer Friends & Earn</h2>
            
            {/* Enhanced Share Section */}
            <div className="bg-white rounded-2xl border border-sand-200 p-6">
              <h3 className="font-semibold text-sand-900 mb-2">Share & Earn Rewards</h3>
              <p className="text-sand-600 mb-4">
                Share your referral code with friends. When they join, you both get 1 month free!
              </p>
              <ShareReferral referralCode={memberData.referralCode} />
            </div>

            <div className="bg-white rounded-2xl border border-sand-200 p-6">
              <h3 className="font-semibold text-sand-900 mb-4">Referral Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-sand-50 rounded-xl">
                  <p className="text-sm text-sand-500 mb-1">Total Referrals</p>
                  <p className="text-2xl font-bold text-sand-900">{memberData.referralCount}</p>
                </div>
                <div className="p-4 bg-sand-50 rounded-xl">
                  <p className="text-sm text-sand-500 mb-1">Earned Credit</p>
                  <p className="text-2xl font-bold text-sand-900">${memberData.referralCount * 10}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-display font-bold text-sand-900">Account Settings</h2>
            
            <div className="bg-white rounded-2xl border border-sand-200 divide-y divide-sand-200">
              <div className="p-6">
                <h3 className="font-semibold text-sand-900 mb-4">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-sand-600 mb-1">First Name</label>
                    <input 
                      type="text" 
                      defaultValue={memberData.firstName}
                      className="w-full px-4 py-2 rounded-xl border border-sand-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sand-600 mb-1">Last Name</label>
                    <input 
                      type="text" 
                      defaultValue={memberData.lastName}
                      className="w-full px-4 py-2 rounded-xl border border-sand-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-sand-600 mb-1">Email</label>
                    <input 
                      type="email" 
                      defaultValue={memberData.email}
                      className="w-full px-4 py-2 rounded-xl border border-sand-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Button size="sm">Save Changes</Button>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-semibold text-sand-900 mb-4">Subscription</h3>
                <div className="flex items-center justify-between p-4 bg-sand-50 rounded-xl">
                  <div>
                    <p className="font-medium text-sand-900">{memberData.plan} Plan</p>
                    <p className="text-sm text-sand-600">Active membership</p>
                  </div>
                  <Button variant="outline" size="sm">Manage Plan</Button>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-semibold text-sand-900 mb-4">Account Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                    Cancel Subscription
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
