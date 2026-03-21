import { describe, it, expect, beforeEach, vi } from "vitest"
import { Hono } from "hono"
import { prismaMock } from "./setup"
import { TEST_USER, makeRequest, makeUnauthRequest } from "./helpers"

import subscriptions from "@/features/subscriptions/server/route"
const app = new Hono().basePath("/api").route("/subscriptions", subscriptions)

// ── Test data factories ──
const SUBSCRIPTION = {
    id: "sub-1",
    userId: TEST_USER.id,
    name: "Netflix",
    description: null,
    category: "OTT & Entertainment",
    logoUrl: null,
    websiteUrl: null,
    amount: 199,
    currency: "INR",
    billingCycle: "MONTHLY",
    firstBillingDate: new Date("2025-03-01"),
    lastBillingDate: new Date("2025-03-01"),
    nextBillingDate: new Date("2025-04-01"),
    autoRenew: true,
    status: "ACTIVE",
    paymentStatus: "PENDING",
    notes: null,
    reminderDays: 3,
    usageFrequency: "DAILY",
    lastUsedDate: new Date(),
    lastPaidDate: null,
    billType: "FIXED",
    isVariable: false,
    billingDay: null,
    createdAt: new Date(),
    updatedAt: new Date(),
}

const UTILITY_BILL = {
    ...SUBSCRIPTION,
    id: "util-1",
    name: "Electricity",
    category: "Electricity",
    billType: "VARIABLE",
    isVariable: true,
    billingDay: 15,
    amount: 1500,
}

