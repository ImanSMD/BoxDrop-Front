import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const REFRESH_COOKIE = "boxdrop_refresh";

// Reads the httpOnly refresh cookie server-side, exchanges it at the backend
// for a fresh access token, and returns it to the in-memory token store.
export async function POST() {
  const refresh = cookies().get(REFRESH_COOKIE)?.value;
  if (!refresh) {
    return NextResponse.json({ error: "no_session" }, { status: 401 });
  }

  // In mock mode there is no backend to exchange with — the presence of the
  // session cookie (set after OTP verify) is enough to restore a session.
  if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
    return NextResponse.json({ access: "mock-access-token" });
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) {
      return NextResponse.json({ error: "refresh_failed" }, { status: 401 });
    }
    const data = (await res.json()) as { access: string };
    return NextResponse.json({ access: data.access });
  } catch {
    return NextResponse.json({ error: "refresh_error" }, { status: 401 });
  }
}
