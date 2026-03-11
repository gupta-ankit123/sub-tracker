import { getCurrent } from "@/features/auth/action";
import { redirect } from "next/navigation";
import { SubscriptionList } from "@/features/subscriptions/components/subscription-list";

export default async function SubscriptionsPage() {
    const user = await getCurrent();
    if (!user) {
        redirect('/sign-in')
    }
    return (
        <div className="h-full bg-neutral-500/5 p-4 md:p-8 overflow-auto">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">All Subscriptions</h1>
                    <p className="text-muted-foreground mt-1">Manage all your subscriptions in one place.</p>
                </div>
                <SubscriptionList />
            </div>
        </div>
    );
}
