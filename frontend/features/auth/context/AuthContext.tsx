'use client';

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { useImmer } from 'use-immer';
import { authApi } from '../api/auth.api';
import type { AuthUser } from '../types/auth.types';
import { ApiError } from '@/shared/lib/apiClient';

// ============================================================
//  Auth Context — Powered by useImmer & Cookie Sessions
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
  updateUser: (recipe: (draft: AuthUser) => void) => void;
  logout: () => Promise<void>;
}

const INITIAL_STATE: AuthState = {
  user: null,
  status: 'idle',
  error: null,
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, updateState] = useImmer<AuthState>(INITIAL_STATE);
  const router = useRouter();

  const checkSession = useCallback(async () => {
    updateState((draft) => {
      draft.status = 'loading';
      draft.error = null;
    });

    try {
      const user = await authApi.getMe();
      updateState((draft) => {
        draft.user = user;
        draft.status = 'authenticated';
      });
    } catch (error) {
      updateState((draft) => {
        draft.user = null;
        draft.status = 'unauthenticated';
        draft.error = error instanceof ApiError ? error.message : null;
      });
    }
  }, [updateState]);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const setAuthUser = useCallback(
    (user: AuthUser) => {
      updateState((draft) => {
        draft.user = user;
        draft.status = 'authenticated';
        draft.error = null;
      });
    },
    [updateState],
  );

  const updateUser = useCallback(
    (recipe: (draft: AuthUser) => void) => {
      updateState((draft) => {
        if (draft.user) {
          recipe(draft.user);
        }
      });
    },
    [updateState],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignored
    } finally {
      updateState((draft) => {
        draft.user = null;
        draft.status = 'unauthenticated';
        draft.error = null;
      });
      router.push('/login');
    }
  }, [updateState, router]);

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
