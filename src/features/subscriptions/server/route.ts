import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator"
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
        
        const subscriptions = await prisma.subscription.findMany({
            where: { userId: user.id },
            select: {
                id: true,
                name: true,
                logoUrl: true,
                billingCycle: true,
                amount: true,
                currency: true,
                firstBillingDate: true,
                lastBillingDate: true,
                billingHistory: {
                    orderBy: { billingDate: "desc" }
                }
            }
        });

        const historyData = subscriptions.flatMap(sub => {
            const payments = [];
            let currentDate = new Date(sub.firstBillingDate);
            const now = new Date();
            
            while (currentDate <= now) {
                const existingRecord = sub.billingHistory.find(
                    h => new Date(h.billingDate).toDateString() === currentDate.toDateString()
                );
                
                if (existingRecord) {
                    payments.push(existingRecord);
                } else if (currentDate <= sub.lastBillingDate) {
                    payments.push({
                        id: `generated-${sub.id}-${currentDate.toISOString()}`,
                        subscriptionId: sub.id,
                        amount: sub.amount,
                        currency: sub.currency,
                        billingDate: currentDate,
                        paymentStatus: "SUCCESS" as const,
                        paymentMethod: null,
                        transactionId: null,
                        notes: null,
                        createdAt: currentDate,
                        subscription: sub
                    });
                }
                
                switch (sub.billingCycle) {
                    case "WEEKLY":
                        currentDate.setDate(currentDate.getDate() + 7);
                        break;
                    case "MONTHLY":
                        currentDate.setMonth(currentDate.getMonth() + 1);
                        break;
                    case "QUARTERLY":
                        currentDate.setMonth(currentDate.getMonth() + 3);
                        break;
                    case "SEMI_ANNUAL":
                        currentDate.setMonth(currentDate.getMonth() + 6);
                        break;
                    case "ANNUAL":
                        currentDate.setFullYear(currentDate.getFullYear() + 1);
                        break;
                    default:
                        break;
                }
                
                if (sub.billingCycle === "ONE_TIME") break;
            }
            
            return payments;
        });

        const sortedHistory = historyData.sort((a, b) => 
            new Date(b.billingDate).getTime() - new Date(a.billingDate).getTime()
        );

        return c.json({ data: sortedHistory });
    });

export default app;
