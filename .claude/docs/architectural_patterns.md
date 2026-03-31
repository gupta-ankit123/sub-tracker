# Architectural Patterns

## 1. API Layer — Hono Route Chaining

All backend logic lives in `src/features/{feature}/server/route.ts` and is mounted in `src/app/api/[[...route]]/route.ts`.

Routes are built by chaining methods on a Hono instance. This preserves full type inference for the RPC client:

```
// src/features/subscriptions/server/route.ts
const app = new Hono()
  .get("/", sessionMiddleware, async (c) => { ... })
  .post("/", sessionMiddleware, zValidator("json", schema), async (c) => { ... })
  .patch("/:id", sessionMiddleware, zValidator("param", idSchema), zValidator("json", updateSchema), async (c) => { ... })
```

- `sessionMiddleware` (from `src/lib/sessionMiddleware.ts`) is applied to every protected route — never omit it.
- Input validation uses `@hono/zod-validator` with schemas from the feature's `schemas.ts`.
- The user is accessed via `c.get("user")` after `sessionMiddleware` runs.
- All routes return `c.json({ data, ... })` for consistency.

### Global API Middleware Stack

Applied in `src/app/api/[[...route]]/route.ts` in order:

1. **securityHeaders** (`src/lib/securityHeaders.ts`) — OWASP headers on every response
2. **csrfProtection** (`src/lib/csrf.ts`) — Origin/Referer validation on state-changing requests
3. **generalLimiter** (`src/lib/rateLimiter.ts`) — 100 req/min across all endpoints

Additional rate limiters on specific route groups:
- `authStrictLimiter` (5 req/min) on login
- `authTightLimiter` (3 req/min) on register, OTP verify, forgot-password
- `writeLimiter` (20 req/min) on subscription/budget mutations

## 2. Data-Fetching Hooks — React Query + Hono RPC

Every API operation has a dedicated hook in `src/features/{feature}/api/use-*.ts`.

**Query hooks** (`useQuery`):
- `queryKey` matches the resource: `["subscriptions"]`, `["utility-bills"]`, etc.
- `queryFn` calls the typed Hono RPC client from `src/lib/rpc.ts`.
- Check `response.ok` and throw on failure.

**Mutation hooks** (`useMutation`):
- Type parameters: `useMutation<ResponseType, Error, RequestType>` using `InferResponseType`/`InferRequestType` from Hono.
- `onSuccess`: show `toast.success`, then `queryClient.invalidateQueries` for all affected keys.
- `onError`: show `toast.error` with the error message.

See `src/features/subscriptions/api/use-mark-as-paid.ts` for a canonical mutation example and `src/features/subscriptions/api/use-utility-bills.ts` for a file containing multiple hooks.

## 3. Authentication Flow

JWT-based auth with HTTP-only cookies.

1. Login/register -> server calls `createAccessToken(userId)` + `createRefreshToken(userId)` (`src/lib/jwt.ts`).
2. Tokens set as `auth_token` (24h) and `refresh_token` (7d) cookies via `setAccessCookie`. Cookies are `httpOnly`, `sameSite=Strict`, `secure` in production.
3. `sessionMiddleware` reads `auth_token`, verifies it, loads the user from Prisma, and sets it on Hono context with `c.set("user", user)`.
4. All protected Hono routes declare `sessionMiddleware` as the first middleware argument.

### Password Reset Flow

1. User submits email to `POST /auth/forgot-password`
2. Server generates 6-digit OTP, stores hash in DB with 15-min expiry
3. OTP sent via Resend email service using `passwordResetEmailHtml` template
4. User submits OTP + new password to `POST /auth/reset-password`
5. Server verifies OTP hash, updates password, clears OTP fields

### Email Verification (Registration)

1. User registers -> server generates 6-digit OTP, sends via email
2. User submits OTP on `/verify-otp` page -> `POST /auth/verify-otp`
3. Server verifies, marks user as verified, issues tokens

