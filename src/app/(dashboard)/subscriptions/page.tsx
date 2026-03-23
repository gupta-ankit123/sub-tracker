import { getCurrent } from "@/features/auth/action";
import { redirect } from "next/navigation";
import { SubscriptionList } from "@/features/subscriptions/components/subscription-list";

export default async function SubscriptionsPage() {
    const user = await getCurrent();
    if (!user) {
        redirect('/sign-in')
    }
    return (
        <div className="h-full p-4 md:p-10 overflow-auto">
            <div className="max-w-7xl mx-auto">
                {/* Hero Header with Breadcrumb */}
                <header className="flex flex-col sm:flex-row justify-between sm:items-end mb-12 gap-6">
                    <div>
                        <nav className="flex gap-2 text-xs font-bold text-[#7A8BA8] uppercase tracking-widest mb-4">
                            <span className="hover:text-[#00D4AA] cursor-pointer transition-colors">Dashboard</span>
                            <span>/</span>
                            <span className="text-[#00D4AA]">Subscriptions</span>
                        </nav>
                        <h1 className="text-4xl sm:text-5xl font-extrabold font-[family-name:var(--font-plus-jakarta)] tracking-tighter text-white">
                            Subscriptions
                        </h1>
                        <p className="text-[#7A8BA8] mt-3 max-w-lg">
                            Manage your digital ecosystem. Track all your active services and recurring payments in one place.
                        </p>
                    </div>
                </header>

                <SubscriptionList />
            </div>
        </div>
    );
}
