# Subscription Tracker

A full-stack SaaS app for tracking recurring subscriptions, variable utility bills, and budgets. Users can monitor spending, mark payments, detect unused services, manage budgets, view a bill calendar, and export data.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router), React 19, TypeScript 5 |
| API Server | Hono 4 (runs inside Next.js `/api/[[...route]]`) |
| Database | PostgreSQL via Prisma 7 |
| Data Fetching | TanStack React Query 5 |
| Forms | React Hook Form 7 + Zod 4 |
| UI | Shadcn UI + Radix UI + Tailwind CSS 4 |
| Auth | JWT (jsonwebtoken) + bcryptjs, HTTP-only cookies |
| Email | Resend |
| Export | jsPDF + custom CSV |
| Security | Rate limiting, CSRF protection, input sanitization, OWASP security headers |

## Key Directories

```
src/
  app/
    (auth)/           # Sign-in, sign-up, OTP verification, forgot/reset password
    (dashboard)/      # Protected pages: dashboard, subscriptions, utility-bills, budgets, bill-calendar, upcoming, billing-history, settings
    (marketing)/      # Public landing page
    api/[[...route]]/ # Single Next.js route handler — Hono app entry point
    api/cron/         # Cron endpoint for bill reminders
  features/
    auth/             # Auth hooks, components, Hono routes, schemas
    subscriptions/    # Subscription & utility bill hooks, components, Hono routes, schemas
    budgets/          # Budget hooks, components, Hono routes, schemas
  components/         # Shared layout (navbar, sidebar) and Shadcn ui/ primitives
  components/landing/ # Landing page sections
  lib/
    db.ts             # Prisma client singleton
    rpc.ts            # Hono RPC client (type-safe frontend <-> backend)
    sessionMiddleware.ts # JWT verification middleware injecting user into Hono context
    jwt.ts            # Token creation/verification helpers
    rateLimiter.ts    # IP-based rate limiting
    csrf.ts           # CSRF protection middleware
    sanitize.ts       # HTML/script stripping for user inputs
    securityHeaders.ts # OWASP security headers
    send-reminders.ts # Cron job: bill reminder & overdue alert emails
    email-templates.ts # HTML email templates
```

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint

npx prisma generate   # Regenerate Prisma client after schema changes
npx prisma db push    # Sync schema to database
npx prisma studio     # DB admin UI
```

## Environment Variables

Required in `.env.local`: `DATABASE_URL`, `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `RESEND_API_KEY`, `CRON_SECRET`

## Critical Files

| File | Purpose |
|---|---|
| `src/app/api/[[...route]]/route.ts` | Mounts all Hono sub-apps with global security middleware |
| `src/features/subscriptions/server/route.ts` | All subscription + utility bill API routes |
| `src/features/auth/server/route.ts` | Auth API routes (login, register, OTP, password reset) |
| `src/features/budgets/server/route.ts` | Budget + expense API routes |
| `src/lib/sessionMiddleware.ts` | Auth guard used in every protected route |
| `src/features/subscriptions/schemas.ts` | Subscription/utility Zod schemas (client + server) |
| `src/features/auth/schemas.ts` | Auth Zod schemas |
| `src/features/budgets/schemas.ts` | Budget Zod schemas |
| `src/lib/rpc.ts` | Hono RPC client — enables `InferRequestType`/`InferResponseType` |
| `src/components/query-provider.tsx` | React Query provider wrapping the app |
| `src/components/navigation.tsx` | Dashboard sidebar navigation items |

## Additional Documentation

Detailed docs are in `.claude/docs/` — check these when working in the relevant area:

| Doc | Covers |
|---|---|
| [Architectural Patterns](.claude/docs/architectural_patterns.md) | API layer, middleware stack, data-fetching hooks, auth flow, form pattern, dialog convention, state management, security architecture, email/notifications |
| [API Reference](.claude/docs/api_reference.md) | All API endpoints (auth, subscriptions, budgets, cron) with methods, auth requirements, and rate limits |
| [Features Overview](.claude/docs/features_overview.md) | All implemented features: auth, subscriptions, utility bills, dashboard, budgets, bill calendar, upcoming, billing history, settings, email notifications, landing page |
| [Hooks Reference](.claude/docs/hooks_reference.md) | All 36 React Query hooks across auth, subscriptions, and budgets |
| [Schemas Reference](.claude/docs/schemas_reference.md) | All Zod validation schemas, constants, and field definitions |
| [Project Structure](.claude/docs/project_structure.md) | Full directory tree with file-level descriptions |
