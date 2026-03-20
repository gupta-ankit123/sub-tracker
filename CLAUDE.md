# Subscription Tracker

A full-stack app for tracking recurring subscriptions and variable utility bills. Users can monitor spending, mark payments, detect unused services, and export data.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router), React 19, TypeScript 5 |
| API Server | Hono 4 (runs inside Next.js `/api/[[...route]]`) |
| Database | PostgreSQL via Prisma 7 |
| Data Fetching | TanStack React Query 5 |
| Forms | React Hook Form 7 + Zod 4 |
| UI | Shadcn UI + Radix UI + Tailwind CSS 4 |
| Auth | JWT (jsonwebtoken) + bcryptjs, cookies |
| Email | Resend |
| Export | jsPDF + custom CSV |

## Key Directories

```
src/
  app/
    (auth)/           # Sign-in, sign-up, OTP verification pages
    (dashboard)/      # Protected pages: home, analytics, subscriptions, utility-bills, upcoming, billing-history, settings
    api/[[...route]]/ # Single Next.js route handler — Hono app entry point
  features/
    auth/             # Auth hooks, components, Hono routes, schemas
    subscriptions/    # Subscription & utility bill hooks, components, Hono routes, schemas
  components/         # Shared layout (navbar, sidebar) and Shadcn ui/ primitives
  lib/
    db.ts             # Prisma client singleton
    rpc.ts            # Hono RPC client (type-safe frontend ↔ backend)
    sessionMiddleware.ts # JWT verification middleware injecting user into Hono context
    jwt.ts            # Token creation/verification helpers
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

Required in `.env.local`: `DATABASE_URL`, `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `RESEND_API_KEY`

## Critical Files

| File | Purpose |
|---|---|
| `src/app/api/[[...route]]/route.ts` | Mounts all Hono sub-apps |
| `src/features/subscriptions/server/route.ts` | All subscription + utility bill API routes |
| `src/features/auth/server/route.ts` | Auth API routes |
| `src/lib/sessionMiddleware.ts` | Auth guard used in every protected route |
| `src/features/subscriptions/schemas.ts` | Zod schemas shared between client validation and server |
| `src/features/auth/schemas.ts` | Auth Zod schemas |
| `src/lib/rpc.ts` | Hono RPC client — enables `InferRequestType`/`InferResponseType` |
| `src/components/query-provider.tsx` | React Query provider wrapping the app |

## Additional Documentation

Check these when working in the relevant area:

- `.claude/docs/architectural_patterns.md` — API route structure, data-fetching hook pattern, auth flow, form pattern, component conventions
