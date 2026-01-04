'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface Member {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  plan: 'monthly' | 'annual';
  memberSince: string;
  referralCode: string;
  status: 'active' | 'cancelled' | 'expired';
}

interface MemberAuthContextType {
  member: Member | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const MemberAuthContext = createContext<MemberAuthContextType | undefined>(undefined);

const STORAGE_KEY = 'globalcover_member_session';

export function MemberAuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Member;
          // Validate session isn't expired (24 hour sessions)
          const sessionData = localStorage.getItem(`${STORAGE_KEY}_timestamp`);
          if (sessionData) {
            const timestamp = parseInt(sessionData, 10);
            const hoursSinceLogin = (Date.now() - timestamp) / (1000 * 60 * 60);
            if (hoursSinceLogin < 24) {
              setMember(parsed);
            } else {
              // Session expired
              localStorage.removeItem(STORAGE_KEY);
              localStorage.removeItem(`${STORAGE_KEY}_timestamp`);
            }
          }
        }
      } catch (e) {
        console.error('Error checking session:', e);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // In a real app, this would verify against the database
      // For MVP, we'll check if the email format is valid and create a session
      // In production, you'd want magic link or OAuth
      
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      // Simulate API call to verify member
      // In production: const response = await fetch('/api/v1/auth/verify', { ... })
      
      // For demo purposes, create a member session
      // In production, this data would come from the database
      const emailParts = email.split('@');
      const namePart = emailParts[0] ?? 'member';
      const firstNameParts = namePart.split('.');
      const firstName = firstNameParts[0] ?? 'Member';
      const dateStr = new Date().toISOString().split('T')[0] ?? new Date().toISOString().substring(0, 10);
      
      const memberData: Member = {
        id: `member_${Date.now()}`,
        email: email,
        firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
        lastName: '',
        plan: 'annual',
        memberSince: dateStr,
        referralCode: `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        status: 'active',
      };

      // Store session
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memberData));
      localStorage.setItem(`${STORAGE_KEY}_timestamp`, Date.now().toString());
      
      setMember(memberData);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(`${STORAGE_KEY}_timestamp`);
    setMember(null);
  }, []);

  return (
    <MemberAuthContext.Provider
      value={{
        member,
        isLoading,
        isAuthenticated: !!member,
        login,
        logout,
      }}
    >
      {children}
    </MemberAuthContext.Provider>
  );
}

export function useMemberAuth() {
  const context = useContext(MemberAuthContext);
  if (context === undefined) {
    throw new Error('useMemberAuth must be used within a MemberAuthProvider');
  }
  return context;
}
