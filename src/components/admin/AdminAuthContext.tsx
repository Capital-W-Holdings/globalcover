'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  apiKey: string | null;
  login: (key: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

const STORAGE_KEY = 'gc_admin_key';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved key on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = sessionStorage.getItem(STORAGE_KEY);
      if (savedKey) {
        setApiKey(savedKey);
      }
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (key: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Verify the key by making a test request
      const response = await fetch('/api/v1/admin/stats', {
        headers: {
          'Authorization': `Bearer ${key}`,
        },
      });

      if (response.ok) {
        setApiKey(key);
        sessionStorage.setItem(STORAGE_KEY, key);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setApiKey(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated: !!apiKey,
        apiKey,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}

// Hook for making authenticated API calls
export function useAdminApi() {
  const { apiKey } = useAdminAuth();

  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    if (!apiKey) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }, [apiKey]);

  return { fetchWithAuth };
}
