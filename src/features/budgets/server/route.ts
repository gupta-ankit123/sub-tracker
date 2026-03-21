import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { sessionMiddleware } from "@/lib/sessionMiddleware"
import {
    createBudgetSchema,
    updateBudgetSchema,
    createBudgetExpenseSchema,
    updateBudgetExpenseSchema,
    carryForwardSchema,
    updateIncomeSchema,
} from "../schemas"

function calculateMonthlyAmount(amount: number, billingCycle: string): number {
    switch (billingCycle) {
        case "WEEKLY": return amount * 4.33
        case "MONTHLY": return amount
        case "QUARTERLY": return amount / 3
        case "SEMI_ANNUAL": return amount / 6
        case "ANNUAL": return amount / 12
        case "ONE_TIME": return 0
        default: return amount
    }
}

const idParam = z.object({ id: z.string().min(1) })

const app = new Hono()
    // GET /budgets?month=2026-03-01
    .get("/", sessionMiddleware, async (c) => {
        const user = c.get("user")
        const monthParam = c.req.query("month")
        const month = monthParam ? new Date(monthParam) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)

        const budgets = await prisma.budget.findMany({
            where: { userId: user.id, month },
            include: {
                expenses: {
                    select: { amount: true },
                },
            },
            orderBy: { category: "asc" },
        })

        // Get active subscriptions to auto-include their monthly cost in matching budget categories
        const subscriptions = await prisma.subscription.findMany({
            where: { userId: user.id, status: "ACTIVE" },
            select: { category: true, amount: true, billingCycle: true },
        })

        // Build a map: category -> total monthly subscription cost
        const subscriptionSpendByCategory: Record<string, number> = {}
        for (const sub of subscriptions) {
            const monthly = calculateMonthlyAmount(Number(sub.amount), sub.billingCycle)
            subscriptionSpendByCategory[sub.category] = (subscriptionSpendByCategory[sub.category] || 0) + monthly
        }

        const data = budgets.map((b) => {
            const manualSpent = b.expenses.reduce((sum, e) => sum + Number(e.amount), 0)
            const subscriptionSpent = subscriptionSpendByCategory[b.category] || 0
            const { expenses, ...budget } = b
            return { ...budget, spent: Math.round((manualSpent + subscriptionSpent) * 100) / 100, manualSpent, subscriptionSpent: Math.round(subscriptionSpent * 100) / 100 }
        })

        return c.json({ data })
    })
    // POST /budgets
    .post("/", sessionMiddleware, zValidator("json", createBudgetSchema), async (c) => {
        const user = c.get("user")
        const data = c.req.valid("json")
        const month = new Date(data.month)

        const existing = await prisma.budget.findUnique({
            where: { userId_category_month: { userId: user.id, category: data.category, month } },
        })
        if (existing) {
            return c.json({ error: "Budget already exists for this category and month" }, 409)
        }

        const budget = await prisma.budget.create({
            data: { userId: user.id, category: data.category, limit: data.limit, month },
        })
        return c.json({ data: budget }, 201)
    })
    // --- Static paths BEFORE /:id param routes ---
    // GET /budgets/safe-to-spend?month=2026-03-01
    .get("/safe-to-spend", sessionMiddleware, async (c) => {
        const user = c.get("user")
        const monthParam = c.req.query("month")
        const now = new Date()
        const month = monthParam ? new Date(monthParam) : new Date(now.getFullYear(), now.getMonth(), 1)

        const userData = await prisma.user.findUnique({
            where: { id: user.id },
            select: { monthlyIncome: true },
        })

        const monthlyIncome = userData?.monthlyIncome ? Number(userData.monthlyIncome) : 0

        const subscriptions = await prisma.subscription.findMany({
            where: { userId: user.id, status: "ACTIVE" },
            select: { category: true, amount: true, billingCycle: true },
        })

        // Fixed bills = ALL subscriptions (matches the subscriptions page total)
        const fixedBills = subscriptions.reduce(
            (sum, s) => sum + calculateMonthlyAmount(Number(s.amount), s.billingCycle), 0
        )

        // Subscription cost per category
        const subCostByCategory: Record<string, number> = {}
        for (const sub of subscriptions) {
            const monthly = calculateMonthlyAmount(Number(sub.amount), sub.billingCycle)
            subCostByCategory[sub.category] = (subCostByCategory[sub.category] || 0) + monthly
        }

        const budgets = await prisma.budget.findMany({
            where: { userId: user.id, month },
            select: { category: true, limit: true },
        })

        // Budget allocations = only the EXTRA room beyond subscriptions already in that category
        // e.g. OTT budget ₹1000, OTT subscriptions ₹199 → extra allocation = ₹801
        // This avoids double-counting: subscriptions counted in fixedBills, extra room in budgetAllocations
        const budgetAllocations = budgets.reduce((sum, b) => {
            const subCost = subCostByCategory[b.category] || 0
            const extra = Math.max(0, Number(b.limit) - subCost)
            return sum + extra
        }, 0)

        const safeToSpend = monthlyIncome - fixedBills - budgetAllocations

        return c.json({
            data: {
                monthlyIncome,
                fixedBills: Math.round(fixedBills * 100) / 100,
                budgetAllocations: Math.round(budgetAllocations * 100) / 100,
                safeToSpend: Math.round(safeToSpend * 100) / 100,
            },
        })
    })
    // PATCH /budgets/income
    .patch("/income", sessionMiddleware, zValidator("json", updateIncomeSchema), async (c) => {
        const user = c.get("user")
        const { monthlyIncome } = c.req.valid("json")

        await prisma.user.update({
            where: { id: user.id },
            data: { monthlyIncome },
        })
        return c.json({ data: { monthlyIncome } })
    })
    // GET /budgets/analytics?months=6
    .get("/analytics", sessionMiddleware, async (c) => {
        const user = c.get("user")
        const monthsParam = c.req.query("months")
        const monthCount = monthsParam ? parseInt(monthsParam) : 6

        const now = new Date()
        const months: Date[] = []
        for (let i = monthCount - 1; i >= 0; i--) {
            months.push(new Date(now.getFullYear(), now.getMonth() - i, 1))
        }

        const budgets = await prisma.budget.findMany({
            where: {
                userId: user.id,
                month: { in: months },
            },
            include: {
                expenses: { select: { amount: true } },
            },
        })

        // Include subscription costs in analytics too
        const subscriptions = await prisma.subscription.findMany({
            where: { userId: user.id, status: "ACTIVE" },
            select: { category: true, amount: true, billingCycle: true },
        })
        const subscriptionSpendByCategory: Record<string, number> = {}
        for (const sub of subscriptions) {
            const monthly = calculateMonthlyAmount(Number(sub.amount), sub.billingCycle)
            subscriptionSpendByCategory[sub.category] = (subscriptionSpendByCategory[sub.category] || 0) + monthly
        }

        const data = months.map((month) => {
            const monthBudgets = budgets.filter(
                (b) => new Date(b.month).getTime() === month.getTime()
            )
            const categories = monthBudgets.map((b) => {
                const manualSpent = b.expenses.reduce((sum, e) => sum + Number(e.amount), 0)
                const subSpent = subscriptionSpendByCategory[b.category] || 0
                const spent = Math.round((manualSpent + subSpent) * 100) / 100
                return {
                    category: b.category,
                    limit: Number(b.limit),
                    spent,
                    variance: Number(b.limit) - spent,
                }
            })
            const totalLimit = categories.reduce((sum, c) => sum + c.limit, 0)
            const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0)

            return {
                month: month.toISOString(),
                categories,
                totalLimit,
                totalSpent,
                savings: totalLimit - totalSpent,
            }
        })

        return c.json({ data })
    })
    // POST /budgets/carry-forward
    .post("/carry-forward", sessionMiddleware, zValidator("json", carryForwardSchema), async (c) => {
        const user = c.get("user")
        const { sourceMonth, targetMonth } = c.req.valid("json")
        const source = new Date(sourceMonth)
        const target = new Date(targetMonth)

        const sourceBudgets = await prisma.budget.findMany({
            where: { userId: user.id, month: source },
        })

        if (sourceBudgets.length === 0) {
            return c.json({ error: "No budgets found for source month" }, 404)
        }

        const existingTarget = await prisma.budget.findMany({
            where: { userId: user.id, month: target },
            select: { category: true },
        })
        const existingCategories = new Set(existingTarget.map((b) => b.category))

        const toCreate = sourceBudgets.filter((b) => !existingCategories.has(b.category))

        if (toCreate.length === 0) {
            return c.json({ error: "All categories already exist in target month" }, 409)
        }

        await prisma.budget.createMany({
            data: toCreate.map((b) => ({
                userId: user.id,
                category: b.category,
                limit: b.limit,
                month: target,
            })),
        })

        return c.json({ data: { copied: toCreate.length, skipped: existingCategories.size } }, 201)
    })
    // POST /budgets/expenses
    .post("/expenses", sessionMiddleware, zValidator("json", createBudgetExpenseSchema), async (c) => {
        const user = c.get("user")
        const data = c.req.valid("json")

        const budget = await prisma.budget.findFirst({ where: { id: data.budgetId, userId: user.id } })
        if (!budget) return c.json({ error: "Budget not found" }, 404)

        const expense = await prisma.budgetExpense.create({
            data: {
                budgetId: data.budgetId,
                description: data.description,
                amount: data.amount,
                date: data.date,
                notes: data.notes || null,
            },
        })
        return c.json({ data: expense }, 201)
    })
    // PATCH /budgets/expenses/:id
    .patch("/expenses/:id", sessionMiddleware, zValidator("param", idParam), zValidator("json", updateBudgetExpenseSchema), async (c) => {
        const user = c.get("user")
        const { id } = c.req.valid("param")
        const data = c.req.valid("json")

        const expense = await prisma.budgetExpense.findFirst({
            where: { id },
            include: { budget: { select: { userId: true } } },
        })
        if (!expense || expense.budget.userId !== user.id) {
            return c.json({ error: "Expense not found" }, 404)
        }

        const updated = await prisma.budgetExpense.update({ where: { id }, data })
        return c.json({ data: updated })
    })
    // DELETE /budgets/expenses/:id
    .delete("/expenses/:id", sessionMiddleware, zValidator("param", idParam), async (c) => {
        const user = c.get("user")
        const { id } = c.req.valid("param")

        const expense = await prisma.budgetExpense.findFirst({
            where: { id },
            include: { budget: { select: { userId: true } } },
        })
        if (!expense || expense.budget.userId !== user.id) {
            return c.json({ error: "Expense not found" }, 404)
        }

        await prisma.budgetExpense.delete({ where: { id } })
        return c.json({ message: "Expense deleted" })
    })
    // --- Param routes AFTER static routes ---
    // PATCH /budgets/:id
    .patch("/:id", sessionMiddleware, zValidator("param", idParam), zValidator("json", updateBudgetSchema), async (c) => {
        const user = c.get("user")
        const { id } = c.req.valid("param")
        const { limit } = c.req.valid("json")

        const budget = await prisma.budget.findFirst({ where: { id, userId: user.id } })
        if (!budget) return c.json({ error: "Budget not found" }, 404)

        const updated = await prisma.budget.update({ where: { id }, data: { limit } })
        return c.json({ data: updated })
    })
    // DELETE /budgets/:id
    .delete("/:id", sessionMiddleware, zValidator("param", idParam), async (c) => {
        const user = c.get("user")
        const { id } = c.req.valid("param")

        const budget = await prisma.budget.findFirst({ where: { id, userId: user.id } })
        if (!budget) return c.json({ error: "Budget not found" }, 404)

        await prisma.budget.delete({ where: { id } })
        return c.json({ message: "Budget deleted" })
    })
    // GET /budgets/:id/expenses
    .get("/:id/expenses", sessionMiddleware, zValidator("param", idParam), async (c) => {
        const user = c.get("user")
        const { id } = c.req.valid("param")

        const budget = await prisma.budget.findFirst({ where: { id, userId: user.id } })
        if (!budget) return c.json({ error: "Budget not found" }, 404)

        const manualExpenses = await prisma.budgetExpense.findMany({
            where: { budgetId: id },
            orderBy: { date: "desc" },
        })

        // Get active subscriptions matching this budget's category
        const subscriptions = await prisma.subscription.findMany({
            where: { userId: user.id, status: "ACTIVE", category: budget.category },
            select: { id: true, name: true, amount: true, billingCycle: true, lastPaidDate: true },
        })

        // Create virtual expense entries for subscriptions
        const budgetMonth = new Date(budget.month)
        const subscriptionExpenses = subscriptions.map((sub) => ({
            id: `sub_${sub.id}`,
            budgetId: id,
            description: sub.name,
            amount: String(calculateMonthlyAmount(Number(sub.amount), sub.billingCycle).toFixed(2)),
            date: sub.lastPaidDate || budgetMonth.toISOString(),
            notes: `${sub.billingCycle.replace("_", " ").toLowerCase()} subscription`,
            createdAt: budgetMonth.toISOString(),
            updatedAt: budgetMonth.toISOString(),
            isSubscription: true,
        }))

        const manualWithFlag = manualExpenses.map((e) => ({
            ...e,
            amount: String(e.amount),
            date: e.date.toISOString(),
            createdAt: e.createdAt.toISOString(),
            updatedAt: e.updatedAt.toISOString(),
            isSubscription: false,
        }))

        // Merge and sort by date descending
        const allExpenses = [...manualWithFlag, ...subscriptionExpenses].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )

        return c.json({ data: allExpenses })
    })

export default app
