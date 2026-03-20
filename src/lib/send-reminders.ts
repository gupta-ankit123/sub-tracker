import { prisma } from "@/lib/db";
import { resend } from "@/lib/resend";
import { billReminderEmailHtml, overdueAlertEmailHtml } from "@/lib/email-templates";

export async function sendReminders() {
    const now = new Date();
    let remindersSent = 0;
    let overdueAlertsSent = 0;

    const activeSubscriptions = await prisma.subscription.findMany({
        where: {
            status: "ACTIVE",
            user: { emailNotifications: true },
        },
        include: { user: true },
    });

    for (const sub of activeSubscriptions) {
        const nextBilling = new Date(sub.nextBillingDate);
        const daysUntilDue = Math.ceil(
            (nextBilling.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // --- Bill Reminders ---
        if (daysUntilDue > 0 && daysUntilDue <= sub.reminderDays) {
            const alreadySent = await prisma.sentNotification.findFirst({
                where: {
                    subscriptionId: sub.id,
                    type: "BILL_REMINDER",
                    sentAt: {
                        gte: new Date(nextBilling.getFullYear(), nextBilling.getMonth(), 1),
                    },
                },
            });

            if (!alreadySent) {
                const amount = `${sub.currency} ${Number(sub.amount).toFixed(0)}`;
                const dueDate = nextBilling.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                });

                const emailResult = await resend.emails.send({
                    from: process.env.EMAIL_FROM!,
                    to: sub.user.email,
                    subject: `Reminder: ${sub.name} payment due in ${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"}`,
                    html: billReminderEmailHtml({
                        userName: sub.user.name,
                        subscriptionName: sub.name,
                        amount,
                        dueDate,
                        daysUntilDue,
                    }),
                });

                if (!emailResult.error) {
                    await prisma.sentNotification.create({
                        data: {
                            userId: sub.userId,
                            subscriptionId: sub.id,
                            type: "BILL_REMINDER",
                            channel: "EMAIL",
                            metadata: JSON.stringify({
                                amount: Number(sub.amount),
                                dueDate: sub.nextBillingDate.toISOString(),
                                daysUntilDue,
                            }),
                        },
                    });
                    remindersSent++;
                } else {
                    console.error(
                        `Failed to send reminder for ${sub.name} to ${sub.user.email}:`,
                        emailResult.error
                    );
                }
            }
        }

        // --- Overdue Alerts ---
        if (
            daysUntilDue < 0 &&
            sub.paymentStatus !== "SUCCESS" &&
            sub.paymentStatus !== "SKIPPED"
        ) {
            const daysOverdue = Math.abs(daysUntilDue);

            const alreadySentOverdue = await prisma.sentNotification.findFirst({
                where: {
                    subscriptionId: sub.id,
                    type: "OVERDUE_ALERT",
                    sentAt: {
                        gte: new Date(nextBilling.getFullYear(), nextBilling.getMonth(), 1),
                    },
                },
            });

            if (!alreadySentOverdue) {
                const amount = `${sub.currency} ${Number(sub.amount).toFixed(0)}`;
                const dueDate = nextBilling.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                });

                const emailResult = await resend.emails.send({
                    from: process.env.EMAIL_FROM!,
                    to: sub.user.email,
                    subject: `Overdue: ${sub.name} payment was due ${daysOverdue} day${daysOverdue === 1 ? "" : "s"} ago`,
                    html: overdueAlertEmailHtml({
                        userName: sub.user.name,
                        subscriptionName: sub.name,
                        amount,
                        dueDate,
                        daysOverdue,
                    }),
                });

                if (!emailResult.error) {
                    await prisma.sentNotification.create({
                        data: {
                            userId: sub.userId,
                            subscriptionId: sub.id,
                            type: "OVERDUE_ALERT",
                            channel: "EMAIL",
                            metadata: JSON.stringify({
                                amount: Number(sub.amount),
                                dueDate: sub.nextBillingDate.toISOString(),
                                daysOverdue,
                            }),
                        },
                    });
                    overdueAlertsSent++;
                } else {
                    console.error(
                        `Failed to send overdue alert for ${sub.name} to ${sub.user.email}:`,
                        emailResult.error
                    );
                }
            }
        }
    }

    return {
        success: true,
        reminders: remindersSent,
        overdueAlerts: overdueAlertsSent,
        totalSubscriptionsChecked: activeSubscriptions.length,
    };
}
