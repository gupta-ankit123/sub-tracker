import { z } from "zod"
export const SUBSCRIPTION_CATEGORIES = [
    "OTT & Entertainment",
    "Music Streaming",
    "Cloud Storage",
    "Productivity",
    "Fitness & Health",
    "News & Media",
    "Gaming",
    "Software & Tools",
    "E-learning",
    "Food Delivery",
    "Other"
] as const;

export const UTILITY_CATEGORIES = [
    "Electricity",
    "Water",
    "Gas",
    "Internet",
    "Mobile Postpaid",
    "Society Maintenance",
    "Other"
] as const;

export const billingCycleEnum = z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "SEMI_ANNUAL", "ANNUAL", "ONE_TIME"])
export const subscriptionStatusEnum = z.enum(["ACTIVE", "PAUSED", "CANCELLED", "EXPIRED"])
export const usageFrequencyEnum = z.enum(["DAILY", "WEEKLY", "MONTHLY", "RARELY", "NEVER"])
export const billTypeEnum = z.enum(["FIXED", "VARIABLE"])
export const estimationMethodEnum = z.enum(["MANUAL", "HISTORICAL_AVG", "WEIGHTED_AVG", "SEASONAL_AVG"])
export const createSubscriptionSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(255),
    description: z.string().optional(),
    category: z.string().min(1, "Category is required").max(100),
    logoUrl: z.string().url().optional().or(z.literal("")),
    websiteUrl: z.string().url().optional().or(z.literal("")),
    amount: z.number().positive("Amount must be positive"),
    currency: z.string().length(3).default("INR"),
    billingCycle: billingCycleEnum,
    firstBillingDate: z.string().transform((str) => new Date(str)),
    autoRenew: z.boolean().default(true),
    notes: z.string().optional(),
    reminderDays: z.number().int().min(0).max(30).default(3),
    usageFrequency: usageFrequencyEnum.default("MONTHLY")
})
export const updateSubscriptionSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(255).optional(),
    description: z.string().optional().nullable(),
    category: z.string().min(1).max(100).optional(),
    logoUrl: z.string().url().optional().or(z.literal("")).optional(),
    websiteUrl: z.string().url().optional().or(z.literal("")).optional(),
    amount: z.number().positive().optional(),
    currency: z.string().length(3).optional(),
    billingCycle: billingCycleEnum.optional(),
    firstBillingDate: z.string().transform((str) => new Date(str)).optional(),
    autoRenew: z.boolean().optional(),
    status: subscriptionStatusEnum.optional(),
    notes: z.string().optional().nullable(),
    reminderDays: z.number().int().min(0).max(30).optional(),
    usageFrequency: usageFrequencyEnum.optional()
})
export const subscriptionIdSchema = z.object({
    id: z.string().min(1, "Subscription ID is required")
})

export const createUtilityBillSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(255),
    category: z.enum(UTILITY_CATEGORIES),
    description: z.string().optional(),
    billingDay: z.number().int().min(1).max(31),
    amount: z.number().positive("Amount must be positive").optional(),
    currency: z.string().length(3).default("INR"),
    notes: z.string().optional(),
})

export const recordBillSchema = z.object({
    subscriptionId: z.string().min(1, "Subscription ID is required"),
    billingMonth: z.string().regex(/^\d{4}-\d{2}-01$/, "Billing month must be YYYY-MM-01 format"),
    amount: z.number().positive("Amount must be positive"),
    unitsConsumed: z.number().positive().optional(),
    billDate: z.string().transform((str) => new Date(str)).optional(),
    dueDate: z.string().transform((str) => new Date(str)).optional(),
    notes: z.string().optional(),
})

export const createEstimateSchema = z.object({
    subscriptionId: z.string().min(1, "Subscription ID is required"),
    billingMonth: z.string().regex(/^\d{4}-\d{2}-01$/, "Billing month must be YYYY-MM-01 format"),
    estimatedAmount: z.number().positive("Estimated amount must be positive"),
    estimationMethod: estimationMethodEnum.default("MANUAL"),
    minAmount: z.number().positive().optional(),
    maxAmount: z.number().positive().optional(),
    notes: z.string().optional(),
})

export const updateEstimateWithActualSchema = z.object({
    subscriptionId: z.string().min(1, "Subscription ID is required"),
    billingMonth: z.string().regex(/^\d{4}-\d{2}-01$/, "Billing month must be YYYY-MM-01 format"),
    actualAmount: z.number().positive("Actual amount must be positive"),
})
