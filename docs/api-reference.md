# API Reference

All endpoints are served via Hono running inside Next.js at `/api/[[...route]]/route.ts`.

**Base URL**: `/api`
**Auth**: JWT via HTTP-only cookies. Protected routes require valid `auth_token` cookie.
**Content-Type**: `application/json` for all request/response bodies.

---

## Authentication (`/api/auth`)

### POST `/auth/register`
Create a new user account.

**Auth**: None

**Request Body**:
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Response** `200`:
```json
{
  "message": "Registration successful! Please check your email for OTP verification.",
  "user": { "id": "string", "email": "string", "name": "string" }
}
```

**Notes**: Sends OTP email via Resend. OTP valid for 5 minutes.

---

### POST `/auth/login`
Authenticate and receive JWT tokens.

**Auth**: None

**Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Response** `200`:
```json
{
  "message": "Login successful",
  "user": { "id": "string", "email": "string", "name": "string" }
}
```

**Cookies Set**: `auth_token` (24h), `refresh_token` (7d)
**Notes**: Returns 403 if email not verified. Updates `lastLoginAt`.

---

### POST `/auth/verify-otp`
Verify email with OTP code.

**Auth**: None

**Request Body**:
```json
{
  "email": "string",
  "otp": "string"
}
```

**Response** `200`:
```json
{ "message": "Email verified successfully" }
```

**Cookies Set**: `auth_token`, `refresh_token`

---

### POST `/auth/refresh`
Refresh access token using refresh token cookie.

**Auth**: Refresh token cookie

**Response** `200`:
```json
{ "success": true }
```

---

### POST `/auth/logout`
Clear authentication cookies.

**Auth**: Required

**Response** `200`:
```json
{ "message": "Logged out successfully" }
```

---

### GET `/auth/current`
Get current authenticated user.

**Auth**: Required

**Response** `200`:
```json
{
  "data": {
    "id": "string",
    "email": "string",
    "name": "string",
    "phone": "string | null",
    "currencyCode": "INR",
    "timezone": "Asia/Kolkata",
    "monthlyIncome": "number | null",
    "emailNotifications": true,
    "pushNotifications": true
  }
}
```

---

### PATCH `/auth/profile`
Update user profile.

**Auth**: Required

**Request Body**:
```json
{
  "name": "string (optional)",
  "phone": "string (optional)"
}
```

**Response** `200`:
```json
{ "data": { "...updated user object" } }
```

---

### PATCH `/auth/settings`
Update user preferences.

**Auth**: Required

**Request Body**:
```json
{
  "currencyCode": "string (optional, 3-letter ISO)",
  "timezone": "string (optional, IANA)",
  "emailNotifications": "boolean (optional)",
  "pushNotifications": "boolean (optional)",
  "reminderDaysBefore": "number (optional, 1-30)"
}
```

---

### PATCH `/auth/change-password`
Change password with current password verification.

**Auth**: Required

**Request Body**:
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

---

### DELETE `/auth/account`
Delete user account and all associated data.

**Auth**: Required

**Response** `200`:
```json
{ "message": "Account deleted successfully" }
```

---

## Subscriptions (`/api/subscriptions`)

### GET `/subscriptions/`
List all user subscriptions.

**Auth**: Required

**Response** `200`:
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string | null",
      "category": "string",
      "logoUrl": "string | null",
      "websiteUrl": "string | null",
      "amount": "decimal",
      "currency": "INR",
      "billingCycle": "MONTHLY",
      "firstBillingDate": "datetime",
      "nextBillingDate": "datetime",
      "status": "ACTIVE",
      "autoRenew": true,
      "paymentStatus": "PENDING",
      "paymentMethod": "UPI | null",
      "usageFrequency": "MONTHLY",
      "lastUsedDate": "datetime | null",
      "lastPaidDate": "datetime | null",
      "reminderDays": 3,
      "notes": "string | null"
    }
  ]
}
```

**Ordering**: `nextBillingDate` ascending

---

### POST `/subscriptions/`
Create a new subscription.

**Auth**: Required

**Request Body**:
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "category": "string (required)",
  "logoUrl": "string (optional)",
  "websiteUrl": "string (optional)",
  "amount": "number (required)",
  "currency": "string (default: INR)",
  "billingCycle": "WEEKLY | MONTHLY | QUARTERLY | SEMI_ANNUAL | ANNUAL | ONE_TIME",
  "firstBillingDate": "date (required)",
  "autoRenew": "boolean (default: true)",
  "notes": "string (optional)",
  "reminderDays": "number (0-30, default: 3)",
  "usageFrequency": "DAILY | WEEKLY | MONTHLY | RARELY | NEVER (default: MONTHLY)"
}
```

