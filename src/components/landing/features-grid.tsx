import {
    Wallet, Receipt, BarChart3, PiggyBank,
    Home, CreditCard, TrendingUp, Download
} from "lucide-react"

const features = [
    {
        icon: Wallet,
        title: "Subscription Tracking",
        description: "Automatically detect and organize all your recurring digital services in one view.",
    },
    {
        icon: Receipt,
        title: "Utility Bills",
        description: "Manage electricity, water, and internet bills with smart reminder notifications.",
    },
    {
        icon: BarChart3,
        title: "Smart Budgeting",
        description: "AI-driven categories that help you understand where every cent is flowing.",
    },
    {
        icon: PiggyBank,
        title: "Safe-to-Spend",
        description: "Know exactly how much you can spend after upcoming bills are accounted for.",
    },
    {
        icon: Home,
        title: "Unused Detection",
        description: "We alert you about subscriptions you pay for but haven't used in over 30 days.",
    },
    {
        icon: CreditCard,
        title: "Payment Tracking",
        description: "Historical view of all payments made across all your linked accounts.",
    },
    {
        icon: TrendingUp,
        title: "Analytics Dashboard",
        description: "Beautifully rendered charts showing your spending trends over months.",
    },
    {
        icon: Download,
        title: "Data Export",
        description: "Export your spending data to CSV or PDF for accounting and taxes.",
    },
]

export function FeaturesGrid() {
    return (
        <section id="features" className="py-24 px-6 bg-[#171b27]/30">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-plus-jakarta)] font-bold mb-4">
                        Powerful Features
                    </h2>
                    <div className="w-20 h-1 bg-[#46f1c5] mx-auto rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature) => {
                        const Icon = feature.icon
                        return (
                            <div
                                key={feature.title}
                                className="bg-[#1b1f2b] p-8 rounded-xl hover:bg-[#313441] transition-all border border-transparent hover:border-[#46f1c5]/20"
                            >
                                <Icon className="h-9 w-9 text-[#46f1c5] mb-6" />
                                <h3 className="text-xl font-bold font-[family-name:var(--font-plus-jakarta)] mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-[#bacac2] text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
