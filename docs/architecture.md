# Architecture

## System Overview

SubTracker follows a **monolithic full-stack architecture** where the API server (Hono) runs inside Next.js via a catch-all route handler. The frontend uses React Server Components for initial page loads and Client Components for interactive features.

```
┌─────────────────────────────────────────────────┐
│                    Browser                       │
│  React 19 (Client Components)                    │
│  TanStack React Query (caching, mutations)       │
│  React Hook Form + Zod (validation)              │
└────────────────────┬────────────────────────────┘
                     │ HTTP (Hono RPC Client)
┌────────────────────▼────────────────────────────┐
│              Next.js App Router                   │
│                                                   │
│  ┌─────────────┐  ┌──────────────────────────┐   │
│  │ Server       │  │ /api/[[...route]]         │   │
│  │ Components   │  │                          │   │
│  │ (SSR pages)  │  │  Hono App                │   │
│  │              │  │  ├── /auth/*             │   │
│  │              │  │  ├── /subscriptions/*    │   │
│  │              │  │  └── /budgets/*          │   │
│  └─────────────┘  └──────────┬───────────────┘   │
│                               │                   │
│                    Session Middleware (JWT)        │
└───────────────────────────────┬──────────────────┘
                                │ Prisma ORM
┌───────────────────────────────▼──────────────────┐
│                  PostgreSQL                       │
│  9 tables, 7 enums, cascade deletes              │
└──────────────────────────────────────────────────┘
```

## Data Flow

### Read Flow (e.g., Dashboard)
```
1. Browser → React Query hook (useSubscriptions)
2. Hook → Hono RPC client (type-safe fetch)
3. Hono route → sessionMiddleware (JWT verification)
4. Route handler → Prisma query
5. Prisma → PostgreSQL
6. Response → React Query cache → Component re-render
```

### Write Flow (e.g., Mark as Paid)
```
1. User clicks "Mark as Paid"
2. React Query mutation (useMarkAsPaid)
3. Hono RPC POST request
4. sessionMiddleware → verify JWT → inject user
5. Route handler → Prisma update (status, dates, billing calc)
6. Response → invalidateQueries → UI refresh
```

### Auth Flow
```
1. User submits email + password
2. POST /api/auth/register → bcrypt hash → create user → generate OTP → send email
3. User enters OTP → POST /api/auth/verify-otp → verify + set JWT cookies
4. POST /api/auth/login → verify password → set access_token (24h) + refresh_token (7d)
5. All subsequent requests → sessionMiddleware reads cookie → verifies JWT → injects user
```

## Folder Structure

```
src/
├── app/
│   ├── (auth)/                    # Auth pages (sign-in, sign-up, verify-otp)
│   │   ├── layout.tsx             # Auth layout (centered card)
│   │   ├── sign-in/page.tsx       # Server component → renders SignInCard
│   │   ├── sign-up/page.tsx
│   │   └── verify-otp/page.tsx
│   │
│   ├── (dashboard)/               # Protected dashboard pages
│   │   ├── layout.tsx             # Dashboard layout (sidebar + navbar + content)
│   │   ├── dashboard/page.tsx     # Home/overview
│   │   ├── subscriptions/page.tsx # All subscriptions
│   │   ├── billing-history/page.tsx
│   │   ├── upcoming/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── utility-bills/page.tsx
│   │   ├── budgets/page.tsx
│   │   └── settings/page.tsx
│   │
│   ├── (marketing)/               # Public landing page
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── api/
│   │   ├── [[...route]]/route.ts  # Hono catch-all (mounts auth, subscriptions, budgets)
│   │   └── cron/reminders/route.ts # Cron endpoint for email reminders
│   │
│   ├── globals.css                # Tailwind + custom CSS variables + glass morphism
│   └── layout.tsx                 # Root layout (fonts, providers)
│
├── features/
│   ├── auth/
│   │   ├── server/route.ts        # All auth API routes (Hono)
│   │   ├── api/                   # React Query hooks (use-login, use-register, etc.)
│   │   ├── components/            # SignInCard, SignUpCard, SettingsContent, etc.
│   │   ├── schemas.ts             # Zod schemas (shared client/server)
│   │   ├── action.ts              # Server action: getCurrent()
│   │   └── email-action.ts        # Email sending utilities
│   │
│   ├── subscriptions/
│   │   ├── server/route.ts        # All subscription + utility bill API routes
│   │   ├── api/                   # React Query hooks (15+ hooks)
│   │   ├── components/            # DashboardContent, SubscriptionList, UtilityBillCard, etc.
│   │   ├── schemas.ts             # Zod schemas
│   │   └── data/popular-subscriptions.ts  # 50+ Indian service templates
│   │
│   └── budgets/
│       ├── server/route.ts        # All budget API routes
│       ├── api/                   # React Query hooks (11 hooks)
│       ├── components/            # BudgetPageContent, SafeToSpendCard, etc.
│       └── schemas.ts             # Zod schemas
│
├── components/
│   ├── sidebar.tsx                # Desktop sidebar navigation
│   ├── navbar.tsx                 # Top navigation bar
│   ├── navigation.tsx             # Nav link items
│   ├── mobile-sidebar.tsx         # Mobile sheet navigation
│   ├── query-provider.tsx         # React Query provider
│   ├── landing/                   # 9 landing page section components
│   └── ui/                        # 20+ Shadcn UI primitives
│
└── lib/
    ├── db.ts                      # Prisma client singleton
    ├── rpc.ts                     # Hono RPC client (type-safe frontend ↔ backend)
    ├── sessionMiddleware.ts       # JWT verification middleware
    ├── jwt.ts                     # Token creation/verification helpers
    ├── send-reminders.ts          # Email reminder logic
    ├── email-templates.ts         # HTML email templates
    ├── resend.ts                  # Resend client instance
    └── utils.ts                   # cn() utility for classnames
```

## Key Design Decisions

### Why Hono inside Next.js?
- Type-safe RPC client — `InferRequestType` / `InferResponseType` give end-to-end type safety
- Single deployment unit — no separate API server to manage
- Middleware composability — session middleware applied to route groups easily

### Why React Query (not Server Components for data)?
- Dashboard pages need real-time updates after mutations (mark as paid, record bill)
- Optimistic updates and cache invalidation are critical for UX
- Server Components used for initial auth checks (`getCurrent()` in page.tsx)

### Why Zod 4 (not Prisma types)?
- Shared validation between client forms and server routes
- Runtime type checking on API boundaries
- Prisma types are for DB shape; Zod schemas are for input validation

### Why JWT (not NextAuth/Clerk)?
- Full control over auth flow (OTP verification, custom session middleware)
- No external service dependency
- Simple cookie-based approach with HTTP-only security

## Security Model

| Layer | Protection |
|---|---|
| Auth | bcrypt password hashing (10 rounds), HTTP-only cookies |
| Sessions | JWT with 24h access token + 7d refresh token |
| API Routes | sessionMiddleware on all protected routes |
| Database | Row-level security via `userId` in all queries |
| Cron | Bearer token authentication (CRON_SECRET) |
| Input | Zod schema validation on all mutations |
| CORS | Same-origin (API runs inside Next.js) |

### Missing Security (TODO)
- Rate limiting on auth endpoints
- CSRF protection
- Input sanitization for XSS
- Password complexity requirements
