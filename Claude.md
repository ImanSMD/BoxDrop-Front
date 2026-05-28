# BoxDrop Frontend — Project Context

## 1. What we're building

BoxDrop is a Tehran-based group-buying marketplace. Users browse **deals**, join them by pledging quantity, and when enough people join, everyone gets the wholesale price. Goods are delivered by shared courier routes.

This repo is the **Next.js PWA** consumed by buyers. The Django backend (`boxdrop-backend`) provides the REST API. Ops uses Django admin separately.

**This is a Persian-first, RTL, mobile-first PWA.**

## 2. Stack (locked)

- Next.js 14+ (App Router)
- TypeScript (strict)
- Tailwind CSS
- shadcn/ui (copy-paste components)
- TanStack Query (server state)
- Zustand (client UI state only)
- `next-pwa` (service worker, manifest)
- `react-hook-form` + `zod` (forms + validation)
- `dayjs` + `jalaliday` (date handling)
- Lucide icons

## 3. Persian + RTL Requirements

- Root layout: `<html lang="fa" dir="rtl">`.
- **All text in Persian.** No English strings in user-facing UI unless they're brand names.
- **All numbers displayed in Persian numerals** (۰۱۲۳۴۵۶۷۸۹). Build a `formatNumber(n)` utility that converts.
- **Money displayed with Persian numerals + " ت" suffix.** e.g., `۱۷,۰۰۰ ت`.
- **Dates** displayed in Jalali (Shamsi) calendar. Use `dayjs` with `jalaliday` plugin.
- **Tehran time** for all date display. Backend sends UTC; convert on display.
- Use Tailwind's **logical properties** (`ms-*`, `me-*`, `ps-*`, `pe-*`) rather than `ml-*`, `mr-*` so RTL flips automatically.
- Font: `Vazirmatn` (Persian-optimized, Google Fonts).

## 4. Folder Structure

```
boxdrop-frontend/
├── app/                         # App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── verify/page.tsx
│   │   └── onboarding/page.tsx
│   ├── (main)/
│   │   ├── layout.tsx           # bottom nav, app shell
│   │   ├── page.tsx             # home feed
│   │   ├── deals/[id]/page.tsx
│   │   ├── search/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── deliveries/page.tsx
│   │   ├── wallet/page.tsx
│   │   └── profile/page.tsx
│   ├── layout.tsx               # root, RTL, fonts
│   └── globals.css
├── components/
│   ├── ui/                      # shadcn/ui generated
│   ├── deal/
│   │   ├── DealCard.tsx
│   │   ├── DealTierLadder.tsx
│   │   ├── DealProgress.tsx
│   │   └── JoinDealModal.tsx
│   ├── wallet/
│   │   ├── WalletBadge.tsx
│   │   └── TransactionRow.tsx
│   ├── layout/
│   │   ├── BottomNav.tsx
│   │   ├── Header.tsx
│   │   └── Toast.tsx
│   └── common/
│       └── PersianNumber.tsx
├── lib/
│   ├── api/                     # typed API client, one file per resource
│   │   ├── client.ts            # fetch wrapper with auth + refresh
│   │   ├── auth.ts
│   │   ├── me.ts
│   │   ├── wallet.ts
│   │   ├── deals.ts
│   │   ├── orders.ts
│   │   ├── deliveries.ts
│   │   └── catalog.ts
│   ├── auth/
│   │   └── token-store.ts       # access token (memory) + refresh (httpOnly cookie or secure store)
│   ├── format/
│   │   ├── number.ts            # English → Persian digits
│   │   ├── money.ts             # 17000 → "۱۷,۰۰۰ ت"
│   │   └── date.ts              # ISO UTC → Jalali Tehran time
│   ├── hooks/
│   │   ├── useDeals.ts          # TanStack Query wrappers
│   │   ├── useWallet.ts
│   │   └── useOrders.ts
│   └── store/
│       └── ui.ts                # Zustand: toasts, modals
├── public/
│   ├── icons/                   # PWA icons
│   └── manifest.json
├── styles/
│   └── globals.css              # Tailwind base + Vazirmatn import
├── next.config.js               # next-pwa config
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 5. Design Tokens

Match the bold + playful mockup style. Tailwind config:

```ts
colors: {
  primary: { DEFAULT: '#FF4500', dark: '#e03d00' },   // orange — CTA, accents
  accent: '#FFB300',                                   // gold — rewards
  ink: '#1A1A2E',                                      // headings, primary text
  muted: '#8E8E93',
  surface: '#F2F2F7',                                  // page bg
  card: '#FFFFFF',
  success: '#00C853',
  danger: '#EF4444',
  tier: { bronze: '#0EA5E9', silver: '#FF9500', gold: '#00C853' },
  zone: {
    vanak: '#8B5CF6', ponak: '#0EA5E9', niavaran: '#10B981',
    saadatabad: '#F59E0B', jordan: '#EF4444',
  },
},
borderRadius: { xl: '20px', '2xl': '28px' },
```

Use Vazirmatn as default font. Bottom nav bar always visible on main routes. Bold typography, ample whitespace, generous rounded corners.

## 6. API Client Pattern

`lib/api/client.ts` is a fetch wrapper:
- Base URL from `process.env.NEXT_PUBLIC_API_URL`
- Attaches `Authorization: Bearer <access>` if present
- On `401`, attempts refresh once, retries
- Throws typed errors with `{code, message, details}`

Each resource file (`auth.ts`, `wallet.ts`, etc.) exports typed functions matching the contract:

```ts
// lib/api/deals.ts
export type Deal = { /* matches contract */ };
export type DealDetail = Deal & { /* extra fields */ };

