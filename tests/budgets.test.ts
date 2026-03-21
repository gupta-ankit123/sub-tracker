import { describe, it, expect, beforeEach, vi } from "vitest"
import { Hono } from "hono"
import { prismaMock } from "./setup"
import { TEST_USER, makeRequest, makeUnauthRequest } from "./helpers"

import budgets from "@/features/budgets/server/route"
const app = new Hono().basePath("/api").route("/budgets", budgets)

// ── Test data ──
const MONTH = "2026-03-01"
const BUDGET = {
    id: "budget-1",
    userId: TEST_USER.id,
    category: "OTT & Entertainment",
    limit: 1000,
    month: new Date(MONTH),
    createdAt: new Date(),
    updatedAt: new Date(),
}

const EXPENSE = {
    id: "exp-1",
    budgetId: "budget-1",
    description: "Popcorn",
    amount: 200,
    date: new Date(),
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
}

const ACTIVE_SUB = {
    category: "OTT & Entertainment",
    amount: 199,
    billingCycle: "MONTHLY",
}

describe("Budgets API", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    // ══════════════════════════════════════════════
    // GET /api/budgets
    // ══════════════════════════════════════════════
    describe("GET /api/budgets", () => {
        it("returns budgets with subscription costs included in spent", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.budget.findMany.mockResolvedValue([
                { ...BUDGET, expenses: [{ amount: 200 }] },
            ])
            prismaMock.subscription.findMany.mockResolvedValue([ACTIVE_SUB])

            const res = await makeRequest(app, "/api/budgets?month=2026-03-01")
            expect(res.status).toBe(200)

            const json = await res.json()
            expect(json.data).toHaveLength(1)
            // spent = manual (200) + subscription (199) = 399
            expect(json.data[0].spent).toBe(399)
            expect(json.data[0].manualSpent).toBe(200)
            expect(json.data[0].subscriptionSpent).toBe(199)
        })

        it("returns 401 when unauthenticated", async () => {
            const res = await makeUnauthRequest(app, "/api/budgets?month=2026-03-01")
            expect(res.status).toBe(401)
        })

        it("works with default month when none specified", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.budget.findMany.mockResolvedValue([])
            prismaMock.subscription.findMany.mockResolvedValue([])

            const res = await makeRequest(app, "/api/budgets")
            expect(res.status).toBe(200)
        })
    })

    // ══════════════════════════════════════════════
    // POST /api/budgets
    // ══════════════════════════════════════════════
    describe("POST /api/budgets", () => {
        it("creates a budget", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.budget.findUnique.mockResolvedValue(null)
            prismaMock.budget.create.mockResolvedValue(BUDGET)

            const res = await makeRequest(app, "/api/budgets", {
                method: "POST",
                body: { category: "OTT & Entertainment", limit: 1000, month: MONTH },
            })
            expect(res.status).toBe(201)
        })

        it("rejects duplicate category+month", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.budget.findUnique.mockResolvedValue(BUDGET)

            const res = await makeRequest(app, "/api/budgets", {
                method: "POST",
                body: { category: "OTT & Entertainment", limit: 1000, month: MONTH },
            })
            expect(res.status).toBe(409)
        })

        it("rejects negative limit", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)

            const res = await makeRequest(app, "/api/budgets", {
                method: "POST",
                body: { category: "Food", limit: -500, month: MONTH },
            })
            expect(res.status).toBe(400)
        })

        it("rejects invalid month format", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)

            const res = await makeRequest(app, "/api/budgets", {
                method: "POST",
                body: { category: "Food", limit: 500, month: "March 2026" },
            })
            expect(res.status).toBe(400)
        })
    })

    // ══════════════════════════════════════════════
    // GET /api/budgets/safe-to-spend
    // ══════════════════════════════════════════════
    describe("GET /api/budgets/safe-to-spend", () => {
        it("calculates safe-to-spend correctly (no double counting)", async () => {
            prismaMock.user.findUnique.mockResolvedValueOnce(TEST_USER) // session middleware
            prismaMock.user.findUnique.mockResolvedValueOnce({ monthlyIncome: 50000 }) // userData query

            prismaMock.subscription.findMany.mockResolvedValue([
                { category: "OTT & Entertainment", amount: 199, billingCycle: "MONTHLY" },
                { category: "Music Streaming", amount: 119, billingCycle: "MONTHLY" },
            ])

            prismaMock.budget.findMany.mockResolvedValue([
                { category: "OTT & Entertainment", limit: 1000 },
            ])

            const res = await makeRequest(app, "/api/budgets/safe-to-spend?month=2026-03-01")
            expect(res.status).toBe(200)

            const json = await res.json()
            expect(json.data.monthlyIncome).toBe(50000)
            // fixedBills = 199 + 119 = 318
            expect(json.data.fixedBills).toBe(318)
            // budgetAllocations = max(0, 1000 - 199) = 801 (OTT only, Music has no budget)
            expect(json.data.budgetAllocations).toBe(801)
            // safeToSpend = 50000 - 318 - 801 = 48881
            expect(json.data.safeToSpend).toBe(48881)
        })

        it("returns zeros when no income set", async () => {
            prismaMock.user.findUnique.mockResolvedValueOnce(TEST_USER)
            prismaMock.user.findUnique.mockResolvedValueOnce({ monthlyIncome: null })
            prismaMock.subscription.findMany.mockResolvedValue([])
            prismaMock.budget.findMany.mockResolvedValue([])

            const res = await makeRequest(app, "/api/budgets/safe-to-spend")
            expect(res.status).toBe(200)
            const json = await res.json()
            expect(json.data.monthlyIncome).toBe(0)
            expect(json.data.safeToSpend).toBe(0)
        })
    })

    // ══════════════════════════════════════════════
    // PATCH /api/budgets/income
    // ══════════════════════════════════════════════
    describe("PATCH /api/budgets/income", () => {
        it("updates monthly income", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.user.update.mockResolvedValue({ ...TEST_USER, monthlyIncome: 60000 })

            const res = await makeRequest(app, "/api/budgets/income", {
                method: "PATCH",
                body: { monthlyIncome: 60000 },
            })
            expect(res.status).toBe(200)
            const json = await res.json()
            expect(json.data.monthlyIncome).toBe(60000)
        })

        it("rejects negative income", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)

            const res = await makeRequest(app, "/api/budgets/income", {
                method: "PATCH",
                body: { monthlyIncome: -5000 },
            })
            expect(res.status).toBe(400)
        })
    })

    // ══════════════════════════════════════════════
    // GET /api/budgets/analytics
    // ══════════════════════════════════════════════
    describe("GET /api/budgets/analytics", () => {
        it("returns multi-month analytics", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.budget.findMany.mockResolvedValue([
                { ...BUDGET, month: new Date("2026-03-01"), expenses: [{ amount: 300 }] },
            ])
            prismaMock.subscription.findMany.mockResolvedValue([ACTIVE_SUB])

            const res = await makeRequest(app, "/api/budgets/analytics?months=3")
            expect(res.status).toBe(200)
            const json = await res.json()
            expect(json.data).toHaveLength(3) // 3 months
        })

        it("defaults to 6 months", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.budget.findMany.mockResolvedValue([])
            prismaMock.subscription.findMany.mockResolvedValue([])

            const res = await makeRequest(app, "/api/budgets/analytics")
            expect(res.status).toBe(200)
            const json = await res.json()
            expect(json.data).toHaveLength(6)
        })
    })

    // ══════════════════════════════════════════════
    // POST /api/budgets/carry-forward
    // ══════════════════════════════════════════════
    describe("POST /api/budgets/carry-forward", () => {
        it("copies budgets to target month", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.budget.findMany
                .mockResolvedValueOnce([BUDGET]) // source
                .mockResolvedValueOnce([]) // target (empty)
            prismaMock.budget.createMany.mockResolvedValue({ count: 1 })

            const res = await makeRequest(app, "/api/budgets/carry-forward", {
                method: "POST",
                body: { sourceMonth: "2026-03-01", targetMonth: "2026-04-01" },
            })
            expect(res.status).toBe(201)
            const json = await res.json()
            expect(json.data.copied).toBe(1)
        })

        it("returns 404 when source has no budgets", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.budget.findMany.mockResolvedValue([])

            const res = await makeRequest(app, "/api/budgets/carry-forward", {
                method: "POST",
                body: { sourceMonth: "2026-01-01", targetMonth: "2026-02-01" },
            })
            expect(res.status).toBe(404)
        })

        it("returns 409 when all categories already exist in target", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.budget.findMany
                .mockResolvedValueOnce([BUDGET]) // source
                .mockResolvedValueOnce([{ category: "OTT & Entertainment" }]) // target already has it

            const res = await makeRequest(app, "/api/budgets/carry-forward", {
                method: "POST",
                body: { sourceMonth: "2026-03-01", targetMonth: "2026-04-01" },
            })
            expect(res.status).toBe(409)
        })
    })

    // ══════════════════════════════════════════════
    // PATCH /api/budgets/:id
    // ══════════════════════════════════════════════
    describe("PATCH /api/budgets/:id", () => {
        it("updates budget limit", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.budget.findFirst.mockResolvedValue(BUDGET)
            prismaMock.budget.update.mockResolvedValue({ ...BUDGET, limit: 2000 })

            const res = await makeRequest(app, "/api/budgets/budget-1", {
                method: "PATCH",
                body: { limit: 2000 },
            })
            expect(res.status).toBe(200)
            const json = await res.json()
            expect(json.data.limit).toBe(2000)
        })

        it("returns 404 for non-existent budget", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.budget.findFirst.mockResolvedValue(null)

            const res = await makeRequest(app, "/api/budgets/nonexistent", {
                method: "PATCH",
                body: { limit: 2000 },
            })
            expect(res.status).toBe(404)
        })
    })

    // ══════════════════════════════════════════════
    // DELETE /api/budgets/:id
    // ══════════════════════════════════════════════
    describe("DELETE /api/budgets/:id", () => {
        it("deletes a budget", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.budget.findFirst.mockResolvedValue(BUDGET)
            prismaMock.budget.delete.mockResolvedValue(BUDGET)

            const res = await makeRequest(app, "/api/budgets/budget-1", { method: "DELETE" })
            expect(res.status).toBe(200)
        })

        it("returns 404 for another user's budget", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.budget.findFirst.mockResolvedValue(null)

            const res = await makeRequest(app, "/api/budgets/other-budget", { method: "DELETE" })
            expect(res.status).toBe(404)
        })
    })

    // ══════════════════════════════════════════════
    // Budget Expenses
    // ══════════════════════════════════════════════
    describe("POST /api/budgets/expenses", () => {
        it("creates an expense", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.budget.findFirst.mockResolvedValue(BUDGET)
            prismaMock.budgetExpense.create.mockResolvedValue(EXPENSE)

            const res = await makeRequest(app, "/api/budgets/expenses", {
                method: "POST",
                body: {
                    budgetId: "budget-1",
                    description: "Popcorn",
                    amount: 200,
                    date: "2026-03-15",
                },
            })
            expect(res.status).toBe(201)
        })

        it("returns 404 for non-existent budget", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.budget.findFirst.mockResolvedValue(null)

            const res = await makeRequest(app, "/api/budgets/expenses", {
                method: "POST",
                body: {
                    budgetId: "nonexistent",
                    description: "Food",
                    amount: 100,
                    date: "2026-03-15",
                },
            })
            expect(res.status).toBe(404)
        })
    })

    describe("PATCH /api/budgets/expenses/:id", () => {
        it("updates an expense", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.budgetExpense.findFirst.mockResolvedValue({
                ...EXPENSE,
                budget: { userId: TEST_USER.id },
            })
            prismaMock.budgetExpense.update.mockResolvedValue({ ...EXPENSE, amount: 300 })

            const res = await makeRequest(app, "/api/budgets/expenses/exp-1", {
                method: "PATCH",
                body: { amount: 300 },
            })
            expect(res.status).toBe(200)
        })

        it("returns 404 for another user's expense", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.budgetExpense.findFirst.mockResolvedValue(null)

            const res = await makeRequest(app, "/api/budgets/expenses/other-exp", {
                method: "PATCH",
                body: { amount: 300 },
            })
            expect(res.status).toBe(404)
        })
    })

    describe("DELETE /api/budgets/expenses/:id", () => {
        it("deletes an expense", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.budgetExpense.findFirst.mockResolvedValue({
                ...EXPENSE,
                budget: { userId: TEST_USER.id },
            })
            prismaMock.budgetExpense.delete.mockResolvedValue(EXPENSE)

            const res = await makeRequest(app, "/api/budgets/expenses/exp-1", { method: "DELETE" })
            expect(res.status).toBe(200)
        })
    })

    // ══════════════════════════════════════════════
    // GET /api/budgets/:id/expenses (with subscription entries)
    // ══════════════════════════════════════════════
    describe("GET /api/budgets/:id/expenses", () => {
        it("returns manual expenses + virtual subscription entries", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.budget.findFirst.mockResolvedValue(BUDGET)
            prismaMock.budgetExpense.findMany.mockResolvedValue([EXPENSE])
            prismaMock.subscription.findMany.mockResolvedValue([
                {
                    id: "sub-1",
                    name: "Netflix",
                    amount: 199,
                    billingCycle: "MONTHLY",
                    lastPaidDate: new Date("2026-03-10"),
                },
            ])

            const res = await makeRequest(app, "/api/budgets/budget-1/expenses")
            expect(res.status).toBe(200)

            const json = await res.json()
            expect(json.data.length).toBe(2) // 1 manual + 1 subscription

            const subEntry = json.data.find((e: any) => e.isSubscription)
            expect(subEntry).toBeDefined()
            expect(subEntry.description).toBe("Netflix")
            expect(Number(subEntry.amount)).toBe(199)

            const manualEntry = json.data.find((e: any) => !e.isSubscription)
            expect(manualEntry).toBeDefined()
            expect(manualEntry.description).toBe("Popcorn")
        })

        it("returns 404 for non-existent budget", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.budget.findFirst.mockResolvedValue(null)

            const res = await makeRequest(app, "/api/budgets/nonexistent/expenses")
            expect(res.status).toBe(404)
        })
    })
})
