# BoxDrop — README files

> Two files. Save each at the **root of its repo** (alongside `CLAUDE.md`):
>
> - **Section 1** → `boxdrop-backend/README.md`
> - **Section 2** → `boxdrop-frontend/README.md`
>
> These are for humans onboarding to the project. The deep spec lives in each repo's `CLAUDE.md`.

---

# SECTION 1 — `boxdrop-backend/README.md`

# BoxDrop Backend

REST API for BoxDrop — a Tehran-based group-buying marketplace. Built with Django + DRF + PostgreSQL + Celery.

> **Reading order for new contributors:** this README → then `CLAUDE.md` (project context & spec) → then the live API schema at `/api/docs/` once the server runs.

## Stack

Python 3.12 · Django 5 · DRF · SimpleJWT · PostgreSQL 16 · Redis · Celery · Kavenegar (SMS) · Zarinpal (payments) · `drf-spectacular` (OpenAPI)

## Prerequisites

- Python 3.12
- Docker + Docker Compose (Postgres + Redis locally)
- A Kavenegar API key (SMS)
- A Zarinpal merchant ID (sandbox is fine for dev)

## Quickstart

```bash
git clone <repo-url> boxdrop-backend
cd boxdrop-backend

# Python env
python -m venv .venv
source .venv/bin/activate
pip install -r requirements/dev.txt

# Environment
cp .env.example .env
# Edit .env: SECRET_KEY, KAVENEGAR_API_KEY, ZARINPAL_MERCHANT_ID, DB creds

# Local services
docker-compose up -d postgres redis

# DB
python manage.py migrate
python manage.py createsuperuser

# Run
python manage.py runserver
```

In separate terminals:

```bash
celery -A boxdrop worker -l info
celery -A boxdrop beat -l info
```

- API docs: http://localhost:8000/api/docs/
- Django admin: http://localhost:8000/admin/

## Common commands

```bash
# Tests
pytest                       # all
pytest wallet/               # one app
pytest -k test_lock_funds    # by name

# Lint / format
ruff check .
ruff format .

# Migrations
python manage.py makemigrations
python manage.py migrate

# Shell
python manage.py shell_plus
```

## Project structure (brief)

Modular monolith — 8 Django apps with strict service-layer boundaries:

```
accounts/   wallet/   catalog/   deals/
delivery/   notifications/   referrals/   common/
```

**Apps never import other apps' models.** All cross-app calls go through `app/services.py`. Full rules in `CLAUDE.md`.

## Environment variables

See `.env.example` for the full list. Key variables:

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | Django secret |
| `DEBUG` | `1` in dev, `0` in prod |
| `DATABASE_URL` | Postgres connection string |
| `REDIS_URL` | Redis connection string |
| `KAVENEGAR_API_KEY` | SMS (OTP + transactional) |
| `ZARINPAL_MERCHANT_ID` | Payment gateway |
| `ZARINPAL_SANDBOX` | `1` for sandbox, `0` for live |
| `JWT_ACCESS_LIFETIME_MIN` | Default 15 |
| `JWT_REFRESH_LIFETIME_DAYS` | Default 30 |
| `CORS_ALLOWED_ORIGINS` | Frontend origin(s) |

## Connecting to the frontend

The Next.js frontend (`boxdrop-frontend`) consumes this API. For local dev:

1. `CORS_ALLOWED_ORIGINS` must include `http://localhost:3000`
2. Backend runs on `:8000`, frontend on `:3000`
3. Frontend's `NEXT_PUBLIC_API_URL` points to `http://localhost:8000/api/v1`

## Money correctness

All money is **integer Toman**. Wallet transactions are **append-only**. **Read the "Money Rules" section in `CLAUDE.md` before touching anything in `wallet/`.** A wallet invariant test runs in CI and must always pass.

## Testing approach

- Every `services.py` function has at least one happy-path and one failure-path test.
- Wallet has the ledger invariant test (must run green on every PR).
- Use `factory_boy` factories for test fixtures, not hand-built JSON.

