import { create } from "zustand";

/**
 * Client-only UI state (CLAUDE.md §2: Zustand for UI state only).
 * Server state lives in TanStack Query; toasts go through sonner directly.
 */
type UiState = {
  /** Deal id whose Join modal is currently open, or null. */
  joinDealId: string | null;
  openJoin: (dealId: string) => void;
  closeJoin: () => void;

  /** Whether the user dismissed the PWA install banner this session. */
  installBannerDismissed: boolean;
  dismissInstallBanner: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  joinDealId: null,
  openJoin: (dealId) => set({ joinDealId: dealId }),
  closeJoin: () => set({ joinDealId: null }),

  installBannerDismissed: false,
  dismissInstallBanner: () => set({ installBannerDismissed: true }),
}));
