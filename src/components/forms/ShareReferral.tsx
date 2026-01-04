'use client';

import { useState } from 'react';
import { Copy, Check, Share2, MessageCircle, Twitter, Mail } from 'lucide-react';
import Button from '../ui/Button';

interface ShareReferralProps {
  referralCode: string;
  position?: number;
  compact?: boolean;
}

export default function ShareReferral({ referralCode, position, compact = false }: ShareReferralProps) {
  const [copied, setCopied] = useState(false);

  const referralLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/join?ref=${referralCode}`
    : `https://globalcover.com/join?ref=${referralCode}`;

  const shareText = position 
    ? `I'm #${position} on the GlobalCover waitlist! Join me and skip the line with my code: ${referralCode}`
    : `Join GlobalCover with my referral code: ${referralCode} - Insurance built for digital nomads!`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async (platform: 'whatsapp' | 'twitter' | 'email' | 'native') => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(referralLink);

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent('Join me on GlobalCover!')}&body=${encodedText}%0A%0A${encodedUrl}`;
        break;
      case 'native':
        if (typeof navigator !== 'undefined' && 'share' in navigator) {
          try {
            await navigator.share({
              title: 'Join GlobalCover',
              text: shareText,
              url: referralLink,
            });
          } catch (err) {
            // User cancelled or share failed
            console.log('Share cancelled or failed:', err);
          }
        }
        break;
    }
  };

  const supportsNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <code className="flex-1 px-3 py-2 bg-white rounded-lg border border-sand-200 font-mono text-sm text-primary-600 truncate">
          {referralCode}
        </code>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleCopy}
          className="flex-shrink-0"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        {supportsNativeShare && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleShare('native')}
            className="flex-shrink-0"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Referral Code Display */}
      <div className="p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border border-primary-100">
        <p className="text-sm text-sand-600 mb-2 font-medium">Your Referral Link</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-4 py-2.5 bg-white rounded-lg border border-sand-200 font-mono text-sm text-primary-600 truncate">
            {referralLink}
          </div>
          <Button 
            variant="outline" 
            onClick={handleCopy}
            className="flex-shrink-0"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Share Buttons */}
      <div>
        <p className="text-sm text-sand-600 mb-3">Share with friends</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleShare('whatsapp')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366] text-white rounded-lg hover:bg-[#20bd5a] transition-colors text-sm font-medium"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </button>
          <button
            onClick={() => handleShare('twitter')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a94da] transition-colors text-sm font-medium"
          >
            <Twitter className="h-4 w-4" />
            Twitter
          </button>
          <button
            onClick={() => handleShare('email')}
            className="flex items-center gap-2 px-4 py-2.5 bg-sand-600 text-white rounded-lg hover:bg-sand-700 transition-colors text-sm font-medium"
          >
            <Mail className="h-4 w-4" />
            Email
          </button>
          {supportsNativeShare && (
            <button
              onClick={() => handleShare('native')}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              <Share2 className="h-4 w-4" />
              More
            </button>
          )}
        </div>
      </div>

      {/* Incentive */}
      <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">🎁</span>
        </div>
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Each referral = 10 spots up!</span>
          <br />
          <span className="text-amber-600">Plus, your friend gets priority access too.</span>
        </p>
      </div>
    </div>
  );
}
