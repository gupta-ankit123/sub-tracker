import { NextRequest, NextResponse } from "next/server";
import { sendReminders } from "@/lib/send-reminders";

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await sendReminders();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Cron reminder error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
