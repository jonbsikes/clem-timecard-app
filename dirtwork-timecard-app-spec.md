# Dirt Work Time Card & Project Management PWA — Developer Spec

## Overview

A mobile-first Progressive Web App (PWA) for a dirt work company. Field employees submit daily time card entries from their phones; the owner reviews submissions, manages projects and site documents, and receives a daily email summary used to generate invoices.

The app must work reliably on rural job sites with poor cell service.

---

## Goals

1. Replace paper time cards with a fast, mobile-friendly digital form.
2. Centralize site plans and construction documents so crews can view them in the field.
3. Give the owner a daily, organized snapshot of work performed for invoicing.
4. Be cheap to run and easy to maintain.

---

## Recommended Stack

| Layer | Recommendation | Notes |
|---|---|---|
| Frontend | **Next.js (React)** configured as a **PWA** | Installs to phone home screen; no app store required |
| Backend / DB / Auth / Storage | **Supabase** (Postgres + Auth + Storage) | One service handles data, login, and file storage |
| Email | **Resend** | Simple API, good deliverability for daily summary |
| Hosting | **Vercel** | Free tier sufficient at this scale |
| Offline support | Service worker + IndexedDB queue | Time cards saved locally, synced when online |

Estimated monthly cost at this scale: **$0–$30**.

Alternatives are fine (Firebase, SvelteKit, Postmark, etc.) — the choices above are optimized for build speed and low maintenance.

---

## User Roles

- **Employee** — submits time cards, views project documents, uploads jobsite photos.
- **Admin** (owner / office) — full access: manages users, projects, equipment, documents; views all submissions; receives daily summary email; exports for invoicing.

---

## Core Features

### Employee (mobile-first)

1. **Login** — email + password or magic link.
2. **New Time Card**
   - Name (auto-filled from logged-in user)
   - Date (defaults to today)
   - Project (searchable dropdown of existing projects + "Add new project" option)
   - One or more **entries** per time card, each containing:
     - Hours worked
     - Type of work (dropdown — see list below)
     - Equipment used (dropdown — see list below)
     - Job status: *In Progress* or *Complete*
     - Optional notes
     - Optional photo(s)
   - Auto-captured GPS location at submission time
3. **My Submissions** — view and edit today's entries until end-of-day cutoff (locks at midnight local time).
4. **Project Documents** — view site plans, construction docs, and uploaded photos for the assigned project.
5. **Photo Upload** — attach jobsite photos to a time card entry or directly to a project.
6. **Offline mode** — submissions queue locally and sync automatically when signal returns.

### Admin (desktop-friendly, also works on mobile)

1. **Dashboard** — all time card submissions with filters: date range, project, employee, work type, status.
2. **Project Management**
   - Create / edit / archive projects
   - Fields: project name, client, address, lot & block, status (active/complete), notes
   - Upload and organize site plans and construction documents per project
3. **Employee Management** — add, remove, deactivate users; reset passwords.
4. **Equipment Management** — maintain the equipment dropdown list to match the company's actual fleet.
5. **Work Type Management** — maintain the work type dropdown list.
6. **CSV Export** — export filtered submissions for import into invoicing software.
7. **Daily Email Summary** — automated combined summary delivered to the office email each evening.

---

## Data Model

### `users`
- id (uuid, pk)
- email (unique)
- full_name
- phone (optional)
- role (`employee` | `admin`)
- active (boolean)
- created_at

### `projects`
- id (uuid, pk)
- name
- client_name
- address
- lot_block (optional)
- status (`active` | `complete` | `archived`)
- notes
- created_by (fk → users.id)
- created_at

