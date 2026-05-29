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

  /**
   * In-progress pledge quantity per deal, shared between the DealCard stepper
   * and the JoinDealModal so the modal opens with the quantity the user picked
   * on the card (e.g. tap "+" to 3 on a card → modal shows totals for 3).
   */
  dealQty: Record<string, number>;
  setDealQty: (dealId: string, qty: number) => void;

  /** Whether the user dismissed the PWA install banner this session. */
  installBannerDismissed: boolean;
  dismissInstallBanner: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  joinDealId: null,
  openJoin: (dealId) => set({ joinDealId: dealId }),
  closeJoin: () => set({ joinDealId: null }),

  dealQty: {},
  setDealQty: (dealId, qty) =>
    set((s) => ({ dealQty: { ...s.dealQty, [dealId]: Math.max(1, qty) } })),

  installBannerDismissed: false,
  dismissInstallBanner: () => set({ installBannerDismissed: true }),
}));
