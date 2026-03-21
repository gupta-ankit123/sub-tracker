import { Card, CardContent } from "@/components/ui/card"
import {
    CreditCard, Zap, Wallet, ShieldCheck,
    AlertTriangle, CheckCircle, BarChart3, Download
} from "lucide-react"

const features = [
    {
        icon: CreditCard,
        title: "Subscription Tracking",
        description: "Track all your OTT, music, cloud, and productivity subscriptions in one place.",
        color: "text-blue-500 bg-blue-50",
    },
    {
        icon: Zap,
        title: "Utility Bill Management",
        description: "Monitor electricity, water, gas, and internet bills with smart bill estimation.",
        color: "text-yellow-500 bg-yellow-50",
    },
    {
        icon: Wallet,
        title: "Smart Budgeting",
        description: "Set category-based monthly budgets and carry them forward automatically.",
        color: "text-purple-500 bg-purple-50",
    },
    {
        icon: ShieldCheck,
        title: "Safe-to-Spend",
        description: "Know exactly how much you can spend after bills and budget allocations.",
        color: "text-green-500 bg-green-50",
    },
    {
        icon: AlertTriangle,
        title: "Unused Detection",
        description: "Spot subscriptions you're not using and see how much you could save.",
        color: "text-orange-500 bg-orange-50",
    },
    {
        icon: CheckCircle,
        title: "Payment Tracking",
        description: "Mark payments as paid, skip months, and get alerts on overdue bills.",
        color: "text-teal-500 bg-teal-50",
    },
    {
        icon: BarChart3,
        title: "Analytics & Insights",
        description: "Visualize spending patterns with detailed charts and category breakdowns.",
        color: "text-indigo-500 bg-indigo-50",
    },
    {
        icon: Download,
        title: "Export & Reports",
        description: "Export your subscription data as CSV or download detailed PDF reports.",
        color: "text-pink-500 bg-pink-50",
    },
]

export function FeaturesGrid() {
    return (
        <section id="features" className="py-20 md:py-28 bg-gray-50/50">
            <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Save Money</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        From tracking subscriptions to smart budgeting, SubTracker gives you complete control over your recurring expenses.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature) => {
                        const Icon = feature.icon
                        return (
                            <Card key={feature.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${feature.color}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