export const dealsApi = {
  list: (params: { category?: string; status?: string; sort?: string; page?: number }) =>
    client.get<Paginated<Deal>>('/deals', { params }),
  get: (id: string) => client.get<DealDetail>(`/deals/${id}`),
  join: (id: string, body: { quantity: number }) =>
    client.post<Pledge>(`/deals/${id}/join`, body),
};
```

Then hooks in `lib/hooks/useDeals.ts`:
```ts
export const useDeals = (params) =>
  useQuery({ queryKey: ['deals', params], queryFn: () => dealsApi.list(params) });

export const useJoinDeal = (id) =>
  useMutation({ mutationFn: (body) => dealsApi.join(id, body), onSuccess: ... });
```

## 7. Auth Flow

1. `/login` — phone input → `POST /auth/request-otp`. On success, navigate to `/verify`.
2. `/verify` — 6-digit OTP input. Pick up `?ref=CODE` from URL if present. Call `POST /auth/verify-otp` with `referral_code`. Store tokens. If `is_new`, route to `/onboarding`, else to `/`.
3. `/onboarding` — full name, zone picker (modal), address text, optional map pin. `PATCH /me`.

Token storage:
- **Access token in memory** (Zustand or React context), never localStorage.
- **Refresh token in httpOnly cookie** set by an API route, or in a secure web storage with care. For Phase 1, accept slightly less hardened storage if necessary, but document the tradeoff.

## 8. API Contract (binding)

> The contract is binding. Frontend MUST consume the exact shapes below. To change anything, update this section first, then update code on both sides.

Conventions:
- Base path: `/api/v1/`
- Auth header: `Authorization: Bearer <access_token>`
- Money fields: integer Toman (e.g., `17000`)
- Datetimes: ISO 8601 UTC. Display in Jalali + Tehran time.
- Errors: `{ "error": { "code": "string", "message": "fa string", "details": {} } }`
- Lists: `{ "results": [...], "count": int, "next": url|null, "previous": url|null }`

### Endpoints

**Auth**
- `POST /auth/request-otp` → `{phone}` → `{sent, expires_in}`
- `POST /auth/verify-otp` → `{phone, code, referral_code?}` → `{access, refresh, user, is_new}`
- `POST /auth/refresh` → `{refresh}` → `{access}`

**User**
- `GET /me` → `User`
- `PATCH /me` → subset of `{full_name, address, address_pin, zone_id, default_delivery}` → `User`
- `GET /me/referral` → `{code, invited_count, total_referral_cashback}`

**Wallet**
- `GET /wallet` → `{available, locked, currency: "IRT"}`
- `POST /wallet/topup` → `{amount}` (min 50000) → `{redirect_url, payment_id}`
- `GET /wallet/transactions?page=` → paginated `WalletTransaction[]`

**Catalog**
- `GET /categories` → `Category[]`
- `GET /zones` → `Zone[]`
- `GET /deals?category=&status=open&sort=ending_soon|popular|savings&page=` → paginated `Deal[]`
- `GET /deals/{id}` → `DealDetail`

**Deal Actions**
- `POST /deals/{id}/join` → `{quantity}` → `Pledge`
- `POST /pledges/{id}/update` → `{quantity}` → `Pledge`
- `POST /pledges/{id}/cancel` → `{ok, refunded}`

**Orders & Deliveries**
- `GET /orders` → `Order[]`
- `GET /orders/{id}` → `OrderDetail`
- `GET /me/deliveries` → `Delivery[]`
- `GET /deliveries/{id}` → `DeliveryDetail`

### Response shapes

```jsonc
// User
{ "id": "uuid", "phone": "+98...", "full_name": "...",
  "zone": { "id": "...", "name": "ونک" },
  "address": "...", "address_pin": { "lat": 35.7, "lng": 51.4 } | null,
  "default_delivery": "courier", "referral_code": "MATIN42" }

