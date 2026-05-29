"use client";

import { useEffect, useState } from "react";
import { Download, Share, Plus, X } from "lucide-react";
import {
  getInstallPrompt,
  clearInstallPrompt,
  subscribeInstall,
  isAppInstalled,
  isIOS,
} from "@/lib/pwa/install";

const VISITS_KEY = "boxdrop_visits";
const DISMISSED_KEY = "boxdrop_install_dismissed";

export function InstallBanner() {
  const [hasPrompt, setHasPrompt] = useState(false);
  const [ios, setIos] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isAppInstalled()) return;

    // Count visits — banner appears from the 2nd visit onward (§11).
    const visits = Number(localStorage.getItem(VISITS_KEY) ?? "0") + 1;
    localStorage.setItem(VISITS_KEY, String(visits));
    const alreadyDismissed = localStorage.getItem(DISMISSED_KEY) === "1";

    setDismissed(alreadyDismissed);
    setEligible(visits >= 2 && !alreadyDismissed);
    setIos(isIOS());
    setHasPrompt(Boolean(getInstallPrompt()));

    // Android may deliver the prompt slightly after mount — stay subscribed.
    const unsub = subscribeInstall(() => setHasPrompt(Boolean(getInstallPrompt())));
    return unsub;
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
  };

  const install = async () => {
    const prompt = getInstallPrompt();
    if (!prompt) return;
    await prompt.prompt();
    await prompt.userChoice;
    clearInstallPrompt();
    dismiss();
  };

  // Show when eligible and either a native prompt is ready (Android/Chrome) or
  // we're on iOS Safari (which needs manual Add-to-Home-Screen instructions).
  if (dismissed || !eligible) return null;
  if (!hasPrompt && !ios) return null;

  return (
    <div className="fixed inset-x-0 bottom-24 z-40 mx-auto flex max-w-md px-4">
      <div className="flex flex-1 items-center gap-3 rounded-2xl bg-ink p-3 text-white shadow-lg">
        <span className="text-2xl">📦</span>
        <div className="flex-1">
          <div className="text-sm font-extrabold">باکس‌دراپ را نصب کن</div>
          {ios && !hasPrompt ? (
            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-white/70">
              <span>دکمه</span>
              <Share className="size-3.5" />
              <span>را بزن و «افزودن به صفحهٔ اصلی»</span>
              <Plus className="size-3.5" />
              <span>را انتخاب کن.</span>
            </div>
          ) : (
            <div className="text-[11px] text-white/70">
              دسترسی سریع‌تر، مثل یک اپ واقعی.
            </div>
          )}
        </div>
        {!ios && hasPrompt && (
          <button
            onClick={install}
            className="flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-extrabold"
          >
            <Download className="size-4" /> نصب
          </button>
        )}
        <button onClick={dismiss} aria-label="بستن" className="p-1 text-white/60">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
