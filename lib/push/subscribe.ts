import { client } from "@/lib/api/client";

/**
 * Web Push subscription scaffold (CLAUDE.md §11).
 *
 * Phase 1 wires the plumbing but does not auto-prompt. Call this after an
 * explicit user opt-in. Requires NEXT_PUBLIC_VAPID_PUBLIC_KEY and a backend
 * endpoint POST /me/push-subscription that stores the subscription.
 */
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export async function subscribeToPush(): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;

  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapid) return false;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  const reg = await navigator.serviceWorker.ready;
  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapid) as BufferSource,
  });

  await client.post("/me/push-subscription", subscription.toJSON());
  return true;
}
