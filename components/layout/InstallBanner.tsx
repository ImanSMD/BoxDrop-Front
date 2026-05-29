"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const VISITS_KEY = "boxdrop_visits";
const DISMISSED_KEY = "boxdrop_install_dismissed";

export function InstallBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Count visits (banner appears from the 2nd visit onward, §11).
    const visits = Number(localStorage.getItem(VISITS_KEY) ?? "0") + 1;
    localStorage.setItem(VISITS_KEY, String(visits));
    const dismissed = localStorage.getItem(DISMISSED_KEY) === "1";

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      if (visits >= 2 && !dismissed) setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setShow(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    dismiss();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-24 z-40 mx-auto flex max-w-md items-center gap-3 px-4">
      <div className="flex flex-1 items-center gap-3 rounded-2xl bg-ink p-3 text-white shadow-lg">
        <span className="text-2xl">📦</span>
        <div className="flex-1">
          <div className="text-sm font-extrabold">باکس‌دراپ را نصب کن</div>
          <div className="text-[11px] text-white/70">
            دسترسی سریع‌تر، مثل یک اپ واقعی.
          </div>
        </div>
        <button
          onClick={install}
          className="flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-extrabold"
        >
          <Download className="size-4" /> نصب
        </button>
        <button onClick={dismiss} aria-label="بستن" className="p-1 text-white/60">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