## 4. Form Pattern — React Hook Form + Zod

All forms follow the same structure:

1. Define schema in `src/features/{feature}/schemas.ts` using Zod.
2. `useForm({ resolver: zodResolver(schema), defaultValues: { ... } })` — pre-fill `defaultValues` from props for edit mode.
3. Wrap in Shadcn `<Form>`, use `<FormField>` with `render={({ field }) => ...}` for each input.
4. `onSubmit` calls the relevant mutation hook's `.mutate({ json: payload })`.
5. Close dialog on `onSuccess` callback.

Edit vs. create is handled in the same component — `const isEdit = !!subscription` gates which mutation is called.

See `src/features/subscriptions/components/subscription-form-dialog.tsx` and `utility-bill-form-dialog.tsx`.

## 5. Dialog Component Convention

Form dialogs accept `children` as the trigger and an optional data prop for edit mode:

```typescript
interface Props {
  children?: React.ReactNode;   // custom trigger; falls back to a default button
  subscription?: Subscription;  // present -> edit mode, absent -> create mode
  onSuccess?: () => void;
}
```

Dialog open state is managed with local `useState`. The component is self-contained — no external state required.

## 6. State Management Philosophy

- **Server state** -> React Query (all data from the API).
- **UI state** -> local `useState` (dialog open/close, tab selection).
- **Form state** -> React Hook Form.
- **Derived/computed values** -> `useMemo` inside the component that needs them (e.g., analytics totals in `src/features/subscriptions/components/dashboard-content.tsx`).

There is no global client state library (no Redux, no Zustand). Keep it that way unless a cross-tree state need genuinely arises.

## 7. Feature Folder Structure

Each feature follows this layout:

```
src/features/{feature}/
  api/          # One file per hook: use-{action}.ts
  components/   # React components specific to this feature
  server/       # Hono route handler(s)
  schemas.ts    # Zod schemas (used on both client and server)
```

Shared UI primitives live in `src/components/ui/` (Shadcn-generated). Layout components (navbar, sidebar) live directly in `src/components/`.

## 8. Security Architecture

### Input Sanitization (`src/lib/sanitize.ts`)

All user-provided string inputs are sanitized before processing:
- `stripHtml()` — removes `<script>` tags and HTML elements
- `escapeHtml()` — escapes `&`, `<`, `>`, `"`, `'`
- `sanitizeObject()` — recursively sanitizes all string fields in request bodies

### CSRF Protection (`src/lib/csrf.ts`)

- Validates `Origin`/`Referer` headers on `POST`, `PATCH`, `PUT`, `DELETE` requests
- Compares against the `Host` header for same-origin enforcement
- Allows relaxed validation in development

### Security Headers (`src/lib/securityHeaders.ts`)

Applied to every API response:
- `X-Frame-Options: DENY` (clickjacking prevention)
- `X-Content-Type-Options: nosniff` (MIME sniffing prevention)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` blocking camera, microphone, geolocation, payment
- `Strict-Transport-Security` (production only, 1 year max-age)
- `Content-Security-Policy: default-src 'none'`

### Rate Limiting (`src/lib/rateLimiter.ts`)

In-memory, IP-based rate limiting with sliding window:
- Auth endpoints: 3-5 req/min (strictest on login and registration)
- Write endpoints: 20 req/min (subscriptions, budgets)
- General API: 100 req/min
- Auto-cleanup of expired entries every 60 seconds

## 9. Email & Notifications

### Cron-Based Bill Reminders (`src/lib/send-reminders.ts`)

Triggered via `GET /api/cron/reminders` (secured by `CRON_SECRET`):
- Queries active subscriptions approaching `nextBillingDate` within user's `reminderDaysBefore` window
- Sends reminder emails using `billReminderEmailHtml` template
- Sends overdue alerts for past-due subscriptions using `overdueAlertEmailHtml`
- Uses `sentNotification` table to prevent duplicate sends per billing cycle
- Respects user's `emailNotifications` preference