**Notes**: Auto-calculates `nextBillingDate` and `lastBillingDate` from `firstBillingDate` + `billingCycle`.

---

### GET `/subscriptions/:id`
Get a single subscription.

**Auth**: Required

---

### PATCH `/subscriptions/:id`
Update a subscription. Partial updates allowed.

**Auth**: Required

**Notes**: If `billingCycle` or `firstBillingDate` changes, `nextBillingDate` is recalculated.

---

### DELETE `/subscriptions/:id`
Delete a subscription and all related records.

**Auth**: Required

---

### POST `/subscriptions/:id/mark-paid`
Mark a subscription payment as complete.

**Auth**: Required

**Response**: Updated subscription with `paymentStatus: SUCCESS`, new `lastPaidDate`, recalculated `nextBillingDate`.

---

### POST `/subscriptions/:id/skip-payment`
Skip current payment cycle.

**Auth**: Required

**Response**: Updated subscription with `paymentStatus: SKIPPED`.

---

### POST `/subscriptions/:id/mark-used`
Record that a subscription was used today.

**Auth**: Required

**Response**: Updated subscription with `lastUsedDate: now()`.

---

### PATCH `/subscriptions/:id/usage-frequency`
Update how often a subscription is used.

**Auth**: Required

**Request Body**:
```json
{
  "usageFrequency": "DAILY | WEEKLY | MONTHLY | RARELY | NEVER"
}
```

---

## Billing History (`/api/subscriptions/billing-history`)

### GET `/subscriptions/billing-history`
Get all billing history records.

**Auth**: Required

**Response**: Array of billing records with subscription details (id, name, logoUrl).

---

### POST `/subscriptions/billing-history`
Create a billing history record.

**Auth**: Required

**Request Body**:
```json
{
  "subscriptionId": "string",
  "amount": "number",
  "currency": "string",
  "billingDate": "date"
}
```

---

### PATCH `/subscriptions/billing-history/:id`
Update payment status of a billing record.

**Auth**: Required

**Request Body**:
```json
{
  "paymentStatus": "PENDING | SUCCESS | FAILED | REFUNDED | SKIPPED | OVERDUE"
}
```

---

## Utility Bills (`/api/subscriptions/utility-bills`)

### POST `/subscriptions/utility-bills`
Create a new utility bill.

**Auth**: Required

**Request Body**:
```json
{
  "name": "string",
  "description": "string (optional)",
  "category": "Electricity | Water | Gas | Internet | Mobile Postpaid | Mobile Prepaid | Society Maintenance | Other",
  "amount": "number (optional, base amount)",
  "currency": "string (default: INR)",
  "billingDay": "number (1-28, day of month)",
  "notes": "string (optional)"
}
```

**Notes**: Creates subscription with `billType: VARIABLE`, `isVariable: true`, `billingCycle: MONTHLY`.

---

### GET `/subscriptions/utility-bills`
List all utility bills with recent records and estimates.

**Auth**: Required

**Response**: Each bill includes last 3 `billRecords` and latest `billEstimate`.

---

### POST `/subscriptions/utility-bills/record-bill`
Record an actual bill amount for a month.

**Auth**: Required

**Request Body**:
```json
{
  "subscriptionId": "string",
  "billingMonth": "date (YYYY-MM-01)",
  "amount": "number",
  "unitsConsumed": "number (optional)",
  "billDate": "date (optional)",
  "dueDate": "date (optional)"
}
```

**Notes**: Upserts — one record per subscription per month.

---

### POST `/subscriptions/utility-bills/estimate`
Create a bill estimate.

**Auth**: Required

