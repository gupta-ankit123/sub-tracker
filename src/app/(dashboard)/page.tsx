import { getCurrent } from "@/features/auth/action";
import { redirect } from "next/navigation";
import { DashboardContent } from "@/features/subscriptions/components/dashboard-content";

export default async function DashboardPage() {
    const user = await getCurrent();
    if (!user) {
        redirect('/sign-in')
    }
    return <DashboardContent userName={user.name} />;
}
