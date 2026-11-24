# GatePass

**A multi-tenant SaaS for securing estate/gated-community access** — residents issue
shareable visitor codes, guards verify and approve or reject entry at the gate in
real time, and every decision is written to an immutable audit trail. Companies
manage one or more estates; a platform team oversees every company on the system.

Built solo, end to end: product scoping, data model, multi-tenant authorization,
four role-specific UIs, and the operational issues (connection pooling, race
conditions, idempotency) that only show up once real data starts flowing through it.

> **Stack at a glance:** Next.js 16 (App Router) · React 19 · TypeScript ·
> Tailwind CSS v4 · Prisma 7 · Neon Postgres (serverless) · Neon-managed Better
> Auth · Zod · Framer Motion

---

## Table of contents

- [What it does](#what-it-does)
- [The four roles](#the-four-roles)
- [Feature highlights](#feature-highlights)
- [Architecture](#architecture)
- [Tech stack and why](#tech-stack-and-why)
- [Engineering problems worth reading about](#engineering-problems-worth-reading-about)
- [Data model](#data-model)
- [Project structure](#project-structure)
- [Running it locally](#running-it-locally)
- [How it was built](#how-it-was-built)
- [Known gaps and deliberate scope cuts](#known-gaps-and-deliberate-scope-cuts)

---

## What it does

Gated residential estates (common across Nigeria and much of West Africa, and the
model GatePass is designed around) rely on a guard at a gate checking visitors in
and out, usually with a paper logbook or a phone call to "confirm" with the
resident. That has no record, no revocation, and no way for a resident or estate
manager to see what actually happened at their gate.

GatePass replaces that with a simple loop:

1. A **resident** creates a visitor pass for a unit — a name, a validity window,
   and an optional note. The system generates a 6-digit code and a scannable QR
   code for it.
2. The resident shares that code with their visitor however they like (no email
   sending is built into this product — it's a copy-and-share link/code, by
   design).
3. At the gate, a **guard** types the code or scans the QR with their phone
   camera. The system tells them instantly whether it's valid, expired,
   already used, or doesn't exist — and the guard approves or rejects.
4. That decision is permanent. The resident gets an in-app notification. The
   estate gets a row in an access log that is never edited or deleted.
5. A **company admin** (the estate operator) manages estates, units, and who
   has which role, and can see an audit trail of every administrative action.
6. A **platform admin** (GatePass's own internal team) can see every company on
   the system and suspend one if needed — nothing else, no god-mode editing of
   tenant data.

## The four roles

| Role | Can do | Can't do |
|---|---|---|
| **Resident** | Create/revoke visitor passes for their own unit, see their pass history, get notified when a pass is used or rejected | Touch any other resident's passes, see estate-wide access logs |
| **Guard** | Verify a code/QR, approve or reject entry, see their own last 24h of decisions | Create passes, see anything outside the gate flow |
| **Manager / Company admin** | Manage estates, units, residents, guards, invitations, and see the full estate audit log | Access another company's data, impersonate a resident's pass |
| **Platform admin** | List every company, suspend/reactivate one, with a reason recorded | Edit a company's estates, units, members, or passes directly |

Each role gets its own purpose-built shell and navigation, not one generic
dashboard with permission checks sprinkled into it — see
[`src/components/layout`](src/components/layout).

## Feature highlights

- **Visitor passes with real QR codes** — codes are generated with the `qrcode`
  library (not a placeholder pattern) and decoded at the gate with `jsqr`
  against the device camera, so the on-screen QR and the one a camera actually
  reads are guaranteed to be the same symbol.
- **Idempotent, race-safe gate decisions** — approving a pass is a single
  conditional `UPDATE ... WHERE status = 'ACTIVE'` inside a transaction, so two
  guards (or a retried request) can never both redeem the same code. A retry of
  the exact same decision (same `clientRequestId`) replays the stored outcome
  instead of creating a duplicate event.
- **Link-based invitations, no email service** — inviting a resident, guard, or
  manager produces a shareable link with a hashed, expiring token. There's no
  SMTP/email provider in this build at all; sharing the link is the product
  decision, not a missing integration.
- **Append-only audit trail** — every gate decision (`AccessEvent`) and every
  administrative action (`AuditLog`) is written once and never updated. "What
  happened at the gate" and "who changed the system" are deliberately two
  different tables.
- **In-app notifications**, not push/SMS — a resident sees the moment their pass
  is used or rejected, inside the app.
- **Platform-level oversight** — suspend a company (with a required reason,
  logged) without ever touching that company's own data.
- **Mobile-first across all four roles** — bottom tab navigation on phones for
  every shell (including the two sidebar-based admin shells, which collapse
  into the same pattern below `md`), `100dvh`-based layout instead of the
  classic `100vh` mobile-browser-chrome bug, and `overscroll-contain` so the
  UI doesn't rubber-band or drift while scrolling.
- **Motion with intent, not decoration** — Framer Motion drives real enter/exit
  animation for modals, drawers, toasts, and page transitions (the CSS-only
  system this replaced had no exit animation at all — things just vanished).
  Every animation collapses to an instant state change under
  `prefers-reduced-motion`, both in the CSS layer and the Framer Motion layer.

## Architecture

GatePass is a **modular monolith**, not a pile of ad-hoc routes: one Next.js
app, organized by layer with strict one-way dependencies.

```
app (pages, layouts)  ─┐
components, features  ─┼─▶  server/actions, app/api/**/route.ts  ─▶  server/services  ─▶  server/domain
                        │        (entry adapters: auth, Zod-parse,         (authorize, business rules,     (pure rules: no I/O)
                        │         call ONE service, map errors)            transactions, side effects)
lib (isomorphic:       ─┘                                                          │
 Zod schemas, perms,                                                               ▼
 formatters)                                                                  Prisma → Neon Postgres
```

- **Server Component by default.** `'use client'` is reserved for the smallest
  interactive leaf — a form with live state, the QR camera scanner, a dialog.
  Reads go straight from a Server Component to a service; nothing fetches its
  own API from the server.
- **Mutations are Server Actions** (`src/server/actions/*.actions.ts`) that
  authenticate, parse input with Zod, call exactly one service, and map the
  result — never business logic inline.
- **Route Handlers exist for exactly one thing today**: Better Auth's
  catch-all (`src/app/api/auth/[...path]/route.ts`). Everything else is a
  Server Action calling a service, including the gate verify/decide flow.
- **Authorization lives in the service layer, not in layouts or middleware.**
  `src/proxy.ts` only redirects based on cookie *presence* — it never reads the
  database. Every service call re-derives the caller's real permissions via an
  `Actor` built fresh from the session (`src/server/authz/actor.ts`), because a
  present cookie only means a session *might* exist.
- **Results vs. errors, on purpose.** `AppError` exists only for
  permission/validation/integrity failures. An expired pass or an
  already-accepted invite is a typed *result*, not a thrown error — the
  calling code is expected to handle it, not catch it.
- **No client-side state library.** There's no Redux/Zustand/TanStack Query
  here — reads are Server Components, writes are Server Actions with
  `revalidatePath`, and the few places that need local interactive state
  (a form, a filter, a modal's open/closed flag) use plain `useState`. For an
  app this size, that's a deliberate choice to keep the client bundle small,
  not a gap.

## Tech stack and why

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server Components for data-heavy admin screens, Server Actions for mutations, file-based route groups per role |
| UI | React 19, Tailwind CSS v4, shadcn-style primitives | Tailwind v4's `@utility`/CSS-variable theming for the light/dark/guard themes without a CSS-in-JS runtime |
| Language | TypeScript (strict) | End-to-end typed data flow from Prisma → service → Server Action → component |
| Database | Neon Postgres (serverless Postgres) | Branching, autosuspend, and a pooled connection string out of the box |
| ORM | Prisma 7 with the `prisma-client` generator and a `@prisma/adapter-pg` driver adapter | See the connection-pool story below — a plain `pg.Pool` over Neon's pooled connection, not the WebSocket edge adapter |
| Auth | Neon's managed Better Auth | Identity and sessions are hosted by Neon; GatePass layers its own `Actor`/role/permission model in its own Postgres tables on top — Neon's `neon_auth` schema is never modeled or migrated by this app's Prisma schema |
| Validation | Zod | Every Server Action and Route Handler parses input before it reaches a service |
| QR | `qrcode` (generate) + `jsqr` (decode from camera frames) | Real, scannable codes — not a static image or placeholder |
| Motion | Framer Motion (`motion` package, `motion/react`) | Real enter/exit animation for modals, drawers, toasts, and page transitions; see [`src/lib/motion.ts`](src/lib/motion.ts) |
| Icons | lucide-react | |

## Engineering problems worth reading about

A few specific decisions and bugs, because "I used Next.js and Prisma" says
very little on its own.

### 1. A real production latency bug, root-caused and fixed

The app originally used Prisma's WebSocket-based Neon adapter
(`@prisma/adapter-neon`), which is built for edge/serverless runtimes with no
persistent TCP connection — it opens a *fresh* connection (full DNS + TLS + WS
handshake) whenever its pool has gone idle. In a normal long-running Next.js
server process, that's most requests, and it was adding **1-3 seconds to every
page load**.

The fix ([`src/server/db/client.ts`](src/server/db/client.ts)) was to switch to
a plain `pg.Pool` over Neon's *pooled* (PgBouncer) connection string instead,
with `idleTimeoutMillis` raised to 10 minutes and TCP keepalive enabled so
normal think-time between page loads doesn't force a reconnect. That introduces
a second, narrower problem: Neon can close a pooled connection server-side
(compute autosuspend, PgBouncer's own idle timeout) *before* the client-side
timeout elapses, so the pool can occasionally hand out a connection that looks
alive but fails on first use with Prisma's `P1017`. That's handled with a
`$extends` query middleware that retries exactly once, and only for that
specific error code — safe, because a `P1017` means the query never reached the
database in the first place.

### 2. Anti-enumeration at the gate

Entering a code at the gate that belongs to a *different estate* returns the
exact same "not found" response as a code that doesn't exist anywhere — the
guard app never reveals that a code is valid-but-elsewhere. That rejection is
also recorded as a real `AccessEvent` before the guard ever gets to "decide"
anything, so even failed attempts are in the log.

### 3. Idempotency where it actually matters

The gate's approve/reject action is keyed on `(guardId, clientRequestId)` with
a unique constraint. A flaky connection that causes the guard's phone to retry
a decision doesn't create a second access event or double-redeem a pass — it
just replays the stored outcome.

### 4. Tenant isolation isn't a middleware trick

There's no row-level security and no shared "current tenant" global. Every
service function takes the caller's `Actor` and the target `estateId`/`companyId`
explicitly, and authorizes against the actor's *own* memberships
(`src/server/authz/policies.ts`) on every single call — not once per request,
not cached across a layout.

## Data model

```
PlatformAdmin (internal team, seed-only — no signup path)

Company ──< CompanyMembership (COMPANY_ADMIN)
   │
   └──< Estate ──< EstateMembership (MANAGER | RESIDENT | GUARD)
           │              │
           │              ├──< VisitorPass ──< AccessEvent ──< Notification
           │              │        (issued by a resident,        (to the resident
           │              │         redeemed by a guard)           who issued it)
           │              │
           └──< ResidentialUnit ──< ResidentAssignment
           │
           └──< Invitation (link-based, hashed token, expiring)

Company / Estate ──< AuditLog (append-only, administrative actions)
```

A few deliberate details:

- `VisitorPass.code` is a 6-digit code stored **in plaintext**, by design — a
  resident can reshare it at any time, which matters more for this product
  than a one-time hashed token would.
- `AccessEvent` is never updated or deleted by the application — it's the
  system of record for "what happened at the gate."
- Every tenant-scoped table carries a compound unique constraint
  (`[id, estateId]` / `[id, companyId]`) so a foreign key can enforce that a
  child row's parent reference actually agrees with its own tenant id, not
  just that *some* parent exists.

Full schema: [`prisma/schema/`](prisma/schema/) (split into `base`, `tenancy`,
`access`, and `auth`).

## Project structure

```
src/
  app/                    Route groups per audience: (auth) (platform) (company)
                          (resident) (guard) (account) (public) — pages/layouts only
  components/
    ui/                   Generic primitives with no GatePass concept baked in
                          (Button, Modal/Drawer, Toast, DataTable, Field, …)
    layout/               Shell chrome shared across roles (Sidebar, BottomTabs,
                          SignOutButton, PageTransition, per-role *Shell)
  features/<feature>/     Things that know a GatePass concept: components/hooks
                          for passes, gate, members, estates, units, audit, …
  server/
    actions/              Server Actions — the only way features reach server/
    services/<domain>.service.ts   Authorize, business rules, transactions
    domain/                Pure rules, no I/O (e.g. pass status derivation)
    authz/                 Actor construction + permission policies
    auth/                  The Neon Better Auth client wrapper
    db/                    Prisma client + the driver-adapter setup above
    errors/                AppError
  lib/                    Isomorphic: Zod schemas, permission map, formatters,
                          motion presets — importable from client or server
  proxy.ts                Cookie-presence redirects + security headers only
prisma/
  schema/                 Multi-file Prisma schema
  migrations/             Hand-reviewed SQL migrations
```

## Running it locally

**Prerequisites:** Node 20+, a free [Neon](https://neon.tech) project (Postgres
+ its managed Better Auth add-on).

```bash
git clone <this repo>
cd gatepass
cp .env.example .env     # fill in the values below
npm install               # also runs `prisma generate` via postinstall
npx prisma migrate deploy # applies the existing migrations to your Neon DB
npm run dev
```

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Neon console → Connect → **pooled** connection string |
| `DATABASE_URL_UNPOOLED` | Same dialog, pooling unchecked — used only by the Prisma CLI |
| `NEON_AUTH_BASE_URL` | Neon console → Auth tab → Project Info → "Auth URL" |
| `NEON_AUTH_COOKIE_SECRET` | Any random 32+ character string (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` in dev |
| `SEED_PLATFORM_ADMIN_EMAIL` / `_PASSWORD` / `_NAME` | Reserved for a platform-admin seed script — see [Known gaps](#known-gaps-and-deliberate-scope-cuts) |

Other scripts:

```bash
npm run lint    # ESLint (eslint-config-next + @typescript-eslint)
npm run build   # production build
npx tsc --noEmit  # type-check only
```

## How it was built

This was built solo in a focused ~1 week sprint (22 commits), as a deliberately
staged build rather than one big-bang commit — each commit is a usable vertical
slice:

1. Scaffold + full UI design system (themes, components) *before* wiring any
   data — so every later feature slots into an already-consistent look.
2. Prisma schema + Neon Postgres, migrated.
3. Real authentication (Neon-managed Better Auth) + company/estate management.
4. Link-based invitations for residents, guards, and managers.
5. Residential units + resident-to-unit assignment.
6. Visitor passes with a shareable code.
7. Real QR generation and camera-based scanning at the gate.
8. Estate-wide access log and real overview statistics.
9. Audit log wired into invites, estate status changes, and pass revocation.
10. Platform-admin area: real company list, suspend/reactivate with a reason.
11. A real production performance bug found and fixed (the connection-pool
    story above), plus loading states across all four shells.
12. A production sign-in bug (auth errors weren't surfaced in logs) diagnosed
    and fixed.
13. A full mobile-responsiveness pass across all four roles, fixing both
    layout (admin sidebars not collapsing on phones) and feel (the classic
    `100vh`-vs-mobile-browser-chrome bug that made a "fixed" bottom nav drift
    while scrolling).
14. UX polish: skip the sign-in confirmation click-through, require
    confirmation before signing out, and add Framer Motion for real
    enter/exit animation on the app's flagship surfaces.

~8,900 lines of application TypeScript/TSX (excluding the generated Prisma
client), across roughly a dozen feature modules and four role-specific UI
shells.

## Known gaps and deliberate scope cuts

Being upfront about both kinds of thing not in this build:

**Not done yet (genuine gaps):**
- No automated test suite. `tests/e2e` and `tests/integration` are scaffolded
  as directories with an intended structure, but no tests are written yet.
- No CI pipeline.
- `prisma7.config.ts` already points at a seed script (`tsx prisma/seed.ts`)
  for provisioning the platform super-admin from the `SEED_PLATFORM_ADMIN_*`
  env vars — the script itself hasn't been written yet.
- The `/dashboard` role router assumes one role per user and sends a
  multi-role user to the first membership it finds; a chooser screen for that
  edge case doesn't exist yet.

**Deliberately out of scope for this build**, not missed: AI-assisted gate
decisions, face/biometric recognition, CCTV/hardware integration, recurring
passes, billing, native mobile apps, in-app chat, SMS/WhatsApp delivery,
estate-defined custom roles beyond Manager/Resident/Guard, WebSockets,
Postgres row-level security, and a separate "Visitor" entity distinct from a
pass. Keeping these explicitly out let the actual MVP ship in a week instead
of stalling on infrastructure nobody was using yet.
