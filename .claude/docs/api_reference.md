# API Reference

All API routes are served under `/api` via the Hono router in `src/app/api/[[...route]]/route.ts`.

## Auth Routes (`/api/auth`)

Source: `src/features/auth/server/route.ts`

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| POST | `/auth/login` | No | 5/min | Login with email/password |
| POST | `/auth/register` | No | 3/min | Register new user, sends OTP email |
| POST | `/auth/verify-otp` | No | 3/min | Verify email with 6-digit OTP |
| POST | `/auth/refresh` | Cookie | - | Refresh access token using refresh token |
| POST | `/auth/logout` | Yes | - | Clear auth cookies |
| GET | `/auth/current` | Yes | - | Get current authenticated user |
| PATCH | `/auth/profile` | Yes | - | Update user name/phone |
| PATCH | `/auth/settings` | Yes | - | Update currency, timezone, notification prefs |
| PATCH | `/auth/change-password` | Yes | - | Change password (requires current password) |
| POST | `/auth/forgot-password` | No | 3/min | Initiate password reset, sends OTP |
| POST | `/auth/reset-password` | No | 3/min | Reset password with OTP verification |

## Subscription Routes (`/api/subscriptions`)

Source: `src/features/subscriptions/server/route.ts`

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| GET | `/subscriptions` | Yes | - | List all user subscriptions |
| POST | `/subscriptions` | Yes | 20/min | Create new subscription |
| PATCH | `/subscriptions/:id` | Yes | 20/min | Update subscription |
| DELETE | `/subscriptions/:id` | Yes | 20/min | Delete subscription |
| POST | `/subscriptions/:id/mark-as-paid` | Yes | 20/min | Mark bill as paid, advance billing date |
| POST | `/subscriptions/:id/skip-payment` | Yes | 20/min | Skip current payment cycle |
| POST | `/subscriptions/:id/mark-as-used` | Yes | 20/min | Update usage frequency |
| GET | `/subscriptions/utility-bills` | Yes | - | Get utility bills (VARIABLE type) |
| POST | `/subscriptions/utility-bills` | Yes | 20/min | Create utility bill |
| POST | `/subscriptions/records` | Yes | 20/min | Record a bill payment |
| GET | `/subscriptions/billing-history` | Yes | - | Get billing history records |
| POST | `/subscriptions/export` | Yes | 20/min | Export subscriptions (CSV/PDF) |

## Budget Routes (`/api/budgets`)

Source: `src/features/budgets/server/route.ts`

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| GET | `/budgets` | Yes | - | Get budgets for a month (auto-calculates subscription spend) |
| POST | `/budgets` | Yes | 20/min | Create budget category |
| PATCH | `/budgets/:id` | Yes | 20/min | Update budget limit |
| DELETE | `/budgets/:id` | Yes | 20/min | Delete budget |
| POST | `/budgets/:id/expenses` | Yes | 20/min | Add expense to budget |
| DELETE | `/budgets/:id/expenses/:expenseId` | Yes | 20/min | Delete expense |
| POST | `/budgets/carry-forward` | Yes | 20/min | Carry forward unused budget to next month |
| GET | `/budgets/analytics` | Yes | - | Get budget analytics |
| GET | `/budgets/safe-to-spend` | Yes | - | Calculate safe-to-spend amount |

## Cron Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cron/reminders` | CRON_SECRET | Send bill reminders & overdue alerts |

## Global Middleware (applied to all routes)

1. `securityHeaders` — OWASP security headers
2. `csrfProtection` — Origin/Referer validation on mutations
3. `generalLimiter` — 100 req/min rate limit
