# BoxDrop Frontend — Phase 1 Completion (v2)

## How to use this file

The frontend is **UI-complete on mocks** but **partially unverified against the real backend**. You have an existing Playwright smoke test running against a live local backend (good — extend it, don't rebuild it). Three new mechanics also need to land: cancel with penalty, add-to-pledge, two-tier referrals.

**Rules:**
1. Do not start work in `PHASE2.md` until every checkbox here is checked.
2. **Re-verify the contract.** When swapping a mock to a real call, treat the live response as the source of truth. If it disagrees with `CLAUDE.md` §9, raise it — don't silently adapt.
3. Persian numerals everywhere. No leaked English. No `console.log` in builds. No `any` without justification.

## Alignment Pass — before any code

1. Read this file and `CLAUDE.md`.
2. Confirm `NEXT_PUBLIC_USE_MOCKS=false` boots cleanly against staging.
3. List every screen still on a mock + its endpoint.
4. For each: 2-3 lines on the hook to swap, the loading/empty/error states to re-verify, the Persian text to review.
5. List the new screens/components the three new mechanics add.
6. Wait for review.

## What's already done (do not redo)

- Foundation: RTL root, Vazirmatn, design tokens, typed API client with single-flight 401 refresh, format utilities, Sonner toasts, skeletons, Zustand UI store, providers.
- All Phase 1 screens on mocks: login, verify, onboarding, home feed, deal detail with tier ladder, JoinDealModal, wallet + TopupDrawer + callback, orders, order detail, deliveries, profile + EditProfileDrawer, basic search, BottomNav, Header.
- PWA: `next-pwa`, manifest, service worker, InstallBanner, icons.
- Push subscription utility in `lib/push/subscribe.ts`.
- Playwright smoke test setup against live local backend.

## New mechanics added in this Completion (read before starting)

Three product changes that touch the FE:

1. **Cancel with penalty + add to pledge.** The cancel UX now requires a preview step (showing penalty vs free), and the order detail page gets an "increase quantity" action.
2. **Packaged delivery per user.** The `/deliveries` screen now shows ONE delivery per user per BoxDay containing multiple items from different deals. The mock probably already showed this, but verify against real data.
3. **Two-tier referral system.** Signup referral (input field in `/verify` and onboarding) is distinct from deal-fill referral (share button on deal detail). Profile referral dashboard splits stats into two sections.

## Work to complete

### 1. Mock-to-real swap, screen by screen

#### Auth + me
- [ ] OTP request/verify — confirm referral_code URL param flows through.
- [ ] `GET /me`, `PATCH /me` — verify `address_pin` round-trips.

#### Onboarding
- [ ] **New: signup referral input field.** If user did not enter a code at signup, show it in onboarding as an optional field. Submits to new endpoint `POST /me/signup-referral`. Show success/error toast.

#### `/wallet`
- [ ] `GET /wallet`, `POST /wallet/topup`, callback handler — all real.
- [ ] `GET /wallet/transactions` — verify all transaction types render: `topup, lock, unlock, capture, refund, cashback, delivery_reconciliation, penalty`. **Note `penalty` is new.** Icon: warning ⚠️ or scissors ✂️. Color: muted red. Description in Persian explains the deal.

#### Home + deal detail + JoinDealModal
- [ ] `GET /deals`, `GET /deals/{id}`, `POST /deals/{id}/join` — all real.
- [ ] Tier ladder: confirm thresholds source — client-derived from `box_size`, or from contract field. Match contract.
- [ ] **New: pass `dref` query param to `/join` if URL had it.** Read on page load, persist in component state, include in the join body. If user joins a deal via someone's share link, the `dref` is in the URL.

#### Deal share (new)
- [ ] **New: share button on deal detail.** Calls `GET /deals/{id}/share`, gets `share_url`. Triggers native share API or copies to clipboard + opens Telegram/WhatsApp share intent.
- [ ] Persian copy: "دوستاتو دعوت کن! اگه از این لینک به دیل بپیوندن، هر دو ۳٪ کش‌بک از خرید اون دوست می‌گیرید."

#### `/orders` and `/orders/{id}`
- [ ] `GET /orders`, `GET /orders/{id}` — real.
- [ ] Timeline states from real backend — adjust if names differ (contract wins).
- [ ] Status pills map to real status strings.

#### Pledge update (add quantity)
- [ ] **New: "افزایش تعداد" button on order detail** when deal is `open`/`extended` and remaining capacity > 0.
- [ ] Modal: current quantity + stepper + new total + additional lock amount + confirm.
- [ ] `POST /pledges/{id}/update` with new quantity. Wallet refresh, order refetch on success.
- [ ] Disabled state when at capacity, with Persian explanation.

#### Pledge cancel (with penalty preview)
- [ ] **New: cancel flow has TWO steps.**
  - Step 1: call `GET /pledges/{id}/cancel-preview`. Show modal with:
    - If `is_free`: "لغو رایگان — تا [time] فرصت داری" + green tone.
    - If not: "اگه الان لغو کنی، ۳۰٪ جریمه ([penalty_amount] ت) کسر می‌شه و [refund_amount] ت به کیفت برمی‌گرده." Red/amber tone.
  - Step 2: confirm → `POST /pledges/{id}/cancel`. Show penalty toast if non-zero. Refresh wallet + order.
- [ ] Error handling for `deal_already_locked`: friendly Persian message ("دیل قفل شده و دیگه قابل لغو نیست").
- [ ] Live countdown to `grace_until` on order detail (when active and within grace) so user knows when free-cancel window expires.

#### `/deliveries` and `/deliveries/{id}`
- [ ] `GET /me/deliveries`, `GET /deliveries/{id}` — real.
- [ ] **Verify packaged-per-user model on real data.** One delivery card per upcoming BoxDay containing multiple items.
- [ ] Fee refund banner: shows estimate before route close, shows actual refund after.

#### Profile + referral dashboard (split into two)
- [ ] `GET /me/referral` — real. Response now has `signup` + `deal_fills` subsections.
- [ ] **New: profile referral section split into two cards:**
  - "معرفی دوستان به اپ": invited count, total cashback, share code.
  - "دعوت در دیل‌ها": activations count, total cashback (link to deal detail of past activations).
- [ ] Both cards have share actions with appropriate Persian copy.

### 2. Web Push wiring

- [ ] After permission grant: `POST /me/push-subscription` with the subscription.
- [ ] On logout: `DELETE /me/push-subscription`.
- [ ] No re-prompting on denial.

### 3. Quality pass on every screen

Per `CLAUDE.md` §16:

- [ ] All text Persian. Grep for English leaks.
- [ ] All numbers via `formatNumber()`.
- [ ] RTL audit at 390px. Replace `ml-*`/`mr-*` with `ms-*`/`me-*`.
- [ ] Loading skeletons on every async section.
- [ ] Empty states everywhere.
- [ ] Error states with retry, mapping backend codes to Persian.
- [ ] Touch targets ≥ 44px.
- [ ] No `console.log` in production build.

### 4. Configuration cleanup

- [ ] `NEXT_PUBLIC_USE_MOCKS` defaults `false` for prod builds.
- [ ] `.env.example` up to date.
- [ ] Mock layer marked "dev/test only" in code comments.

### 5. Smoke test — extend existing Playwright suite

You already run a smoke test against a live local backend with Playwright. Extend it to cover the new mechanics:

- [ ] **Existing baseline scenario** (sign up → topup → join → admin locks deal → see order → admin builds route + closes → see refund + delivery) passes against the post-Completion backend.
- [ ] **New scenario: cancel with penalty.** Sign up, top up, join a deal, wait past grace (or seed `grace_until` in past via admin/test helper), open order detail, see penalty preview, confirm cancel, verify wallet shows penalty + partial refund transactions, verify `units_pledged` decrements.
- [ ] **New scenario: add to pledge.** Sign up, top up, join a deal with quantity 1, increase to 3 from order detail, verify wallet lock increases, verify `units_pledged` increments.
- [ ] **New scenario: deal-fill referral.** Two users (A and B). A joins a deal, gets share link, opens link as B (separate session), B signs up and joins via dref, admin locks deal, verify both A and B got 3% cashback in their wallets.
- [ ] **New scenario: signup referral.** A invites B via app code at signup (entered in `/verify`), B joins any deal, admin locks, verify both get the signup reward (20,000 ت).
- [ ] **New scenario: packaged delivery.** User joins two deals in same zone, both lock, verify `/deliveries` shows ONE upcoming delivery with two items, not two separate deliveries.

### Definition of Done for Phase 1 Completion

- [ ] Every checkbox above ticked.
- [ ] App runs without mocks against staging.
- [ ] All Playwright scenarios above pass.
- [ ] Mobile viewport (390px) review done on every screen.

---
---