**Request Body**:
```json
{
  "subscriptionId": "string",
  "billingMonth": "date (YYYY-MM-01)",
  "estimatedAmount": "number",
  "estimationMethod": "MANUAL | HISTORICAL_AVG | WEIGHTED_AVG | SEASONAL_AVG",
  "minAmount": "number (optional)",
  "maxAmount": "number (optional)",
  "notes": "string (optional)"
}
```

**Notes**: For HISTORICAL_AVG/WEIGHTED_AVG, server auto-calculates `confidenceScore` (0.30-0.85) and `minAmount`/`maxAmount` from historical data if not provided.

---

### GET `/subscriptions/utility-bills/:id/accuracy`
Get estimation accuracy metrics.

**Auth**: Required

**Response**:
```json
{
  "data": {
    "totalEstimates": 12,
    "accurateEstimates": 9,
    "averageVariance": 8.5,
    "accuracyPercentage": 75.0,
    "within20Percent": 10,
    "over20Percent": 2
  }
}
```

---

### GET `/subscriptions/utility-bills/:id/history`
Get all bill records for a utility bill.

**Auth**: Required

**Response**: Array of bill records ordered by `billingMonth` descending.

---

### PATCH `/subscriptions/utility-bills/records/:id/mark-paid`
Mark a specific bill record as paid.

**Auth**: Required

---

## Export (`/api/subscriptions/export`)

### GET `/subscriptions/export/csv`
Download all subscriptions as CSV.

**Auth**: Required
**Response**: `text/csv` file download

---

### GET `/subscriptions/export/pdf`
Download subscription report as PDF.

**Auth**: Required
**Response**:
```json
{
  "data": "base64-encoded PDF string",
  "filename": "subscriptions-report-YYYY-MM-DD.pdf"
}
```

---

## Budgets (`/api/budgets`)

### GET `/budgets/?month=YYYY-MM-01`
Get all budgets for a month.

**Auth**: Required

**Response**: Each budget includes `spent` (total), `manualSpent`, and `subscriptionSpent` computed fields.

---

### POST `/budgets/`
Create a budget.

**Auth**: Required

**Request Body**:
```json
{
  "month": "date (YYYY-MM-01)",
  "category": "string",
  "limit": "number"
}
```

**Notes**: Returns 409 if budget already exists for this category + month.

---

### GET `/budgets/safe-to-spend?month=YYYY-MM-01`
Calculate safe-to-spend amount.

**Auth**: Required

**Response**:
```json
{
  "data": {
    "monthlyIncome": 100000,
    "fixedBills": 25000,
    "budgetAllocations": 15000,
    "safeToSpend": 60000
  }
}
```

---

### PATCH `/budgets/income`
Set monthly income.

**Auth**: Required

**Request Body**:
```json
{ "monthlyIncome": 100000 }
```

---

### GET `/budgets/analytics?months=6`
Get spending analytics for N months.

**Auth**: Required

---

### POST `/budgets/carry-forward`
Copy budgets from one month to another.

**Auth**: Required

**Request Body**:
```json
{
  "sourceMonth": "date (YYYY-MM-01)",
  "targetMonth": "date (YYYY-MM-01)"
}
```

**Response**:
```json
{ "data": { "copied": 4, "skipped": 1 } }
```

---

### POST `/budgets/expenses`
Add manual expense to a budget.

**Auth**: Required

**Request Body**:
```json
{
  "budgetId": "string",
  "description": "string",
  "amount": "number",
  "date": "date",
  "notes": "string (optional)"
}
```

---

### PATCH `/budgets/expenses/:id`
Update an expense.

**Auth**: Required

---

### DELETE `/budgets/expenses/:id`
Delete an expense.

**Auth**: Required

---

### GET `/budgets/:id/expenses`
List all expenses for a budget (manual + virtual subscription expenses).

**Auth**: Required

---

### PATCH `/budgets/:id`
Update budget limit.

**Auth**: Required

**Request Body**:
```json
{ "limit": 50000 }
```

---

### DELETE `/budgets/:id`
Delete a budget and its expenses.

**Auth**: Required

---

## Cron (`/api/cron`)

### GET `/api/cron/reminders`
Trigger email reminders for all users.

**Auth**: Bearer token

**Header**: `Authorization: Bearer <CRON_SECRET>`

**Notes**: Sends bill reminders and overdue alerts. Deduplicates per billing month. Designed to be called by external scheduler (Vercel Cron, etc.).
