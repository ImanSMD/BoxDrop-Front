import { NextResponse } from "next/server";

// Stores the refresh token in an httpOnly cookie (CLAUDE.md §7).
// JS never reads this cookie; it is only read server-side by /api/auth/refresh.
const REFRESH_COOKIE = "boxdrop_refresh";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function POST(req: Request) {
  const { refresh } = (await req.json()) as { refresh?: string };
  if (!refresh) {
    return NextResponse.json({ error: "missing_refresh" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(REFRESH_COOKIE, refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(REFRESH_COOKIE);
  return res;
}
