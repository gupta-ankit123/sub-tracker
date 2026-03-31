# Schemas Reference

All Zod schemas used for client-side validation and server-side input validation.

## Auth Schemas (`src/features/auth/schemas.ts`)

| Schema | Fields | Notes |
|--------|--------|-------|
| `loginSchema` | email, password (min 1) | Basic login |
| `registerSchema` | name, email, password (min 8) | Registration |
| `verifyOtpSchema` | email, otp (exactly 6 digits) | Email verification |
| `updateProfileSchema` | name, phone (optional) | Profile edit |
| `updateSettingsSchema` | currencyCode, timezone, emailNotifications, pushNotifications, reminderDaysBefore (1-30) | Settings |
| `changePasswordSchema` | currentPassword, newPassword (min 8), confirmPassword | Password change with confirmation |
| `forgotPasswordSchema` | email | Password reset request |
| `resetPasswordSchema` | email, otp, newPassword, confirmPassword | Password reset |

## Subscription Schemas (`src/features/subscriptions/schemas.ts`)

### Constants

**SUBSCRIPTION_CATEGORIES:** OTT, Music, Cloud Storage, Productivity, Fitness, Gaming, Education, News, Shopping, Social Media, VPN, Finance, Other

**UTILITY_CATEGORIES:** Electricity, Water, Gas, Internet, Mobile, Society Maintenance, Other

**BILLING_CYCLES:** WEEKLY, MONTHLY, QUARTERLY, SEMI_ANNUAL, ANNUAL, ONE_TIME

**STATUSES:** ACTIVE, PAUSED, CANCELLED, EXPIRED

**USAGE_FREQUENCY:** DAILY, WEEKLY, MONTHLY, RARELY, NEVER

### Schemas

| Schema | Fields | Notes |
|--------|--------|-------|
| `createSubscriptionSchema` | name, category, amount, currency, billingCycle, startDate, nextBillingDate, status, usageFrequency, notes | Full subscription creation |
| `updateSubscriptionSchema` | Same as create, all optional | Partial update |
| `subscriptionIdSchema` | id (string) | URL param validation |
| `createUtilityBillSchema` | name, category, amount, currency, billingDay, notes | Utility bill with billing day of month |
| `recordBillSchema` | amount | Record payment amount |
| `createEstimateSchema` | method (MANUAL/HISTORICAL_AVG/WEIGHTED_AVG/SEASONAL_AVG), manualAmount | Bill estimation |
| `createBillingHistorySchema` | subscriptionId, amount, billingDate, status, notes | Billing record |
| `updateBillingHistoryStatusSchema` | status (PENDING/SUCCESS/FAILED/REFUNDED) | Status update |

## Budget Schemas (`src/features/budgets/schemas.ts`)

| Schema | Fields | Notes |
|--------|--------|-------|
| `createBudgetSchema` | category, limit, month | Create budget for a month |
| `updateBudgetSchema` | limit | Update budget limit only |
| `createBudgetExpenseSchema` | description, amount, date, notes | Add expense |
| `updateBudgetExpenseSchema` | All fields optional | Partial update |
| `carryForwardSchema` | sourceMonth, targetMonth | Budget carry forward |
| `updateIncomeSchema` | monthlyIncome | Set monthly income |
