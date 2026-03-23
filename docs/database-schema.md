# Database Schema

PostgreSQL database managed via Prisma ORM. 9 models, 7 enums.

## Entity Relationship Diagram

```
User
 ├── has many → Subscription
 │                ├── has many → BillingHistory
 │                ├── has many → BillRecord
 │                ├── has many → BillEstimate
 │                ├── has many → NotificationPreference
 │                └── has many → SentNotification
 ├── has many → Budget
 │                └── has many → BudgetExpense
 ├── has many → NotificationPreference
 └── has many → SentNotification
```

All relations use `onDelete: Cascade` — deleting a user removes everything.

---

## Models

### User
Authentication, profile, and preferences.

| Field | Type | Default | Notes |
|---|---|---|---|
| id | String (cuid) | auto | Primary key |
| email | String | — | Unique |
| name | String | — | |
| password | String | — | bcrypt hashed |
| phone | String? | null | Unique |
| currencyCode | VarChar(3) | "INR" | ISO currency code |
| timezone | String | "Asia/Kolkata" | IANA timezone |
| lastLoginAt | DateTime? | null | Updated on login |
| createdAt | DateTime | now() | |
| updatedAt | DateTime | auto | |
| monthlyIncome | Decimal(12,2)? | null | For safe-to-spend calc |
| emailNotifications | Boolean | true | |
| pushNotifications | Boolean | true | |
| emailVerified | Boolean | false | Must verify before login |
| otpCode | String? | null | 6-digit verification code |
| otpExpiry | DateTime? | null | 5-minute window |

**Table**: `users`

---

### Subscription
Core subscription and utility bill data.

| Field | Type | Default | Notes |
|---|---|---|---|
| id | String (cuid) | auto | Primary key |
| userId | String | — | FK → User |
| name | VarChar(255) | — | |
| description | Text? | null | |
| category | VarChar(100) | — | |
| logoUrl | Text? | null | |
| websiteUrl | Text? | null | |
| amount | Decimal(10,2) | — | |
| currency | VarChar(3) | "INR" | |
| billingCycle | BillingCycle | — | WEEKLY, MONTHLY, etc. |
| firstBillingDate | DateTime | — | |
| lastBillingDate | DateTime | — | Calculated |
| nextBillingDate | DateTime | — | Calculated |
| status | SubscriptionStatus | ACTIVE | |
| autoRenew | Boolean | true | |
| lastPaidDate | DateTime? | null | |
| paymentStatus | PaymentStatus | PENDING | |
| paymentMethod | PaymentMethod? | null | |
| lastUsedDate | DateTime? | null | For unused detection |
| usageFrequency | UsageFrequency | MONTHLY | |
| billType | BillType | FIXED | FIXED or VARIABLE |
| isVariable | Boolean | false | True for utility bills |
| billingDay | Int? | null | Day of month (1-28) for utility bills |
| notes | Text? | null | |
| reminderDays | Int | 3 | 0-30, days before billing |
| createdAt | DateTime | now() | |
| updatedAt | DateTime | auto | |

**Table**: `subscriptions`
**Indexes**: `userId`, `userId + status`, `nextBillingDate`, `paymentStatus + nextBillingDate`

---

### BillingHistory
Payment records for subscriptions.

| Field | Type | Default | Notes |
|---|---|---|---|
| id | String (cuid) | auto | Primary key |
| subscriptionId | String | — | FK → Subscription |
| amount | Decimal(10,2) | — | |
| currency | VarChar(3) | — | |
| billingDate | DateTime | — | |
| paymentStatus | PaymentStatus | PENDING | |
| paymentMethod | PaymentMethod? | null | |
| transactionId | VarChar(255)? | null | Not currently populated |
| notes | Text? | null | |
| createdAt | DateTime | now() | |

**Table**: `billing_history`
**Indexes**: `billingDate`, `subscriptionId`

---

### BillRecord
Monthly utility bill records with actual amounts.

| Field | Type | Default | Notes |
|---|---|---|---|
| id | String (cuid) | auto | Primary key |
| subscriptionId | String | — | FK → Subscription |
| billingMonth | DateTime | — | First day of month |
| amount | Decimal(10,2) | — | Actual bill amount |
| unitsConsumed | Decimal(10,2)? | null | kWh, liters, etc. |
| billDate | DateTime | — | |
| dueDate | DateTime? | null | |
| paidDate | DateTime? | null | |
| billImageUrl | Text? | null | |
| billPdfUrl | Text? | null | |
| paymentStatus | PaymentStatus | PENDING | |
| notes | Text? | null | |
| createdAt | DateTime | now() | |
| updatedAt | DateTime | auto | |

