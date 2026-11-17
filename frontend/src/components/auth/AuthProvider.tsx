"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetch, clearToken, getToken, setToken } from "@/lib/api";
import type { AuthUser, PublicRegistrationRole } from "@/types/auth";

type AuthPayload = {
  token: string;
  user: AuthUser;
};

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: PublicRegistrationRole;
  company?: string;
  phone?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await apiFetch<{ user: AuthUser }>("/auth/me");
      setUser(response.user);
    } catch {
      // The token may be expired or invalid, so it should not remain in storage.
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Defer the check so the effect body never sets state synchronously.
    void Promise.resolve().then(refresh);
  }, [refresh]);

  const login = useCallback(async (input: LoginInput) => {
    const response = await apiFetch<AuthPayload>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
      skipAuth: true,
    });

    setToken(response.token);
    setUser(response.user);
    return response.user;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const response = await apiFetch<AuthPayload>("/auth/register", {
      method: "POST",
      // The API checks the confirmation field, so mirror the password here.
      body: JSON.stringify({ ...input, confirmPassword: input.password }),
      skipAuth: true,
    });

    setToken(response.token);
    setUser(response.user);
    return response.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // Even if the token is expired, the local session must still be removed.
    }

    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
