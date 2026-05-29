import { create } from "zustand";

/**
 * Auth token storage (CLAUDE.md §7).
 *
 * - Access token lives in memory only (this Zustand store) — never localStorage.
 * - The refresh token is held in an httpOnly cookie set by the Next.js route
 *   handlers under app/api/auth/*; JS never reads it directly. The client
 *   refreshes the access token by calling /api/auth/refresh, which reads the
 *   cookie server-side.
 *
 * Tradeoff: keeping access in memory means a full page reload drops it; we
 * re-hydrate on boot by calling the refresh route (see useAuthBootstrap).
 */
type TokenState = {
  accessToken: string | null;
  /** True once we've attempted to restore a session on boot. */
  hydrated: boolean;
  setAccessToken: (token: string | null) => void;
  setHydrated: (value: boolean) => void;
  clear: () => void;
};

export const useTokenStore = create<TokenState>((set) => ({
  accessToken: null,
  hydrated: false,
  setAccessToken: (token) => set({ accessToken: token }),
  setHydrated: (value) => set({ hydrated: value }),
  clear: () => set({ accessToken: null }),
}));

/** Read the current access token outside React (used by the API client). */
export const getAccessToken = () => useTokenStore.getState().accessToken;
export const setAccessToken = (token: string | null) =>
  useTokenStore.getState().setAccessToken(token);
