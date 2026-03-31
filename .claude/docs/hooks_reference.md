# Hooks Reference

All custom React Query hooks organized by feature.

## Auth Hooks (`src/features/auth/api/`)

| Hook | Type | Query Key | Description |
|------|------|-----------|-------------|
| `useCurrent` | Query | `["current"]` | Get current authenticated user |
| `useLogin` | Mutation | - | Login with email/password |
| `useRegister` | Mutation | - | Register new user |
| `useVerifyOtp` | Mutation | - | Verify email OTP |
| `useForgotPassword` | Mutation | - | Request password reset |
| `useResetPassword` | Mutation | - | Reset password with OTP |
| `useLogout` | Mutation | - | Logout and clear session |
| `useUpdateProfile` | Mutation | - | Update name/phone |
| `useUpdateSettings` | Mutation | - | Update user preferences |
| `useChangePassword` | Mutation | - | Change password |
| `useDeleteAccount` | Mutation | - | Delete user account |

## Subscription Hooks (`src/features/subscriptions/api/`)

| Hook | Type | Query Key | Description |
|------|------|-----------|-------------|
| `useSubscriptions` | Query | `["subscriptions"]` | List all subscriptions |
| `useCreateSubscription` | Mutation | - | Create subscription |
| `useUpdateSubscription` | Mutation | - | Update subscription |
| `useDeleteSubscription` | Mutation | - | Delete subscription |
| `useMarkAsPaid` | Mutation | - | Mark bill as paid |
| `useSkipPayment` | Mutation | - | Skip payment cycle |
| `useMarkAsUsed` | Mutation | - | Update usage frequency |
| `useUpdatePaymentStatus` | Mutation | - | Update payment status |
| `useUpdateUsageFrequency` | Mutation | - | Update usage tracking |
| `useUtilityBills` | Query | `["utility-bills"]` | List utility bills |
| `useCreateUtilityBill` | Mutation | - | Create utility bill |
| `useBillingHistory` | Query | `["billing-history"]` | Get billing history |
| `useCreateBillingRecord` | Mutation | - | Record a payment |
| `useExport` | Mutation | - | Export data (CSV/PDF) |

## Budget Hooks (`src/features/budgets/api/`)

| Hook | Type | Query Key | Description |
|------|------|-----------|-------------|
| `useBudgets` | Query | `["budgets"]` | Get budgets for month |
| `useCreateBudget` | Mutation | - | Create budget category |
| `useUpdateBudget` | Mutation | - | Update budget limit |
| `useDeleteBudget` | Mutation | - | Delete budget |
| `useCreateExpense` | Mutation | - | Add expense |
| `useUpdateExpense` | Mutation | - | Update expense |
| `useDeleteExpense` | Mutation | - | Delete expense |
| `useBudgetAnalytics` | Query | `["budget-analytics"]` | Budget analytics data |
| `useSafeToSpend` | Query | `["safe-to-spend"]` | Safe to spend calculation |
| `useCarryForward` | Mutation | - | Carry forward unused budget |
| `useUpdateIncome` | Mutation | - | Update monthly income |

## Conventions

- All mutations invalidate relevant query keys on success
- All mutations show `toast.success`/`toast.error` feedback
- Query hooks throw on non-ok responses
- Types are inferred via Hono's `InferRequestType`/`InferResponseType`
