# Features

Detailed documentation of every feature in SubTracker.

---

## 1. Authentication

### Sign Up
- Email + password registration
- Password hashed with bcrypt (10 rounds)
- OTP generated (6 digits, 5-minute expiry)
- Verification email sent via Resend
- User must verify OTP before first login

### Sign In
- Email + password verification
- Checks `emailVerified` flag before allowing login
- Issues two JWT tokens:
  - **Access token**: 24-hour expiry, stored in `auth_token` HTTP-only cookie
  - **Refresh token**: 7-day expiry, stored in `refresh_token` HTTP-only cookie
- Updates `lastLoginAt` timestamp

### OTP Verification
- 6-digit numeric code
- 5-minute expiry window
- Delivered via Resend email API
- On success: sets `emailVerified = true`, issues JWT cookies

### Session Management
- `sessionMiddleware` on all protected Hono routes
- Reads `auth_token` cookie → verifies JWT → injects `user` into Hono context
- All database queries filter by `userId` from session

### Profile & Settings
- **Profile**: Update name, phone number (uniqueness validated)
- **Password**: Change with current password verification
- **Regional**: Currency code (3-letter ISO), timezone (IANA)
- **Notifications**: Email/push toggles, default reminder days (1-30)
- **Account Deletion**: Cascade deletes all user data with confirmation dialog

---

## 2. Subscription Management

### CRUD Operations
- **Create**: 20+ fields including name, category, amount, billing cycle, dates, payment method, usage frequency, reminder days
- **Read**: All subscriptions ordered by `nextBillingDate` ascending
- **Update**: All fields editable. Changing `billingCycle` or `firstBillingDate` triggers `nextBillingDate` recalculation
- **Delete**: Cascade deletes all billing history, bill records, estimates, and notification preferences

### Billing Cycle Support
| Cycle | Next Date Calculation |
|---|---|
| WEEKLY | +7 days |
| MONTHLY | +1 month |
| QUARTERLY | +3 months |
| SEMI_ANNUAL | +6 months |
| ANNUAL | +1 year |
| ONE_TIME | No recurrence |

### Payment Tracking
- **Mark as Paid**: Sets `paymentStatus = SUCCESS`, `lastPaidDate = now()`, recalculates `nextBillingDate`
- **Skip Payment**: Sets `paymentStatus = SKIPPED`
- **Payment Methods**: UPI, Card, Net Banking, Wallet, Cash, Bank Transfer, Other

### Usage Tracking
- Track how often you use each subscription: DAILY, WEEKLY, MONTHLY, RARELY, NEVER
- `lastUsedDate` updated when user clicks "Mark as Used"
- Feeds into unused subscription detection

### Unused Subscription Detection
Smart heuristics based on usage frequency and time since last use:

| Usage Frequency | Threshold (days since last use) |
|---|---|
| DAILY | 7 days |
| WEEKLY | 14 days |
| MONTHLY | 45 days |
| RARELY | 60 days |
| NEVER | Always flagged |

- New subscriptions get a 30-day grace period
- Calculates total potential monthly savings from unused services
- Displayed on dashboard with "Mark as Used" action

### Popular Templates
- **50+ pre-filled Indian services** across 11 categories
- Categories: OTT & Entertainment, Music Streaming, Cloud Storage, Productivity, Fitness & Health, News & Media, Gaming, Software & Tools, E-learning, Food Delivery
- Each template includes: name, default amount (INR), billing cycle, logo URL (simpleicons.org), website URL, category

---

## 3. Dashboard

### Stat Cards
All computed from real database data:
- **Monthly Spending**: Sum of all active subscriptions normalized to monthly cost
- **Annual Projection**: Monthly spending × 12
- **Daily Cost**: Monthly spending ÷ 30
- **Active/Inactive Counts**: Grouped by subscription status

### Category Donut Chart
- Custom SVG pie chart (no external charting library)
- Segments colored by category
- Shows category name, subscription count, and total amount
- Total displayed in center

### Upcoming Bills Table
- Active subscriptions sorted by `nextBillingDate`
- Shows: logo, name, amount, due date, payment status badge
- Status color coding: green (paid), yellow (pending), red (overdue)

### Unused Subscriptions Alert
- Lists subscriptions flagged by unused detection algorithm
- Shows service name, last used date, monthly cost
- "Mark as Used" action button
- Total potential savings displayed

---

## 4. Analytics

### Spending Trend
- 6-month bar chart showing monthly totals
- Gradient-colored bars with amount labels

### Category Breakdown
- SVG donut chart with legend
- Sorted by total amount descending
- Percentage of total spend per category

### Top 5 Expensive
- Horizontal bar chart
- Sorted by monthly normalized cost
- Shows subscription name, category, and amount

### Billing Cycle Breakdown
- Count and percentage per cycle type
- Visual progress bars

### Budget Performance
- Integrated from budget system
- Shows spent vs limit per category
- Color coding: green (under budget), amber (>90%), red (exceeded)

---

## 5. Billing History

### Filterable Table
- **Status filters**: All, Paid, Pending, Overdue, Skipped
- **Search**: By subscription name or category
- **Columns**: Service (logo + name), category, billing date, amount, payment status, actions

