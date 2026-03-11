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
                reminderDays: data.reminderDays,
                usageFrequency: data.usageFrequency || "MONTHLY"
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
    })
    .post("/:id/mark-used", sessionMiddleware, zValidator("param", subscriptionIdSchema), async (c) => {
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
                lastUsedDate: new Date()
            }
        });

        return c.json({ data: updated });
    })
    .patch("/:id/usage-frequency", sessionMiddleware, zValidator("param", subscriptionIdSchema), zValidator("json", z.object({
        usageFrequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "RARELY", "NEVER"])
    })), async (c) => {
        const user = c.get("user");
        const { id } = c.req.valid("param");
        const { usageFrequency } = c.req.valid("json");

        const subscription = await prisma.subscription.findFirst({
            where: { id, userId: user.id }
        });

        if (!subscription) {
            return c.json({ error: "Subscription not found" }, 404);
        }

        const updated = await prisma.subscription.update({
            where: { id },
            data: { usageFrequency }
        });

        return c.json({ data: updated });
    })
    .get("/export/csv", sessionMiddleware, async (c) => {
        const user = c.get("user");
        const subscriptions = await prisma.subscription.findMany({
            where: { userId: user.id },
            orderBy: { nextBillingDate: "asc" }
        });

        const headers = ["Name", "Amount", "Currency", "Billing Cycle", "Category", "Status", "Payment Status", "Next Billing Date", "Last Paid Date", "Auto Renew"];
        const rows = subscriptions.map(sub => [
            sub.name,
            sub.amount.toString(),
            sub.currency,
            sub.billingCycle,
            sub.category,
            sub.status,
            sub.paymentStatus,
            sub.nextBillingDate.toISOString().split('T')[0],
            sub.lastPaidDate ? sub.lastPaidDate.toISOString().split('T')[0] : "",
            sub.autoRenew ? "Yes" : "No"
        ]);

        const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

        c.header("Content-Type", "text/csv");
        c.header("Content-Disposition", `attachment; filename="subscriptions-${new Date().toISOString().split('T')[0]}.csv"`);
        return c.text(csv);
    })
    .get("/export/pdf", sessionMiddleware, async (c) => {
        const { jsPDF } = await import("jspdf");
        const user = c.get("user");
        
        const subscriptions = await prisma.subscription.findMany({
            where: { userId: user.id },
            orderBy: { nextBillingDate: "asc" }
        });

        const activeSubscriptions = subscriptions.filter(s => s.status === "ACTIVE");
        const totalMonthly = activeSubscriptions.reduce((sum, s) => {
            const amount = Number(s.amount);
            switch (s.billingCycle) {
                case "WEEKLY": return sum + amount * 4.33;
                case "MONTHLY": return sum + amount;
                case "QUARTERLY": return sum + amount / 3;
                case "SEMI_ANNUAL": return sum + amount / 6;
                case "ANNUAL": return sum + amount / 12;
                default: return sum;
            }
        }, 0);
        
        const annualTotal = totalMonthly * 12;
        const dailyCost = totalMonthly / 30;

        const categoryBreakdown = activeSubscriptions.reduce((acc, sub) => {
            const amount = Number(sub.amount);
            let monthlyAmount = amount;
            switch (sub.billingCycle) {
                case "WEEKLY": monthlyAmount = amount * 4.33; break;
                case "QUARTERLY": monthlyAmount = amount / 3; break;
                case "SEMI_ANNUAL": monthlyAmount = amount / 6; break;
                case "ANNUAL": monthlyAmount = amount / 12; break;
            }
            acc[sub.category] = (acc[sub.category] || 0) + monthlyAmount;
            return acc;
        }, {} as Record<string, number>);

        const topCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];
        
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 20;

        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text("Subscription Report", pageWidth / 2, y, { align: "center" });
        y += 10;
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: "center" });
        y += 20;

        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text("Spending Overview", 20, y);
        y += 10;

        doc.setFillColor(240, 240, 245);
        doc.rect(20, y, pageWidth - 40, 45, "F");
        
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        
        doc.text(`Monthly Spending: ₹${totalMonthly.toFixed(2)}`, 30, y + 12);
        doc.text(`Annual Projection: ₹${annualTotal.toFixed(2)}`, 30, y + 24);
        doc.text(`Daily Cost: ₹${dailyCost.toFixed(2)}`, 30, y + 36);
        
        doc.text(`Total Subscriptions: ${subscriptions.length}`, 100, y + 12);
        doc.text(`Active: ${activeSubscriptions.length}`, 100, y + 24);
        doc.text(`Inactive: ${subscriptions.length - activeSubscriptions.length}`, 100, y + 36);
        
        y += 55;

        if (topCategory) {
            doc.setFontSize(16);
            doc.setTextColor(40, 40, 40);
            doc.text("Top Category", 20, y);
            y += 10;
            
            const totalCategoryAmount = Object.values(categoryBreakdown).reduce((a, b) => a + b, 0);
            const topCategoryPercent = ((topCategory[1] / totalCategoryAmount) * 100).toFixed(0);
            
            doc.setFontSize(12);
            doc.text(`${topCategory[0]}: ₹${topCategory[1].toFixed(2)}/month (${topCategoryPercent}%)`, 30, y);
            y += 15;
        }

        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text("Category Breakdown", 20, y);
        y += 10;

        const sortedCategories = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]);
        const colors = [
            [136, 132, 216], [130, 202, 157], [255, 198, 88], [255, 115, 0], [0, 136, 254],
            [0, 196, 159], [255, 187, 40], [255, 128, 66], [164, 222, 108], [208, 237, 87]
        ];
        
        const total = Object.values(categoryBreakdown).reduce((a, b) => a + b, 0);
        const maxBarWidth = 80;
        
        sortedCategories.slice(0, 6).forEach(([category, value], index) => {
            const percent = (value / total) * 100;
            const barWidth = (percent / 100) * maxBarWidth;
            
            doc.setFillColor(colors[index][0], colors[index][1], colors[index][2]);
            doc.rect(30, y, barWidth, 6, "F");
            
            doc.setFontSize(9);
            doc.setTextColor(60, 60, 60);
            doc.text(`${category}`, 35, y + 4);
            doc.text(`₹${value.toFixed(0)}/mo (${percent.toFixed(0)}%)`, 115, y + 4);
            
            y += 10;
        });
        
        y += 10;

        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text("Active Subscriptions", 20, y);
        y += 10;

        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text("Name", 20, y);
        doc.text("Amount", 70, y);
        doc.text("Cycle", 100, y);
        doc.text("Category", 130, y);
        doc.text("Status", 170, y);
        
        doc.setDrawColor(200, 200, 200);
        doc.line(20, y + 2, 190, y + 2);
        y += 8;

        doc.setTextColor(40, 40, 40);
        activeSubscriptions.slice(0, 15).forEach(sub => {
            const name = sub.name.length > 20 ? sub.name.substring(0, 20) + "..." : sub.name;
            doc.text(name, 20, y);
            doc.text(`₹${sub.amount}`, 70, y);
            doc.text(sub.billingCycle.replace("_", " "), 100, y);
            const cat = sub.category.length > 12 ? sub.category.substring(0, 12) : sub.category;
            doc.text(cat, 130, y);
            doc.text(sub.paymentStatus, 170, y);
            y += 6;
            
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
        });

        c.header("Content-Type", "application/pdf");
        c.header("Content-Disposition", `attachment; filename="subscriptions-report-${new Date().toISOString().split('T')[0]}.pdf"`);
        
        const pdfBuffer = doc.output("arraybuffer");
        const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");
        return c.text(pdfBase64);
    });

export default app;
