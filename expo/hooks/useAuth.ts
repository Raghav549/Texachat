import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import texaApi from "@/services/api";
import type { TEXAUser, AuthState } from "@/types";

/**
 * TEXA Authentication context hook.
 * Connects to production backend with Twilio OTP verification.
 */
export const [AuthProvider, useAuth] = createContextHook(() => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    token: null,
  });

  // ── Session restoration from storage ──────────────────────
  useEffect(() => {
    const restore = async () => {
      try {
        await texaApi.init();
        const token = texaApi.getToken();
        if (token) {
          const { user } = await texaApi.getMe();
          setState({
            isAuthenticated: true,
            isLoading: false,
            user: {
              id: user.id,
              phone: user.phone,
              username: user.username,
              displayName: user.displayName,
              bio: user.bio || "Connect Beyond Limits",
              lastSeen: new Date(user.lastSeen),
              online: user.online,
              verified: user.verified,
            },
            token,
          });
        } else {
          setState((s) => ({ ...s, isLoading: false }));
        }
      } catch {
        setState((s) => ({ ...s, isLoading: false }));
      }
    };
    restore();
  }, []);

  // ── Actions ───────────────────────────────────────────────
  const sendOTP = useCallback(async (phone: string) => {
    return texaApi.sendOTP(phone);
  }, []);

  const login = useCallback(async (phone: string, code: string) => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const result = await texaApi.verifyOTP(phone, code, "TEXA Android");
      texaApi.setToken(result.token);

      const texaUser: TEXAUser = {
        id: result.user.id,
        phone: result.user.phone,
        username: result.user.username,
        displayName: result.user.displayName,
        bio: result.user.bio || "Connect Beyond Limits",
        lastSeen: new Date(result.user.lastSeen),
        online: true,
        verified: true,
      };

      setState({
        isAuthenticated: true,
        isLoading: false,
        user: texaUser,
        token: result.token,
      });
    } catch (err: any) {
      setState((s) => ({ ...s, isLoading: false }));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await texaApi.logout();
    } catch {}
    texaApi.setToken(null);
    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
    });
  }, []);

  const updateUser = useCallback(async (updates: Partial<TEXAUser>) => {
    try {
      const result = await texaApi.updateProfile(updates);
      if (result.user) {
        setState((s) => ({
          ...s,
          user: s.user ? {
            ...s.user,
            ...updates,
            displayName: result.user.displayName || s.user.displayName,
            bio: result.user.bio || s.user.bio,
          } : null,
        }));
      }
    } catch (err) {
      console.warn("[Auth] Profile update failed:", err);
    }
  }, []);

  return { ...state, login, logout, updateUser, sendOTP };
});
