# BoxDrop Frontend — Phase 2

## How to use this file

Live, viral, polished. Do not start until `PHASE1_COMPLETION.md` is fully closed and the backend has shipped corresponding Phase 2 endpoints on staging.

**Scope locked from chat:**
- Standing Orders UI → **Phase 3**.
- Distance-weighted split UX → **Phase 3** or skipped.
- Self-serve supplier portal → separate app, not this repo.

## Alignment Pass — before any code

1. Confirm `PHASE1_COMPLETION.md` is closed.
2. Confirm backend Phase 2 has shipped WS + new REST endpoints.
3. Read this file + `CLAUDE.md` §10–§11.
4. Produce a written plan per section.
5. Wait for review.

## Phase 2 work

### 1. Live deal progress + activity feed (WebSockets)

- [ ] `lib/ws/client.ts` — connect, reconnect with backoff, JWT auth.
- [ ] `useDealProgress(dealId)` — subscribes, updates TanStack Query cache.
- [ ] `useZoneActivity(zoneId)` — feeds activity toasts.
- [ ] Activity toast: bottom-anchored, 3-4s, max 1 per 4s (throttle, drop excess).
- [ ] Copy: `"👀 س از ونک به دیل آبجو مالت پیوست"` (initial + zone, never full name).
- [ ] Clean disconnect on unmount and logout.
- [ ] Fall back to polling on repeated WS failures.

### 2. Referral dashboard (extended)

The basic two-card split shipped in Phase 1 Completion. Phase 2 makes it rich.

- [ ] Activations list per referral type from `GET /me/referrals/activations?type=`.
- [ ] Animated counters on load.
- [ ] Rich share previews: image generator with referral code overlay for Stories.
- [ ] Telegram, WhatsApp, Instagram deep links.

### 3. Product voting UI

- [ ] In `/search` or new tab: "Most-wanted in your zone" from `GET /products/popular?zone=`.
- [ ] Vote toggle on Product cards without active deals. Optimistic UI.
- [ ] Persian empty state: "هنوز رأی نداده‌ای — اولین نفر باش 🥇".

### 4. Volume Champion celebration

- [ ] On VC award (via WS or refresh): confetti + modal "🏆 شما قهرمان حجم این دیل شدید! ۳٪ کش‌بک به کیف پولتون اضافه شد."
- [ ] Use `canvas-confetti`.
- [ ] Lifetime VC badge on profile.

### 5. Notifications inbox

- [ ] `/notifications` page from bell icon.
- [ ] `GET /me/notifications` (backend Phase 2 endpoint).
- [ ] Unread badge, mark-as-read on view, empty state.

### 6. Full-text search

- [ ] Debounced (300ms) `GET /deals?q=`.
- [ ] Recent searches in `localStorage`.
- [ ] Empty state: "چیزی پیدا نکردیم — یه دسته‌بندی دیگه امتحان کن".

### 7. Multi-zone UX polish

- [ ] Searchable zone picker with district grouping.
- [ ] Optional geolocation detection (single ask, never re-ask).

### 8. Performance pass

- [ ] Next.js `Image` for ProductPhoto with correct sizes.
- [ ] Route prefetching on hover/focus.
- [ ] React Query stale-while-revalidate reviewed per resource.
- [ ] Dynamic imports for confetti + charts.
- [ ] Lighthouse PWA score ≥ 90 on mid-tier Android emulation.

### 9. What's NOT in Phase 2

- Standing Orders UI.
- Building leaderboard UI.
- BoxDrop Plus subscription UI.
- Multi-language.
- Supplier-facing app (separate repo).

### Definition of Done for Phase 2

- [ ] WS-driven live updates verified in production for at least one deal feed.
- [ ] Referral share generated at least one new signup (tracked via analytics).
- [ ] VC celebration triggered correctly end-to-end at least once in production.
- [ ] Lighthouse PWA score ≥ 90.
- [ ] All Phase 2 screens pass the `CLAUDE.md` §16 quality checklist on real data.
