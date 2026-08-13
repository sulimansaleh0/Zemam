'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/auth.api';
import type { AuthUser } from '../types/auth.types';
import { ApiError } from '@/shared/lib/apiClient';

// ============================================================
//  Auth Context — Powered by Standard React useState & Cookies
// ============================================================

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
}

interface AuthContextValue {
  state: AuthState;
  user: AuthUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkSession: () => Promise<void>;
  setAuthUser: (user: AuthUser) => void;
  updateUser: (updater: (prevUser: AuthUser) => AuthUser) => void;
  logout: () => Promise<void>;
}

const INITIAL_STATE: AuthState = {
  user: null,
  status: 'idle',
  error: null,
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(INITIAL_STATE);
  const router = useRouter();

  const checkSession = useCallback(async () => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));

    try {
      const user = await authApi.getMe();
      setState({
        user,
        status: 'authenticated',
        error: null,
      });
    } catch (error) {
      setState({
        user: null,
        status: 'unauthenticated',
        error: error instanceof ApiError ? error.message : null,
      });
    }
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const setAuthUser = useCallback((user: AuthUser) => {
    setState({
      user,
      status: 'authenticated',
      error: null,
    });
  }, []);

  const updateUser = useCallback((updater: (prevUser: AuthUser) => AuthUser) => {
    setState((prev) => {
      if (!prev.user) return prev;
      return {
        ...prev,
        user: updater(prev.user),
      };
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignored
    } finally {
      setState({
        user: null,
        status: 'unauthenticated',
        error: null,
      });
      router.push('/login');
    }
  }, [router]);

  const value: AuthContextValue = {
    state,
    user: state.user,
    status: state.status,
    isAuthenticated: state.status === 'authenticated',
    isLoading: state.status === 'loading' || state.status === 'idle',
    checkSession,
    setAuthUser,
    updateUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('[useAuth] must be used inside <AuthProvider>');
  }
  return context;
}