### Summary Stats
- Total paid this month
- Total pending
- Total overdue
- All computed from billing history records

### Quick Actions
- Mark as Paid (inline button for pending/overdue)
- Skip Payment (inline button)
- Updates reflected immediately via React Query cache invalidation

---

## 6. Upcoming Bills

### Automatic Grouping
Bills grouped by urgency:
1. **Overdue** (red) — `nextBillingDate` in the past, not paid/skipped
2. **This Week** (orange) — Due within 7 days
3. **This Month** (blue) — Due within current month
4. **Next 30 Days** (teal) — Due within 30 days

### Summary Cards
- Each group shows: total amount and count
- Color-coded to match group theme

### Bill Details
- Logo with fallback initials
- Name, category, billing cycle
- Due date with relative time ("Due today", "Due in 3 days", "Was due 5 days ago")
- Auto-renew status indicator
- Mark as Paid / Remind Me actions

---

## 7. Utility Bills

### Categories
Electricity, Water, Gas, Internet, Mobile Postpaid, Mobile Prepaid, Society Maintenance, Other

### Bill Recording
- Log actual monthly bill amount
- Optional: units consumed (kWh, liters, etc.)
- Optional: bill date, due date
- Upsert per subscription + billing month (one record per month)

### Bill Estimation Engine
Three estimation methods with confidence scoring:

| Method | How It Works | Confidence |
|---|---|---|
| MANUAL | User enters estimate directly | N/A |
| HISTORICAL_AVG | Average of last 6 bills | 30-85% based on data depth |
| WEIGHTED_AVG | Recent bills weighted more heavily | 30-85% |

Confidence scoring:
- 6+ historical records: 85%
- 3-5 records: 60%
- 1-2 records: 30%

### Variance & Accuracy Tracking
- When actual amount recorded, calculates variance vs estimate
- Alerts user if actual is >20% higher than estimate
- Celebrates if actual is >20% lower
- Accuracy dashboard shows:
  - Total estimates made
  - % of estimates within 10% of actual
  - % within 20%
  - Average variance

### Trend Indicators
- Compares current bill to previous month
- Shows: "↑ 15% higher" or "↓ 8% lower" with color coding

---

## 8. Budget System

### Budget Management
- Create budgets per category per month
- Set spending limits
- One budget per category per month (enforced by unique constraint)
- Edit limits anytime
- Delete budgets

### Expense Tracking
Two types of expenses counted:
1. **Manual expenses**: User-entered with description, amount, date, notes
2. **Subscription costs**: Active subscriptions in matching category auto-included

Subscription expenses shown as read-only virtual entries to prevent double-counting.

### Safe-to-Spend Calculator
```
Safe to Spend = Monthly Income - Fixed Bills - Budget Allocations

Where:
  Fixed Bills = Sum of all active subscription monthly costs
  Budget Allocations = Sum of (budget limit - subscription cost in that category)
                       Only the "extra room" beyond subscriptions
```

Displayed as SVG circular progress with:
- Percentage remaining
- Color coding: green (>20%), amber (10-20%), red (<10%)
- Stats grid: Total Budget, Spent So Far, Days Left, Daily Limit

### Carry Forward
- Copy all budgets from one month to another
- Skips categories that already have a budget in the target month
- Returns count of copied and skipped

### Budget Analytics
- 6-month historical view
- Per-month breakdown: total limit, total spent, savings
- Per-category breakdown within each month

---

## 9. Export

### CSV Export
- Exports all user subscriptions
- Fields: Name, Amount, Currency, Billing Cycle, Category, Status, Payment Status, Next Billing Date, Last Paid Date, Auto Renew
- Downloads as `subscriptions-YYYY-MM-DD.csv`

### PDF Export
- Generated server-side using jsPDF
- Multi-page report containing:
  - **Spending Overview**: Monthly, annual, daily costs
  - **Subscription Counts**: Total, active, inactive
  - **Top Category**: Highest spending category
  - **Category Breakdown**: Bar chart with amounts
  - **Active Subscriptions Table**: Top 15 by amount
- Downloads as `subscriptions-report-YYYY-MM-DD.pdf`
- Returned as base64-encoded data for client-side download

---

## 10. Email Notifications

### Reminder System
- **Bill Reminders**: Sent N days before `nextBillingDate` (configurable per subscription, default: 3 days)
- **Overdue Alerts**: Sent when `nextBillingDate` has passed and `paymentStatus` is not SUCCESS or SKIPPED
- Only sent for ACTIVE subscriptions with `emailNotifications` enabled

### Deduplication
- `SentNotification` table tracks all sent emails
- Checks: same userId + subscriptionId + type + billing month
- Prevents sending duplicate reminders within same billing cycle

### Email Templates
- HTML-formatted emails via Resend API
- Two templates: bill reminder and overdue alert
- Include subscription name, amount, due date, and action link

### Cron Endpoint
- `GET /api/cron/reminders`
- Protected by Bearer token (CRON_SECRET environment variable)
- Designed to be called by external scheduler (Vercel Cron, etc.)

### Notification Preferences
- **Global**: Email notifications on/off, push notifications on/off
- **Per-subscription**: Custom reminder days, channel preferences (email/push/SMS)
- Stored in `NotificationPreference` table with unique constraint on userId + subscriptionId