// Deal (summary)
{ "id": "uuid",
  "product": { "name": "آبجو مالت", "emoji": "🍺", "image_url": null,
               "category": { "id": "...", "name": "نوشیدنی", "emoji": "🥤" } },
  "box_size": 12, "units_pledged": 9,
  "wholesale_price": 17000, "retail_reference": 24000, "savings_percent": 29,
  "status": "open", "opens_at": "...", "lock_deadline": "...", "extended_deadline": null,
  "participant_count": 7, "participant_avatars": ["ع","س","ر"],
  "tier": "silver", "my_pledge": { "quantity": 2 } | null }

// DealDetail = Deal + :
{ "description": "...",
  "tiers": [
    { "level": "bronze", "threshold": 5, "label": "گرم شدن" },
    { "level": "silver", "threshold": 9, "label": "داغ شد" },
    { "level": "gold",   "threshold": 12, "label": "آنلاک عمده" }
  ],
  "rewards": { "volume_champion_pct": 3, "referral_pct": 2 },
  "estimated_delivery_fee": 35000,
  "supplier": { "business_name": "..." } }

// Pledge
{ "id": "uuid", "deal_id": "uuid", "quantity": 2,
  "unit_price": 17000, "goods_total": 34000,
  "estimated_delivery_fee": 35000, "total_locked": 69000,
  "status": "active", "is_volume_champion": false,
  "grace_until": "...", "created_at": "..." }

// Order
{ "id": "uuid", "deal": { /* summary */ }, "quantity": 2,
  "status": "locked", "total_locked": 69000,
  "delivery": { "scheduled_date": "...", "zone": "ونک", "window": "14:00-17:00" } | null,
  "timeline": [{ "state": "joined", "at": "...", "done": true }, ...] }

// Delivery
{ "id": "uuid", "scheduled_date": "2026-06-06", "zone": "ونک",
  "window": "14:00-17:00", "status": "pending",
  "estimated_fee": 35000, "final_fee": null, "users_on_route": null,
  "items": [{ "product_name": "...", "quantity": 2 }] }

// WalletTransaction
{ "id": "uuid",
  "type": "topup|lock|unlock|capture|refund|cashback|delivery_reconciliation",
  "amount": 17000, "balance_after": 124500,
  "description": "...", "created_at": "..." }
```

## 9. Screens — Phase 1 Build List

- [ ] `/login` — phone input + Persian validation, "ارسال کد" button
- [ ] `/verify` — 6-digit code, auto-advance between inputs, resend timer
- [ ] `/onboarding` — name, zone (modal picker), address, optional map pin
- [ ] `/` Home feed — category pills (horizontal scroll), DealCard list, sort dropdown, empty state ("هنوز دیلی در منطقه شما نیست")
- [ ] `DealCard` component — emoji, name, zone badge, participant avatars, progress bar, tier badge, savings, countdown timer, +/− quantity, join button
- [ ] `/deals/[id]` — full deal detail with tier ladder (🥉🥈🥇), rewards explainer, supplier name, social proof, big join CTA
- [ ] `JoinDealModal` — quantity stepper, live total calculation (goods + estimated delivery), referral share suggestion, confirm button
- [ ] `/wallet` — balance widget (available + locked badges), top-up CTA, transaction list with type icons
- [ ] Top-up flow — amount input, validate min 50,000, call API, redirect to Zarinpal, return handler
- [ ] `/orders` — tabs (active/past), order cards with status, link to detail
- [ ] `/orders/[id]` — status timeline (joined → locked → preparing → out for delivery → delivered), pledge details
- [ ] `/deliveries` — upcoming + past, route info when available, "fee refund" banner when reconciliation happened
- [ ] `/profile` — info edit, default delivery method, referral code with share buttons (Telegram, WhatsApp), logout
- [ ] `BottomNav` — Home / Search / Orders / Profile
- [ ] Toast system — bottom toasts for success/error/info
- [ ] Loading skeletons for every async section
- [ ] Empty states for every list
- [ ] Error boundaries

## 10. Phase 1 — DO NOT BUILD

- Live activity toasts via WebSocket (Phase 2)
- Search beyond category filter (Phase 2)
- Referral leaderboard / analytics (Phase 2)
- Standing Orders UI (Phase 2)
- Product voting (Phase 2)
- Volume Champion celebration animation (Phase 2)
- Native sharing API beyond simple link copy
- Multi-language support (Persian only)

## 11. PWA Requirements

- `manifest.json` with Persian app name, icons (192/512), `display: standalone`, `theme_color: #FF4500`, `background_color: #FFFFFF`.
- `next-pwa` config: cache shell + static assets, network-first for API.
- Service worker registers Web Push (subscribe + send subscription to backend `/me/push-subscription`).
- iOS Add-to-Home-Screen icon (180x180) + meta tags.
- "Install BoxDrop" banner appears once after 2 visits, dismissible.

