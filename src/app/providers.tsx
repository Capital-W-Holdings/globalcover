'use client';

import { type ReactNode } from 'react';
import { MemberAuthProvider } from '@/components/auth';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MemberAuthProvider>
      {children}
    </MemberAuthProvider>
  );
}
