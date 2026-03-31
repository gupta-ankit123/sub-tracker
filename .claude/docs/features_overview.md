# Features Overview

Current state of all implemented features in SubTracker.

## 1. Authentication & User Management

**Pages:** `/sign-in`, `/sign-up`, `/verify-otp`, `/forgot-password`, `/reset-password`
**Components:** `src/features/auth/components/`

- Email/password registration with OTP email verification
- Login with JWT tokens (access: 24h, refresh: 7d)
- Forgot password flow (OTP-based reset via email)
- User profile editing (name, phone)
- Settings management (currency, timezone, email/push notifications, reminder days)
- Change password (authenticated)
- Account deletion
- Glassmorphic auth layout with ambient visual effects

## 2. Subscription Management

**Page:** `/subscriptions`
**Components:** `src/features/subscriptions/components/`

- CRUD for recurring subscriptions (create, read, update, delete)
- Categories: OTT, Music, Cloud Storage, Productivity, Fitness, Gaming, Education, News, Shopping, Social Media, VPN, Finance, Other
- Billing cycles: Weekly, Monthly, Quarterly, Semi-Annual, Annual, One-Time
- Status tracking: Active, Paused, Cancelled, Expired
- Usage frequency tracking: Daily, Weekly, Monthly, Rarely, Never
- Mark as paid (advances next billing date automatically)
- Skip payment cycle
- Popular subscriptions list for quick selection (`src/features/subscriptions/data/`)
- Export to CSV/PDF

## 3. Utility Bills

**Page:** `/utility-bills`
**Components:** `utility-bill-form-dialog.tsx`, `utility-bill-card.tsx`

- Track variable recurring bills (electricity, water, gas, internet, mobile, society maintenance)
- Monthly billing day configuration
- Record actual payment amounts per month
- Estimate methods: Manual, Historical Average, Weighted Average, Seasonal Average

## 4. Dashboard / Overview

**Page:** `/dashboard`
**Component:** `src/features/subscriptions/components/dashboard-content.tsx`

- Monthly spending summary with charts
- Recent bills overview
- Unused subscription alerts (subscriptions marked as "Rarely" or "Never" used)
- Quick actions for common tasks

## 5. Smart Budgeting

**Page:** `/budgets`
**Components:** `src/features/budgets/components/`

- Create budget categories with monthly limits
- Auto-calculated subscription spend per category
- Manual expense tracking within each budget
- Budget analytics with visual charts
- Safe-to-spend calculator (income minus committed expenses)
- Monthly income setting
- Carry forward unused budget to next month
- Progress bars showing spend vs limit

## 6. Bill Calendar (New)

**Page:** `/bill-calendar`
**Component:** `src/app/(dashboard)/bill-calendar/page.tsx`

- Full month calendar grid showing all upcoming bills
- Color-coded status: Paid (green), Upcoming (blue), Overdue (red)
- Billing date projection across all cycle types (weekly through annual)
- Month navigation (previous/next)
- Monthly summary cards (total due, paid, upcoming, overdue amounts)
- Day selection with detailed bill list
- Heavy spending day indicators (3+ bills on same day)
- Weekly breakdown section
- Mark as paid directly from calendar view

## 7. Upcoming Bills

**Page:** `/upcoming`
**Component:** Inline in page

- Bills grouped by week/month
- Shows upcoming payment amounts and dates

## 8. Billing History

**Page:** `/billing-history`
**Component:** Inline in page

- Historical payment records
- Filtering capabilities
- Status tracking: Pending, Success, Failed, Refunded

## 9. Settings

**Page:** `/settings`
**Component:** `src/features/auth/components/settings-content.tsx`

- Profile management (name, phone)
- Currency selection
- Timezone configuration
- Email notification toggle
- Push notification toggle
- Reminder days configuration (1-30 days before due date)
- Password change
- Account deletion

## 10. Email Notifications (Background)

**Source:** `src/lib/send-reminders.ts`, `src/app/api/cron/reminders/`

- Automated bill reminder emails (configurable days before due date)
- Overdue payment alert emails
- Duplicate prevention via `sentNotification` table
- Respects per-user notification preferences
- Templates in `src/lib/email-templates.ts`

## 11. Landing Page

**Page:** `/` (marketing route)
**Components:** `src/components/landing/`

- Hero section with CTA
- Features grid showcasing app capabilities
- How it works section
- Stats section
- Pricing section
- Testimonials
- FAQ section
- CTA banner
- Landing navbar and footer

## Navigation Structure

Dashboard sidebar (`src/components/navigation.tsx`) links:

1. **Overview** -> `/dashboard`
2. **My Expenses & Budgets** -> `/budgets`
3. **All Subscriptions** -> `/subscriptions`
4. **Utility Bills** -> `/utility-bills`
5. **Bill Calendar** -> `/bill-calendar`
6. **Settings** -> `/settings`