describe("Subscriptions API", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    // ══════════════════════════════════════════════
    // GET /api/subscriptions
    // ══════════════════════════════════════════════
    describe("GET /api/subscriptions", () => {
        it("returns list of subscriptions", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.subscription.findMany.mockResolvedValue([SUBSCRIPTION])

            const res = await makeRequest(app, "/api/subscriptions")
            expect(res.status).toBe(200)

            const json = await res.json()
            expect(json.data).toHaveLength(1)
            expect(json.data[0].name).toBe("Netflix")
        })

        it("returns empty array when no subscriptions", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.subscription.findMany.mockResolvedValue([])

            const res = await makeRequest(app, "/api/subscriptions")
            expect(res.status).toBe(200)
            const json = await res.json()
            expect(json.data).toHaveLength(0)
        })

        it("returns 401 when unauthenticated", async () => {
            const res = await makeUnauthRequest(app, "/api/subscriptions")
            expect(res.status).toBe(401)
        })
    })

    // ══════════════════════════════════════════════
    // POST /api/subscriptions
    // ══════════════════════════════════════════════
    describe("POST /api/subscriptions", () => {
        it("creates a subscription", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.subscription.create.mockResolvedValue(SUBSCRIPTION)

            const res = await makeRequest(app, "/api/subscriptions", {
                method: "POST",
                body: {
                    name: "Netflix",
                    category: "OTT & Entertainment",
                    amount: 199,
                    currency: "INR",
                    billingCycle: "MONTHLY",
                    firstBillingDate: "2025-03-01",
                },
            })
            expect(res.status).toBe(201)
            const json = await res.json()
            expect(json.data.name).toBe("Netflix")
        })

        it("rejects missing required fields", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)

            const res = await makeRequest(app, "/api/subscriptions", {
                method: "POST",
                body: { name: "Incomplete" },
            })
            expect(res.status).toBe(400)
        })

        it("rejects negative amount", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)

            const res = await makeRequest(app, "/api/subscriptions", {
                method: "POST",
                body: {
                    name: "Bad Sub",
                    category: "Other",
                    amount: -100,
                    currency: "INR",
                    billingCycle: "MONTHLY",
                    firstBillingDate: "2025-03-01",
                },
            })
            expect(res.status).toBe(400)
        })

        it("rejects invalid billing cycle", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)

            const res = await makeRequest(app, "/api/subscriptions", {
                method: "POST",
                body: {
                    name: "Bad Sub",
                    category: "Other",
                    amount: 100,
                    currency: "INR",
                    billingCycle: "BIWEEKLY",
                    firstBillingDate: "2025-03-01",
                },
            })
            expect(res.status).toBe(400)
        })
    })

    // ══════════════════════════════════════════════
    // GET /api/subscriptions/:id
    // ══════════════════════════════════════════════
    describe("GET /api/subscriptions/:id", () => {
        it("returns a single subscription", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.subscription.findFirst.mockResolvedValue(SUBSCRIPTION)

            const res = await makeRequest(app, "/api/subscriptions/sub-1")
            expect(res.status).toBe(200)
            const json = await res.json()
            expect(json.data.id).toBe("sub-1")
        })

        it("returns 404 for non-existent subscription", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.subscription.findFirst.mockResolvedValue(null)

            const res = await makeRequest(app, "/api/subscriptions/nonexistent")
            expect(res.status).toBe(404)
        })
    })

    // ══════════════════════════════════════════════
    // PATCH /api/subscriptions/:id
    // ══════════════════════════════════════════════
    describe("PATCH /api/subscriptions/:id", () => {
        it("updates a subscription", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.subscription.findFirst.mockResolvedValue(SUBSCRIPTION)
            prismaMock.subscription.update.mockResolvedValue({ ...SUBSCRIPTION, name: "Netflix Premium" })

            const res = await makeRequest(app, "/api/subscriptions/sub-1", {
                method: "PATCH",
                body: { name: "Netflix Premium" },
            })
            expect(res.status).toBe(200)
            const json = await res.json()
            expect(json.data.name).toBe("Netflix Premium")
        })

        it("returns 404 for another user's subscription", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.subscription.findFirst.mockResolvedValue(null)

            const res = await makeRequest(app, "/api/subscriptions/other-sub", {
                method: "PATCH",
                body: { name: "Hacked" },
            })
            expect(res.status).toBe(404)
        })

        it("recalculates nextBillingDate when billingCycle changes", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.subscription.findFirst.mockResolvedValue(SUBSCRIPTION)
            prismaMock.subscription.update.mockImplementation(async ({ data }: any) => ({
                ...SUBSCRIPTION,
                ...data,
            }))

            const res = await makeRequest(app, "/api/subscriptions/sub-1", {
                method: "PATCH",
                body: { billingCycle: "ANNUAL" },
            })
            expect(res.status).toBe(200)

            // Verify update was called with nextBillingDate
            const updateCall = prismaMock.subscription.update.mock.calls[0][0]
            expect(updateCall.data.nextBillingDate).toBeDefined()
        })
    })

    // ══════════════════════════════════════════════
    // DELETE /api/subscriptions/:id
    // ══════════════════════════════════════════════
    describe("DELETE /api/subscriptions/:id", () => {
        it("deletes a subscription", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.subscription.findFirst.mockResolvedValue(SUBSCRIPTION)
            prismaMock.subscription.delete.mockResolvedValue(SUBSCRIPTION)

            const res = await makeRequest(app, "/api/subscriptions/sub-1", {
                method: "DELETE",
            })
            expect(res.status).toBe(200)
            const json = await res.json()
            expect(json.message).toMatch(/deleted/i)
        })

        it("returns 404 for non-existent subscription", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.subscription.findFirst.mockResolvedValue(null)

            const res = await makeRequest(app, "/api/subscriptions/nonexistent", {
                method: "DELETE",
            })
            expect(res.status).toBe(404)
        })
    })

    // ══════════════════════════════════════════════
    // POST /api/subscriptions/:id/mark-paid
    // ══════════════════════════════════════════════
    describe("POST /api/subscriptions/:id/mark-paid", () => {
        it("marks a subscription as paid and advances next billing date", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.subscription.findFirst.mockResolvedValue(SUBSCRIPTION)
            prismaMock.subscription.update.mockImplementation(async ({ data }: any) => ({
                ...SUBSCRIPTION,
                ...data,
                paymentStatus: "SUCCESS",
            }))

            const res = await makeRequest(app, "/api/subscriptions/sub-1/mark-paid", {
                method: "POST",
            })
            expect(res.status).toBe(200)

            const updateCall = prismaMock.subscription.update.mock.calls[0][0]
            expect(updateCall.data.paymentStatus).toBe("SUCCESS")
            expect(updateCall.data.lastPaidDate).toBeDefined()
            expect(updateCall.data.nextBillingDate).toBeDefined()
        })

        it("returns 404 for another user's subscription", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.subscription.findFirst.mockResolvedValue(null)

            const res = await makeRequest(app, "/api/subscriptions/other-sub/mark-paid", {
                method: "POST",
            })
            expect(res.status).toBe(404)
        })
    })

    // ══════════════════════════════════════════════
    // POST /api/subscriptions/:id/skip-payment
    // ══════════════════════════════════════════════
    describe("POST /api/subscriptions/:id/skip-payment", () => {
        it("skips payment", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.subscription.findFirst.mockResolvedValue(SUBSCRIPTION)
            prismaMock.subscription.update.mockResolvedValue({ ...SUBSCRIPTION, paymentStatus: "SKIPPED" })

            const res = await makeRequest(app, "/api/subscriptions/sub-1/skip-payment", {
                method: "POST",
            })
            expect(res.status).toBe(200)
        })
    })

    // ══════════════════════════════════════════════
    // POST /api/subscriptions/:id/mark-used
    // ══════════════════════════════════════════════
    describe("POST /api/subscriptions/:id/mark-used", () => {
        it("updates lastUsedDate", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.subscription.findFirst.mockResolvedValue(SUBSCRIPTION)
            prismaMock.subscription.update.mockResolvedValue({ ...SUBSCRIPTION, lastUsedDate: new Date() })

            const res = await makeRequest(app, "/api/subscriptions/sub-1/mark-used", {
                method: "POST",
            })
            expect(res.status).toBe(200)
        })
    })

    // ══════════════════════════════════════════════
    // PATCH /api/subscriptions/:id/usage-frequency
    // ══════════════════════════════════════════════
    describe("PATCH /api/subscriptions/:id/usage-frequency", () => {
        it("updates usage frequency", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.subscription.findFirst.mockResolvedValue(SUBSCRIPTION)
            prismaMock.subscription.update.mockResolvedValue({ ...SUBSCRIPTION, usageFrequency: "RARELY" })

            const res = await makeRequest(app, "/api/subscriptions/sub-1/usage-frequency", {
                method: "PATCH",
                body: { usageFrequency: "RARELY" },
            })
            expect(res.status).toBe(200)
        })

        it("rejects invalid frequency value", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)

            const res = await makeRequest(app, "/api/subscriptions/sub-1/usage-frequency", {
                method: "PATCH",
                body: { usageFrequency: "INVALID" },
            })
            expect(res.status).toBe(400)
        })
    })

    // ══════════════════════════════════════════════
    // Utility Bills
    // ══════════════════════════════════════════════
    describe("POST /api/subscriptions/utility-bills", () => {
        it("creates a utility bill", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.subscription.create.mockResolvedValue(UTILITY_BILL)
            prismaMock.billRecord.create.mockResolvedValue({})

            const res = await makeRequest(app, "/api/subscriptions/utility-bills", {
                method: "POST",
                body: {
                    name: "Electricity",
                    category: "Electricity",
                    billingDay: 15,
                    amount: 1500,
                    currency: "INR",
                },
            })
            expect(res.status).toBe(201)
        })

        it("rejects billingDay > 28", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)

            const res = await makeRequest(app, "/api/subscriptions/utility-bills", {
                method: "POST",
                body: {
                    name: "Electricity",
                    category: "Electricity",
                    billingDay: 31,
                    currency: "INR",
                },
            })
            expect(res.status).toBe(400)
        })
    })

    describe("GET /api/subscriptions/utility-bills", () => {
        it("returns utility bills", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.subscription.findMany.mockResolvedValue([UTILITY_BILL])

            const res = await makeRequest(app, "/api/subscriptions/utility-bills")
            expect(res.status).toBe(200)
            const json = await res.json()
            expect(json.data).toHaveLength(1)
        })
    })

    describe("GET /api/subscriptions/utility-bills/:id/history", () => {
        it("returns bill history", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.subscription.findFirst.mockResolvedValue(UTILITY_BILL)
            prismaMock.billRecord.findMany.mockResolvedValue([
                { id: "rec-1", billingMonth: new Date("2025-03-01"), amount: 1500 },
            ])

            const res = await makeRequest(app, "/api/subscriptions/utility-bills/util-1/history")
            expect(res.status).toBe(200)
            const json = await res.json()
            expect(json.data).toHaveLength(1)
        })

        it("returns 404 for non-existent utility bill", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.subscription.findFirst.mockResolvedValue(null)

            const res = await makeRequest(app, "/api/subscriptions/utility-bills/nonexistent/history")
            expect(res.status).toBe(404)
        })
    })

    describe("POST /api/subscriptions/utility-bills/record-bill", () => {
        it("records a bill amount", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.subscription.findFirst.mockResolvedValue(UTILITY_BILL)
            prismaMock.billRecord.upsert.mockResolvedValue({ id: "rec-1", amount: 1800 })

            const res = await makeRequest(app, "/api/subscriptions/utility-bills/record-bill", {
                method: "POST",
                body: {
                    subscriptionId: "util-1",
                    billingMonth: "2025-03-01",
                    amount: 1800,
                },
            })
            expect(res.status).toBe(201)
        })

        it("rejects invalid month format", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)

            const res = await makeRequest(app, "/api/subscriptions/utility-bills/record-bill", {
                method: "POST",
                body: {
                    subscriptionId: "util-1",
                    billingMonth: "March 2025",
                    amount: 1800,
                },
            })
            expect(res.status).toBe(400)
        })
    })

    describe("POST /api/subscriptions/utility-bills/estimate", () => {
        it("creates an estimate", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.subscription.findFirst.mockResolvedValue(UTILITY_BILL)
            prismaMock.billEstimate.upsert.mockResolvedValue({ estimatedAmount: 1600 })

            const res = await makeRequest(app, "/api/subscriptions/utility-bills/estimate", {
                method: "POST",
                body: {
                    subscriptionId: "util-1",
                    billingMonth: "2025-04-01",
                    estimatedAmount: 1600,
                    estimationMethod: "MANUAL",
                },
            })
            expect(res.status).toBe(201)
        })
    })

    // ══════════════════════════════════════════════
    // Billing History
    // ══════════════════════════════════════════════
    describe("GET /api/subscriptions/billing-history", () => {
        it("returns billing history", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.billingHistory.findMany.mockResolvedValue([
                { id: "bh-1", amount: 199, subscription: { id: "sub-1", name: "Netflix", logoUrl: null } },
            ])

            const res = await makeRequest(app, "/api/subscriptions/billing-history")
            expect(res.status).toBe(200)
            const json = await res.json()
            expect(json.data).toBeDefined()
        })
    })

    describe("POST /api/subscriptions/billing-history", () => {
        it("creates billing history record", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.subscription.findFirst.mockResolvedValue(SUBSCRIPTION)
            prismaMock.billingHistory.create.mockResolvedValue({ id: "bh-new", amount: 199 })

            const res = await makeRequest(app, "/api/subscriptions/billing-history", {
                method: "POST",
                body: {
                    subscriptionId: "sub-1",
                    amount: 199,
                    currency: "INR",
                    billingDate: "2025-03-15",
                },
            })
            expect(res.status).toBe(201)
        })

        it("returns 404 for non-existent subscription", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.subscription.findFirst.mockResolvedValue(null)

            const res = await makeRequest(app, "/api/subscriptions/billing-history", {
                method: "POST",
                body: {
                    subscriptionId: "nonexistent",
                    amount: 199,
                    currency: "INR",
                    billingDate: "2025-03-15",
                },
            })
            expect(res.status).toBe(404)
        })
    })

    describe("PATCH /api/subscriptions/billing-history/:id", () => {
        it("updates billing status", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.billingHistory.findFirst.mockResolvedValue({
                id: "bh-1",
                subscription: { userId: TEST_USER.id },
            })
            prismaMock.billingHistory.update.mockResolvedValue({ id: "bh-1", paymentStatus: "REFUNDED" })

            const res = await makeRequest(app, "/api/subscriptions/billing-history/bh-1", {
                method: "PATCH",
                body: { paymentStatus: "REFUNDED" },
            })
            expect(res.status).toBe(200)
        })

        it("returns 404 for another user's billing record", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.billingHistory.findFirst.mockResolvedValue(null)

            const res = await makeRequest(app, "/api/subscriptions/billing-history/bh-999", {
                method: "PATCH",
                body: { paymentStatus: "FAILED" },
            })
            expect(res.status).toBe(404)
        })
    })

    // ══════════════════════════════════════════════
    // Export CSV
    // ══════════════════════════════════════════════
    describe("GET /api/subscriptions/export/csv", () => {
        it("returns CSV content", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.subscription.findMany.mockResolvedValue([SUBSCRIPTION])

            const res = await makeRequest(app, "/api/subscriptions/export/csv")
            expect(res.status).toBe(200)

            const text = await res.text()
            expect(text).toContain("Netflix")
            expect(text).toContain("Name")
        })

        it("returns empty CSV when no subscriptions", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.subscription.findMany.mockResolvedValue([])

            const res = await makeRequest(app, "/api/subscriptions/export/csv")
            expect(res.status).toBe(200)
            const text = await res.text()
            // Should have header row only
            expect(text).toContain("Name")
        })
    })
})
