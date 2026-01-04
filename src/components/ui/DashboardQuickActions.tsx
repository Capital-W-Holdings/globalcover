'use client';

import { useState } from 'react';
import { MessageSquare, UserPlus, Gift, FileText, ArrowRight, TrendingUp, Target } from 'lucide-react';
import Button from '../ui/Button';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: 'primary' | 'accent' | 'green' | 'purple';
  href?: string;
  onClick?: () => void;
}

interface DashboardQuickActionsProps {
  onGetQuote?: () => void;
  onReferFriend?: () => void;
  onRedeemBenefit?: () => void;
  savingsGoal?: number;
  currentSavings?: number;
}

export default function DashboardQuickActions({
  onGetQuote,
  onReferFriend,
  onRedeemBenefit,
  savingsGoal = 500,
  currentSavings = 127,
}: DashboardQuickActionsProps) {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'quote',
      label: 'Get New Quote',
      description: 'Compare insurance options',
      icon: <FileText className="h-5 w-5" />,
      color: 'primary',
      onClick: onGetQuote,
      href: onGetQuote ? undefined : '/#insurance',
    },
    {
      id: 'refer',
      label: 'Refer a Friend',
      description: 'Earn rewards for referrals',
      icon: <UserPlus className="h-5 w-5" />,
      color: 'accent',
      onClick: onReferFriend,
    },
    {
      id: 'benefit',
      label: 'Redeem Benefit',
      description: 'Use your member discounts',
      icon: <Gift className="h-5 w-5" />,
      color: 'green',
      onClick: onRedeemBenefit,
      href: onRedeemBenefit ? undefined : '/#membership',
    },
    {
      id: 'support',
      label: 'Get Support',
      description: 'Chat with our team',
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'purple',
      href: 'mailto:support@globalcover.com',
    },
  ];

  const colorClasses = {
    primary: {
      bg: 'bg-primary-50',
      iconBg: 'bg-primary-100',
      icon: 'text-primary-600',
      hover: 'hover:bg-primary-100',
      border: 'border-primary-200',
    },
    accent: {
      bg: 'bg-accent-50',
      iconBg: 'bg-accent-100',
      icon: 'text-accent-600',
      hover: 'hover:bg-accent-100',
      border: 'border-accent-200',
    },
    green: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      icon: 'text-green-600',
      hover: 'hover:bg-green-100',
      border: 'border-green-200',
    },
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      icon: 'text-purple-600',
      hover: 'hover:bg-purple-100',
      border: 'border-purple-200',
    },
  };

  const savingsProgress = Math.min((currentSavings / savingsGoal) * 100, 100);

  const ActionWrapper = ({ action, children }: { action: QuickAction; children: React.ReactNode }) => {
    if (action.href) {
      return (
        <a 
          href={action.href}
          className="block"
          onMouseEnter={() => setHoveredAction(action.id)}
          onMouseLeave={() => setHoveredAction(null)}
        >
          {children}
        </a>
      );
    }
    return (
      <button
        onClick={action.onClick}
        className="block w-full text-left"
        onMouseEnter={() => setHoveredAction(action.id)}
        onMouseLeave={() => setHoveredAction(null)}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const colors = colorClasses[action.color];
          const isHovered = hoveredAction === action.id;
          
          return (
            <ActionWrapper key={action.id} action={action}>
              <div 
                className={`
                  relative p-4 rounded-xl border transition-all duration-200
                  ${colors.bg} ${colors.border} ${colors.hover}
                  ${isHovered ? 'shadow-md -translate-y-0.5' : 'shadow-sm'}
                `}
              >
                <div className={`w-10 h-10 rounded-lg ${colors.iconBg} ${colors.icon} flex items-center justify-center mb-3`}>
                  {action.icon}
                </div>
                <h3 className="font-semibold text-sand-900 mb-0.5">{action.label}</h3>
                <p className="text-xs text-sand-500">{action.description}</p>
                
                {isHovered && (
                  <ArrowRight className={`absolute top-4 right-4 h-4 w-4 ${colors.icon} animate-fade-in`} />
                )}
              </div>
            </ActionWrapper>
          );
        })}
      </div>

      {/* Savings Progress Card */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/30 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent-500/20 rounded-full blur-2xl" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Savings Goal</h3>
                <p className="text-sm text-primary-200">Annual target</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">${currentSavings}</div>
              <div className="text-sm text-primary-200">of ${savingsGoal}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="h-3 bg-primary-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-accent-400 to-accent-500 rounded-full transition-all duration-500"
                style={{ width: `${savingsProgress}%` }}
              />
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-primary-200">
              <TrendingUp className="h-4 w-4" />
              <span>{Math.round(savingsProgress)}% complete</span>
            </div>
            <span className="text-primary-200">
              ${savingsGoal - currentSavings} to go
            </span>
          </div>
        </div>
      </div>

      {/* Tips Banner */}
      <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">💡</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Pro tip:</span> Refer 3 friends to unlock premium member benefits and boost your savings!
          </p>
        </div>
        <Button 
          size="sm" 
          variant="outline"
          onClick={onReferFriend}
          className="flex-shrink-0 border-amber-300 text-amber-700 hover:bg-amber-100"
        >
          Refer Now
        </Button>
      </div>
    </div>
  );
}