## Deployment

Production: ArvanCloud. Pipeline via GitLab CI on `gitlab.oxalisys.com`:

```
lint → tests → migrations → restart workers
```

Secrets live in GitLab CI variables. Backups are daily, encrypted, with quarterly restore tests.

## Links

- Spec / Claude Code context: [`CLAUDE.md`](./CLAUDE.md)
- Live API docs (Swagger): `http://localhost:8000/api/docs/`
- OpenAPI schema: `http://localhost:8000/api/schema/`
- Frontend repo: `boxdrop-frontend`
- Master roadmap: shared chat artifact (with Matin)

---
---
---

# SECTION 2 — `boxdrop-frontend/README.md`

# BoxDrop Frontend

Persian-first PWA for BoxDrop — the buyer app. Built with Next.js 14 + Tailwind + shadcn/ui.

> **Reading order for new contributors:** this README → then `CLAUDE.md` (project context & spec) → then run the app and explore.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · TanStack Query · Zustand · `next-pwa` · `react-hook-form` + `zod` · `dayjs` + `jalaliday`

## Prerequisites

- Node 20+
- npm (or pnpm/yarn)
- Backend running locally (see `boxdrop-backend`)

## Quickstart

```bash
git clone <repo-url> boxdrop-frontend
cd boxdrop-frontend

# Install
npm install

# Environment
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Dev server
npm run dev
```

Open http://localhost:3000. The app is **RTL and Persian** — don't be surprised when everything looks "mirrored" if you're used to LTR.

## Common commands

```bash
npm run dev          # dev server (Turbopack)
npm run build        # production build
npm start            # run the production build locally
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm test             # tests (when added)
```

## Project structure (brief)

```
app/                 # Next.js App Router pages
components/          # UI components (DealCard, JoinDealModal, ...)
lib/
  api/               # typed API clients (one file per resource)
  hooks/             # TanStack Query hooks
  format/            # Persian number, money, Jalali date utils
  auth/              # token store
  store/             # Zustand UI state
public/              # static assets, PWA icons
```

Full structure and conventions in `CLAUDE.md`.

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL (e.g., `http://localhost:8000/api/v1`) |
| `NEXT_PUBLIC_ZARINPAL_RETURN_URL` | Where Zarinpal redirects after payment |

## Persian + RTL conventions

- Root layout: `<html lang="fa" dir="rtl">`
- All numbers go through `formatNumber()` → Persian numerals (۰۱۲۳۴۵۶۷۸۹)
- Money displayed as `۱۷,۰۰۰ ت`
- Dates in **Jalali (Shamsi) calendar**, **Tehran timezone**
- Use Tailwind logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`) instead of `ml-*`, `mr-*`, etc.
- Font: Vazirmatn (Persian-optimized)

## Connecting to the backend

Local dev:

1. Backend running on `:8000`
2. `NEXT_PUBLIC_API_URL` set in `.env.local`
3. Backend's `CORS_ALLOWED_ORIGINS` includes `http://localhost:3000`

Live API schema for reference while building: `http://localhost:8000/api/docs/`

## Auth & tokens

- **Access token in memory only.** Never localStorage.
- **Refresh token in an httpOnly cookie** set by a Next.js API route.
- Do not log tokens. Do not send them to error trackers.

## PWA testing

- Install banner appears after the 2nd visit (dismissible).
- Offline shell: throttle network in DevTools, app shell still loads from cache.
- iOS: add to home screen manually; confirm the 180×180 icon shows.
- Web Push: requires HTTPS for prod; works on `localhost` for dev.

## Deployment

Built with `next build`, served via Node behind Nginx on ArvanCloud. GitLab CI pipeline:

```
lint → typecheck → build → deploy
```

## Links

- Spec / Claude Code context: [`CLAUDE.md`](./CLAUDE.md)
- Backend repo: `boxdrop-backend`
- API schema (local): `http://localhost:8000/api/docs/`
- Master roadmap: shared chat artifact (with Matin)
