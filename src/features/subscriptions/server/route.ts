import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { prisma } from "@/lib/db";
import { sessionMiddleware } from "@/lib/sessionMiddleware";
import { createSubscriptionSchema, updateSubscriptionSchema, subscriptionIdSchema } from "../schemas";
import { BillingCycle } from "@/app/generated/prisma/client";

function calculateNextBillingDate(billingCycle: BillingCycle, fromDate: Date): Date {
    const next = new Date(fromDate);
    switch (billingCycle) {
        case "WEEKLY":
            next.setDate(next.getDate() + 7);
            break;
        case "MONTHLY":
            next.setMonth(next.getMonth() + 1);
            break;
        case "QUARTERLY":
            next.setMonth(next.getMonth() + 3);
            break;
        case "SEMI_ANNUAL":
            next.setMonth(next.getMonth() + 6);
            break;
        case "ANNUAL":
            next.setFullYear(next.getFullYear() + 1);
            break;
        case "ONE_TIME":
            break;
    }
    return next;
}

const app = new Hono()
    .get("/", sessionMiddleware, async (c) => {
        const user = c.get("user");
        const subscriptions = await prisma.subscription.findMany({
            where: { userId: user.id },
            orderBy: { nextBillingDate: "asc" }
        });
        return c.json({ data: subscriptions });
    })
    .get("/:id", sessionMiddleware, zValidator("param", subscriptionIdSchema), async (c) => {
        const user = c.get("user");
        const { id } = c.req.valid("param");

        const subscription = await prisma.subscription.findFirst({
            where: { id, userId: user.id }
        });

        if (!subscription) {
            return c.json({ error: "Subscription not found" }, 404);
        }

        return c.json({ data: subscription });
    })
    .post("/", sessionMiddleware, zValidator("json", createSubscriptionSchema), async (c) => {
        const user = c.get("user");
        const data = c.req.valid("json");

        const lastBillingDate = new Date(data.firstBillingDate);
        const nextBillingDate = calculateNextBillingDate(data.billingCycle, data.firstBillingDate);

        const subscription = await prisma.subscription.create({
            data: {
                userId: user.id,
                name: data.name,
                description: data.description,
                category: data.category,
                logoUrl: data.logoUrl || null,
                websiteUrl: data.websiteUrl || null,
                amount: data.amount,
                currency: data.currency,
                billingCycle: data.billingCycle,
                firstBillingDate: data.firstBillingDate,
                lastBillingDate,
                nextBillingDate,
                autoRenew: data.autoRenew,
                notes: data.notes || null,
                reminderDays: data.reminderDays
            }
        });

        return c.json({ data: subscription }, 201);
    })
    .patch("/:id", sessionMiddleware, zValidator("param", subscriptionIdSchema), zValidator("json", updateSubscriptionSchema), async (c) => {
        const user = c.get("user");
        const { id } = c.req.valid("param");
        const data = c.req.valid("json");

        const existing = await prisma.subscription.findFirst({
            where: { id, userId: user.id }
        });

        if (!existing) {
            return c.json({ error: "Subscription not found" }, 404);
        }

        const updateData: Record<string, unknown> = { ...data };

        if (data.billingCycle || data.firstBillingDate) {
            const billingCycle = data.billingCycle || existing.billingCycle;
            const firstBillingDate = data.firstBillingDate || existing.firstBillingDate;
            updateData.nextBillingDate = calculateNextBillingDate(billingCycle, firstBillingDate);
            updateData.lastBillingDate = firstBillingDate;
        }

        const subscription = await prisma.subscription.update({
            where: { id },
            data: updateData
        });

        return c.json({ data: subscription });
    })
    .delete("/:id", sessionMiddleware, zValidator("param", subscriptionIdSchema), async (c) => {
        const user = c.get("user");
        const { id } = c.req.valid("param");

        const existing = await prisma.subscription.findFirst({
            where: { id, userId: user.id }
        });

        if (!existing) {
            return c.json({ error: "Subscription not found" }, 404);
        }

        await prisma.subscription.delete({
            where: { id }
        });

        return c.json({ message: "Subscription deleted successfully" });
    })
    .get("/billing-history", sessionMiddleware, async (c) => {
        const user = c.get("user");

        const billingHistory = await prisma.billingHistory.findMany({
            where: {
                subscription: {
                    userId: user.id
                }
            },
            include: {
                subscription: {
                    select: {
                        id: true,
                        name: true,
                        logoUrl: true
                    }
                }
            },
            orderBy: { billingDate: "desc" }
        });

        return c.json({ data: billingHistory });
    })
    .post("/billing-history", sessionMiddleware, zValidator("json", z.object({
        subscriptionId: z.string(),
        amount: z.number().positive(),
        currency: z.string().default("INR"),
        billingDate: z.string().transform((str) => new Date(str)),
        paymentMethod: z.string().optional(),
    })), async (c) => {
        const user = c.get("user");
        const data = c.req.valid("json");

        const subscription = await prisma.subscription.findFirst({
            where: { id: data.subscriptionId, userId: user.id }
        });

        if (!subscription) {
            return c.json({ error: "Subscription not found" }, 404);
        }

        const billingRecord = await prisma.billingHistory.create({
            data: {
                subscriptionId: data.subscriptionId,
                amount: data.amount,
                currency: data.currency,
                billingDate: data.billingDate,
                paymentStatus: "SUCCESS",
                paymentMethod: data.paymentMethod || null,
            }
        });

        return c.json({ data: billingRecord }, 201);
    })
    .patch("/billing-history/:id", sessionMiddleware, zValidator("param", z.object({ id: z.string() })), zValidator("json", z.object({
        paymentStatus: z.enum(["PENDING", "SUCCESS", "FAILED", "REFUNDED"])
    })), async (c) => {
        const user = c.get("user");
        const { id } = c.req.valid("param");
        const { paymentStatus } = c.req.valid("json");

        const billingRecord = await prisma.billingHistory.findFirst({
            where: { id },
            include: {
                subscription: true
            }
        });

        if (!billingRecord || billingRecord.subscription.userId !== user.id) {
            return c.json({ error: "Billing record not found" }, 404);
        }

        const updated = await prisma.billingHistory.update({
            where: { id },
            data: { paymentStatus }
        });

        return c.json({ data: updated });
    })
    .post("/:id/mark-paid", sessionMiddleware, zValidator("param", subscriptionIdSchema), zValidator("json", z.object({
        paymentMethod: z.string().optional(),
    })), async (c) => {
        const user = c.get("user");
        const { id } = c.req.valid("param");
        const { paymentMethod } = c.req.valid("json");

        const subscription = await prisma.subscription.findFirst({
            where: { id, userId: user.id }
        });

        if (!subscription) {
            return c.json({ error: "Subscription not found" }, 404);
        }

        const now = new Date();
        const updated = await prisma.subscription.update({
            where: { id },
            data: {
                lastPaidDate: now,
                paymentStatus: "SUCCESS",
                paymentMethod: paymentMethod || null,
                nextBillingDate: calculateNextBillingDate(subscription.billingCycle, now)
            }
        });

        return c.json({ data: updated });
    })
    .post("/:id/skip-payment", sessionMiddleware, zValidator("param", subscriptionIdSchema), async (c) => {
        const user = c.get("user");
        const { id } = c.req.valid("param");

        const subscription = await prisma.subscription.findFirst({
            where: { id, userId: user.id }
        });

        if (!subscription) {
            return c.json({ error: "Subscription not found" }, 404);
        }

        const updated = await prisma.subscription.update({
            where: { id },
            data: {
                paymentStatus: "SKIPPED"
            }
        });

        return c.json({ data: updated });
    });

export default app;