### `equipment`
- id (uuid, pk)
- name (e.g., "CAT D5 Dozer", "Bobcat T76")
- category (e.g., "Dozer", "Skid Steer")
- internal_id (optional — company's own asset tag)
- active (boolean)

### `work_types`
- id (uuid, pk)
- name (e.g., "Grading", "Mulching")
- active (boolean)

### `time_cards`
- id (uuid, pk)
- user_id (fk → users.id)
- project_id (fk → projects.id)
- work_date (date)
- submitted_at (timestamp)
- gps_lat (nullable)
- gps_lng (nullable)
- locked (boolean — true after end-of-day cutoff)

### `time_card_entries`
- id (uuid, pk)
- time_card_id (fk → time_cards.id)
- hours (decimal)
- work_type_id (fk → work_types.id)
- equipment_id (fk → equipment.id, nullable)
- job_status (`in_progress` | `complete`)
- notes (text, optional)

### `entry_photos`
- id (uuid, pk)
- time_card_entry_id (fk → time_card_entries.id)
- file_url
- uploaded_at

### `project_documents`
- id (uuid, pk)
- project_id (fk → projects.id)
- file_url
- file_name
- file_type (`site_plan` | `construction_doc` | `photo` | `other`)
- uploaded_by (fk → users.id)
- uploaded_at

---

## Dropdown Defaults

These are starter values. Admin must be able to edit/add/remove via the admin UI.

### Work Types
- Mulching
- Grading
- Rough Grade
- Final Grade
- Dozer Work
- Pads
- Land Clearing
- Landscaping
- Ditch Work
- Road Building
- Erosion Control / Silt Fence
- Demolition
- Hauling
- Stripping Topsoil
- Compaction
- Stone / Gravel Install
- Culvert Install
- Sod / Seeding
- Miscellaneous

### Equipment (categories — owner to provide actual fleet list)
- Excavator (Mini / Standard / Large)
- Bulldozer / Dozer (D3, D4, D5, D6)
- Skid Steer
- Compact Track Loader
- Backhoe
- Motor Grader
- Wheel Loader
- Articulated Dump Truck
- Dump Truck
- Water Truck
- Roller / Compactor
- Forestry Mulcher
- Stump Grinder
- Chainsaw / Hand Tools
- GPS / Laser Equipment

> **Action item:** Get the actual fleet list from the owner so dropdown values match real machines (e.g., "CAT 305 Mini Ex," "Bobcat T76").

---

## Daily Email Summary

**Trigger:** Scheduled job at 6:00 PM local time (configurable).

**Recipient:** Office email address (configurable in admin settings).

**Format:** One combined summary covering all submissions for the day, grouped by project.

**Example:**

> **Subject:** Daily Time Summary — Tue, Apr 14
>
> **Smith Residence — Lot 12, Blk 4**
> • Mike Johnson — 6 hrs Grading (CAT D5) — *In Progress*
> • Mike Johnson — 2 hrs Dozer Work (CAT D5) — *In Progress*
> • Tony Ramirez — 8 hrs Hauling (Mack Dump) — *Complete*
> Project total: **16 hrs**
>
> **Oakridge Subdivision — Phase 2**
> • Carlos Mendez — 8 hrs Land Clearing (CAT 305) — *In Progress*
> Project total: **8 hrs**
>
> **Day total: 24 hrs across 2 projects**
>
> Entries marked *Complete* are highlighted for invoicing.
> [View full dashboard]

Photos should be linked (not embedded) to keep email size small.

---

## Build Phases

### Phase 1 — Core Time Card Flow (MVP)
- Auth (employee + admin roles)
- Projects CRUD
- Equipment & work type dropdowns (admin-managed)
- Time card form with multiple entries
- Admin dashboard with filters
- CSV export

*Outcome: Replaces paper time cards. Immediately useful.*

### Phase 2 — Documents & Photos
- Site plan and construction doc upload per project
- Document viewer (PDF and images)
- Photo upload on time card entries

### Phase 3 — Daily Email Summary
- Scheduled job
- Email template
- Configurable recipient and send time

### Phase 4 — Polish & Field-Readiness
- Offline mode (queue + sync)
- GPS stamping
- Edit-before-lock window
- Search and advanced filtering
- Invoicing software integration (e.g., QuickBooks API) — *if applicable*

---

## Non-Functional Requirements

- **Mobile-first**: every employee screen must be usable one-handed on a phone in bright sunlight. Large tap targets, high contrast.
- **Fast**: time card submission must work in under 30 seconds for a typical entry.
- **Offline-tolerant**: no data loss if signal drops mid-submission.
- **Secure**: row-level security so employees only see their own submissions; admins see all.
- **Audit trail**: submitted_at timestamps preserved; edits after lock require admin.

---

## Open Questions for the Owner

1. What invoicing software does he currently use? (QuickBooks, Foundation, paper, etc.) — affects whether we build CSV export only or a direct integration later.
2. What's his actual equipment fleet? Need exact machine names/IDs for the dropdown.
3. Does he want to track billable vs. non-billable hours (drive time, shop time, repairs)?
4. Should equipment hours be tracked separately from labor hours? (Some contractors invoice them separately.)
5. How many employees will use this at launch? Affects hosting tier choice.
6. What time zone(s) will the crews work in? Affects daily lock cutoff and email send time.
7. Does he want a copy of his current paper time card so the digital version mirrors it?

---

## Out of Scope (v1)

- Native iOS / Android apps
- Direct invoice generation inside the app
- Payroll calculations
- Customer-facing portal
- Subcontractor management

These can be added later if needed.
