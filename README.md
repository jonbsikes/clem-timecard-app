# Clem Dirt Work — Time Card & Project Management PWA

Mobile-first Progressive Web App for submitting daily time cards and sharing
site documents. Built with **Next.js 15 (App Router) + Supabase + Resend**,
deployed on **Vercel**.

See `dirtwork-timecard-app-spec.md` for the full product spec.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 + React 19 + TypeScript + Tailwind CSS |
| PWA | Service worker (`public/sw.js`) + IndexedDB offline queue (`src/lib/offline-queue.ts`) |
| Auth / DB / Storage | Supabase (Postgres + Auth + Storage, with RLS) |
| Email | Resend |
| Hosting | Vercel (with Cron) |

---

## Supabase project

Project: **Clem** (`bocwkfaldyibtlkhajzy`, region `us-east-2`, Postgres 17).

Schema, RLS policies, and storage buckets were provisioned via migrations:
- `init_schema` — tables, helper `public.is_admin()`, RLS policies, auth trigger
- `seed_dropdowns_and_storage` — default work types, equipment seeds,
  `entry-photos` + `project-docs` buckets and their policies

Tables: `users`, `projects`, `equipment`, `work_types`, `time_cards`,
`time_card_entries`, `entry_photos`, `project_documents`, `app_settings`.

Regenerate DB types anytime with:

```bash
npx supabase gen types typescript --project-id bocwkfaldyibtlkhajzy > src/lib/db-types.ts
```

---

## Local setup

```bash
npm install
cp .env.local.example .env.local
# fill in SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, CRON_SECRET, SUMMARY_FROM_EMAIL
npm run dev
```

Open http://localhost:3000.

### Create the first admin

1. In Supabase dashboard → **Authentication → Users → Add user**, create your
   admin email + password (or use the Invite flow).
2. In SQL editor, promote them:
   ```sql
   update public.users set role = 'admin', full_name = 'Owner Name'
   where email = 'you@example.com';
   ```
3. Sign in at `/login`. Admin routes live under `/admin`.

Subsequent employees should be added via **Admin → Employees → Invite**.

---

## Environment variables

| Key | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Supabase publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Invite users, run cron as admin |
| `RESEND_API_KEY` | server only | Send daily summary email |
| `SUMMARY_FROM_EMAIL` | server only | e.g. `"Clem <no-reply@yourdomain.com>"` |
| `CRON_SECRET` | server only | Auth for `/api/cron/*` routes |
| `DEFAULT_TIMEZONE` | server only | Fallback tz (default `America/Chicago`) |
| `NEXT_PUBLIC_SITE_URL` | optional | Used in email links and password resets |

The timezone and summary recipient can also be overridden at runtime from
**Admin → Settings** (writes `app_settings`).

---

## Deploy to Vercel

1. Push this repo to GitHub and **Import** into Vercel.
2. Set all env vars above in **Project Settings → Environment Variables**
   (mark service role + Resend as *Server-only*; do NOT prefix with `NEXT_PUBLIC_`).
3. `vercel.json` already declares two cron jobs:
   - `GET /api/cron/lock-cards` — daily at 08:00 UTC (locks prior-day cards
     whose local date has passed)
   - `GET /api/cron/daily-summary` — daily at 23:00 UTC (sends the summary if
     the current hour in the configured timezone matches `summary_send_hour`)
   Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`.
4. In Supabase → **Authentication → URL Configuration**, set
   Site URL to your Vercel URL and add it under Redirect URLs.

### Manual trigger

```bash
curl "https://YOUR-APP.vercel.app/api/cron/daily-summary?secret=$CRON_SECRET&force=1"
curl "https://YOUR-APP.vercel.app/api/cron/lock-cards?secret=$CRON_SECRET"
```

---

## Feature map

### Employee (`/time-cards`)
- `/time-cards` — My submissions (list, editable before lock)
- `/time-cards/new` — Multi-entry form, GPS capture, offline queue
- `/time-cards/[id]` — Detail + photo upload per entry
- `/time-cards/projects` + `/time-cards/projects/[id]` — Site plans in the field

### Admin (`/admin`, requires role=admin)
- `/admin` — Dashboard with date/project/employee/type/status filters
- `/admin` → **Export CSV** (`/api/admin/export`)
- `/admin/projects` + `/admin/projects/[id]` — Project CRUD, doc uploads
- `/admin/employees` — Invite, role, active toggle, password reset
- `/admin/equipment` — Manage fleet list
- `/admin/work-types` — Manage work type dropdown
- `/admin/settings` — Daily summary recipient, hour, timezone

### Cron / background
- `GET /api/cron/lock-cards` — locks yesterday's unlocked cards (TZ-aware)
- `GET /api/cron/daily-summary` — sends grouped summary to the office email

### Offline
- Service worker at `/sw.js` caches app shell; navigations fall back to `/offline`.
- New Time Card form enqueues into IndexedDB when `navigator.onLine === false`
  or the API fails. Queue flushes automatically on `online` or when the SW
  posts a `SYNC_TIMECARDS` message.

---

## RLS summary

- Employees see + edit **only their own** time cards/entries/photos, and only
  while `locked = false`.
- All authenticated users read projects, equipment, work types, and project
  documents.
- Only `is_admin()` users can write those tables, invite users, lock/unlock
  cards, or delete data.
- Storage: `entry-photos` writes are scoped to `auth.uid()/…`; `project-docs`
  writes are admin-only; both buckets are read by authenticated users via
  signed URLs.

---

## TODO / nice-to-haves

- PWA icons: drop real `public/icon-192.png` and `public/icon-512.png`.
- QuickBooks / invoicing integration (Phase 4+).
- Billable vs non-billable hour split (Open Question #3).
- Equipment hours tracked separately from labor hours (Open Question #4).
