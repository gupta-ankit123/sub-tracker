import { z } from "zod"
import { SUBSCRIPTION_CATEGORIES, UTILITY_CATEGORIES } from "@/features/subscriptions/schemas"

export const BUDGET_CATEGORIES = [
    ...SUBSCRIPTION_CATEGORIES,
    ...UTILITY_CATEGORIES.filter(c => c !== "Other"),
    "Groceries",
    "Transportation",
    "Dining Out",
    "Shopping",
    "Rent/EMI",
    "Healthcare",
    "Investments/SIP",
    "Insurance",
    "Travel",
    "Personal Care",
] as const

export const createBudgetSchema = z.object({
    category: z.string().min(1, "Category is required").max(100),
    limit: z.number().positive("Limit must be positive"),
    month: z.string().regex(/^\d{4}-\d{2}-01$/, "Month must be YYYY-MM-01 format"),
})

export const updateBudgetSchema = z.object({
    limit: z.number().positive("Limit must be positive"),
})

export const createBudgetExpenseSchema = z.object({
    budgetId: z.string().min(1, "Budget ID is required"),
    description: z.string().trim().min(1, "Description is required").max(255),
    amount: z.number().positive("Amount must be positive"),
    date: z.string().transform((str) => new Date(str)),
    notes: z.string().optional(),
})

export const updateBudgetExpenseSchema = z.object({
    description: z.string().trim().min(1).max(255).optional(),
    amount: z.number().positive().optional(),
    date: z.string().transform((str) => new Date(str)).optional(),
    notes: z.string().optional().nullable(),
})

export const carryForwardSchema = z.object({
    sourceMonth: z.string().regex(/^\d{4}-\d{2}-01$/, "Must be YYYY-MM-01 format"),
    targetMonth: z.string().regex(/^\d{4}-\d{2}-01$/, "Must be YYYY-MM-01 format"),
})

export const updateIncomeSchema = z.object({
    monthlyIncome: z.number().positive("Income must be positive"),
})
