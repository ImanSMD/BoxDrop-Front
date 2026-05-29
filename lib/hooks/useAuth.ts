import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useTokenStore } from "@/lib/auth/token-store";
import type { VerifyOtpResult } from "@/lib/api/types";

/** Persist the refresh token in the httpOnly cookie via the Next.js route. */
async function saveSession(refresh: string) {
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
}

export const useRequestOtp = () =>
  useMutation({
    mutationFn: (phone: string) => authApi.requestOtp(phone),
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "ارسال کد ناموفق بود.");
    },
  });

export const useVerifyOtp = () => {
  const setAccessToken = useTokenStore((s) => s.setAccessToken);
  return useMutation<
    VerifyOtpResult,
    unknown,
    { phone: string; code: string; referral_code?: string }
  >({
    mutationFn: (body) => authApi.verifyOtp(body),
    onSuccess: async (data) => {
      setAccessToken(data.access);
      await saveSession(data.refresh);
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "کد نامعتبر است.");
    },
  });
};

export const useLogout = () => {
  const clear = useTokenStore((s) => s.clear);
  const qc = useQueryClient();
  return async () => {
    clear();
    qc.clear();
    await fetch("/api/auth/session", { method: "DELETE" });
  };
};

/**
 * On first mount, restore the access token from the refresh cookie so a page
 * reload doesn't log the user out (access token lives only in memory).
 */
export function useAuthBootstrap() {
  const { accessToken, hydrated, setAccessToken, setHydrated } = useTokenStore();

  useEffect(() => {
    if (hydrated || accessToken) {
      if (!hydrated) setHydrated(true);
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/refresh", { method: "POST" });
        if (active && res.ok) {
          const data = (await res.json()) as { access?: string };
          if (data.access) setAccessToken(data.access);
        }
      } finally {
        if (active) setHydrated(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [accessToken, hydrated, setAccessToken, setHydrated]);

  return { accessToken, hydrated };
}
