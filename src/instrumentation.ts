export async function register() {
    // Only run the cron scheduler on the server (not during build or in the browser)
    if (process.env.NEXT_RUNTIME === "nodejs") {
        const cron = await import("node-cron");
        const { sendReminders } = await import("@/lib/send-reminders");

        // Run daily at 8:00 AM IST (2:30 AM UTC)
        // Cron format: minute hour * * * (UTC)
        cron.default.schedule("30 2 * * *", async () => {
            console.log("[Cron] Running daily bill reminders...");
            try {
                const result = await sendReminders();
                console.log(
                    `[Cron] Reminders sent: ${result.reminders}, Overdue alerts: ${result.overdueAlerts}, Subscriptions checked: ${result.totalSubscriptionsChecked}`
                );
            } catch (error) {
                console.error("[Cron] Failed to send reminders:", error);
            }
        });

        console.log("[Cron] Bill reminder scheduler started (daily at 8:00 AM IST)");
    }
}
