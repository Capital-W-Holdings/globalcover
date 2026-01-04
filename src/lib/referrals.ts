// Referral system utilities

export interface ReferralStats {
  totalReferrals: number;
  positionBoost: number;
  referralCode: string;
}

// Constants for referral system
export const REFERRAL_BOOST_PER_REFERRAL = 10; // Referrer moves up 10 positions per referral
export const NEW_USER_REFERRAL_BOOST = 5; // New user gets 5 position boost when using a code

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function isValidReferralCode(code: string): boolean {
  // Code must be 8 characters, alphanumeric
  return /^[A-Z0-9]{8}$/.test(code.toUpperCase());
}

export function formatReferralCode(code: string): string {
  return code.toUpperCase().trim();
}

export function calculatePositionAfterReferrals(
  basePosition: number,
  referralCount: number
): number {
  const boost = referralCount * REFERRAL_BOOST_PER_REFERRAL;
  return Math.max(1, basePosition - boost);
}

export function getReferralShareText(code: string, position: number): string {
  return `Join the GlobalCover waitlist and get exclusive insurance deals for digital nomads! Use my referral code ${code} to skip ahead in line. I'm currently #${position}!`;
}

export function getReferralShareUrl(code: string): string {
  return `https://globalcover.com/join?ref=${code}`;
}
