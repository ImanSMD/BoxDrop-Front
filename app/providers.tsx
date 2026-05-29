"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
// Eagerly register the PWA install-prompt capture (must run before any route
// mounts so Android's early `beforeinstallprompt` event isn't missed).
import "@/lib/pwa/install";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="bottom-center" dir="rtl" richColors closeButton />
    </QueryClientProvider>
  );
}