**Table**: `bill_history`
**Unique**: `subscriptionId + billingMonth`
**Indexes**: `subscriptionId`, `billingMonth`

---

### BillEstimate
Utility bill forecasts with confidence scoring.

| Field | Type | Default | Notes |
|---|---|---|---|
| id | String (cuid) | auto | Primary key |
| subscriptionId | String | — | FK → Subscription |
| billingMonth | DateTime | — | First day of month |
| estimatedAmount | Decimal(10,2) | — | |
| estimationMethod | EstimationMethod | — | MANUAL, HISTORICAL_AVG, etc. |
| confidenceScore | Decimal(3,2)? | null | 0.00 to 1.00 |
| minAmount | Decimal(10,2)? | null | Lower bound |
| maxAmount | Decimal(10,2)? | null | Upper bound |
| actualAmount | Decimal(10,2)? | null | Filled when actual recorded |
| variance | Decimal(10,2)? | null | actual - estimated |
| variancePercentage | Decimal(5,2)? | null | Percentage difference |
| notes | Text? | null | |
| estimatedAt | DateTime | now() | |
| actualRecordedAt | DateTime? | null | |
| createdAt | DateTime | now() | |
| updatedAt | DateTime | auto | |

**Table**: `bill_estimates`
**Unique**: `subscriptionId + billingMonth`
**Indexes**: `subscriptionId`, `billingMonth`

---

### NotificationPreference
Per-subscription notification settings.

| Field | Type | Default | Notes |
|---|---|---|---|
| id | String (cuid) | auto | Primary key |
| userId | String | — | FK → User |
| subscriptionId | String? | null | FK → Subscription (null = global) |
| reminderDaysBefore | Int | 3 | |
| enabled | Boolean | true | |
| sendEmail | Boolean | true | |
| sendPush | Boolean | true | |
| sendSms | Boolean | false | Not implemented |
| createdAt | DateTime | now() | |
| updatedAt | DateTime | auto | |

**Table**: `notification_preferences`
**Unique**: `userId + subscriptionId`

---

### SentNotification
Audit trail for sent notifications (prevents duplicates).

| Field | Type | Default | Notes |
|---|---|---|---|
| id | String (cuid) | auto | Primary key |
| userId | String | — | FK → User |
| subscriptionId | String | — | FK → Subscription |
| type | VarChar(50) | — | BILL_REMINDER, OVERDUE_ALERT |
| channel | VarChar(20) | — | EMAIL |
| sentAt | DateTime | now() | |
| metadata | Text? | null | JSON string |

**Table**: `sent_notifications`
**Indexes**: `userId + subscriptionId + type + sentAt`, `sentAt`

---

### Budget
Monthly category spending limits.

| Field | Type | Default | Notes |
|---|---|---|---|
| id | String (cuid) | auto | Primary key |
| userId | String | — | FK → User |
| category | VarChar(100) | — | |
| limit | Decimal(12,2) | — | Monthly spending limit |
| month | DateTime | — | First day of month |
| createdAt | DateTime | now() | |
| updatedAt | DateTime | auto | |

**Table**: `budgets`
**Unique**: `userId + category + month`
**Indexes**: `userId + month`

---

### BudgetExpense
Manual expense entries within budgets.

| Field | Type | Default | Notes |
|---|---|---|---|
| id | String (cuid) | auto | Primary key |
| budgetId | String | — | FK → Budget |
| description | VarChar(255) | — | |
| amount | Decimal(12,2) | — | |
| date | DateTime | — | |
| notes | Text? | null | |
| createdAt | DateTime | now() | |
| updatedAt | DateTime | auto | |

**Table**: `budget_expenses`
**Indexes**: `budgetId`, `budgetId + date`

---

## Enums

### SubscriptionStatus
```
ACTIVE | PAUSED | CANCELLED | EXPIRED
```

### BillingCycle
```
WEEKLY | MONTHLY | QUARTERLY | SEMI_ANNUAL | ANNUAL | ONE_TIME
```

### PaymentStatus
```
PENDING | SUCCESS | FAILED | REFUNDED | SKIPPED | OVERDUE
```

### PaymentMethod
```
UPI | CARD | NET_BANKING | WALLET | CASH | BANK_TRANSFER | OTHER
```

### UsageFrequency
```
DAILY | WEEKLY | MONTHLY | RARELY | NEVER
```

### BillType
```
FIXED | VARIABLE
```

### EstimationMethod
```
MANUAL | HISTORICAL_AVG | WEIGHTED_AVG | SEASONAL_AVG
```