## 12. Component Patterns

- **Server components by default.** Use `'use client'` only when interactivity is needed.
- **Forms**: `react-hook-form` + `zod` schemas. One schema per form, colocated with the form.
- **Data fetching in pages**: server components for SEO-friendly read; client components with TanStack Query for interactive sections.
- **Styling**: Tailwind classes only. No inline styles. Use shadcn/ui components and customize via Tailwind.
- **Animations**: Tailwind transitions for most things. Framer Motion only if a specific interaction needs it.
- **Icons**: Lucide React. Emojis are fine in content (they're part of the product feel).
- **Persian numbers**: ALWAYS run through `formatNumber()`. Never render raw `{17000}`.

## 13. Conventions

- TypeScript strict mode. No `any` without a comment justifying it.
- Component file = PascalCase. Hook file = camelCase starting with `use`.
- Server actions only for mutations that benefit from progressive enhancement (rare here — most go through TanStack Query mutations).
- Error handling: catch in mutation/query, surface via toast. Never let errors crash the UI.
- `next.config.js` allows the backend domain for images.
- Environment: `NEXT_PUBLIC_API_URL` for backend base URL. No backend secrets in frontend.

## 14. Initial Setup Commands

```bash
# Create the project
npx create-next-app@latest boxdrop-frontend --typescript --tailwind --app --src-dir=false --import-alias="@/*"
cd boxdrop-frontend

# Install dependencies
npm install @tanstack/react-query zustand react-hook-form @hookform/resolvers zod
npm install dayjs jalaliday
npm install next-pwa
npm install lucide-react

# shadcn/ui setup
npx shadcn-ui@latest init
# When prompted: TypeScript yes, default style, base color slate, CSS variables yes,
# Tailwind config tailwind.config.ts, components alias @/components, utils alias @/lib/utils

# Add components as needed:
npx shadcn-ui@latest add button input dialog drawer toast skeleton

# Persian font (Vazirmatn) — add via Google Fonts in app/layout.tsx
```

## 15. First Working Slice (suggested build order)

1. Root layout with RTL + Vazirmatn font + Tailwind config.
2. Persian number utility + money formatter + date formatter.
3. API client with auth interceptor.
4. Auth pages: `/login`, `/verify`, `/onboarding`.
5. Home feed: list endpoint + DealCard.
6. Deal detail page + Join modal.
7. Wallet page + top-up flow.
8. Orders + Deliveries.
9. Profile + referral share.
10. PWA manifest + service worker.

Don't build screens out of order — each one is a checkpoint to validate the whole stack.

## 16. Quality Checklist (before declaring a screen "done")

- [ ] All text Persian.
- [ ] All numbers Persian numerals.
- [ ] RTL layout correct (test by inspecting margins/paddings).
- [ ] Loading state.
- [ ] Empty state.
- [ ] Error state with retry.
- [ ] Mobile viewport (390px) looks correct.
- [ ] Touch targets ≥ 44px.
- [ ] No raw English text leaked.
- [ ] No `console.log` left in code.

---

# End of Project Docs

Both files share the API contract verbatim (sections 9 in BE and 8 in FE). If the contract changes, both `CLAUDE.md` files must be updated together, and the master roadmap (in chat) updated first.
