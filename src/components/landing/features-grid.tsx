"use client"

import {
    CreditCard, Zap, Wallet, ShieldCheck,
    AlertTriangle, CheckCircle, BarChart3, Download
} from "lucide-react"
import { motion } from "framer-motion"

const features = [
    {
        icon: CreditCard,
        title: "Subscription Tracking",
        description: "Track all your OTT, music, cloud, and productivity subscriptions in one place.",
        accent: "#00D4AA",
    },
    {
        icon: Zap,
        title: "Utility Bill Management",
        description: "Monitor electricity, water, gas, and internet bills with smart bill estimation.",
        accent: "#F59E0B",
    },
    {
        icon: Wallet,
        title: "Smart Budgeting",
        description: "Set category-based monthly budgets and carry them forward automatically.",
        accent: "#8B5CF6",
    },
    {
        icon: ShieldCheck,
        title: "Safe-to-Spend",
        description: "Know exactly how much you can spend after bills and budget allocations.",
        accent: "#3B82F6",
    },
    {
        icon: AlertTriangle,
        title: "Unused Detection",
        description: "Spot subscriptions you're not using and see how much you could save.",
        accent: "#EF4444",
    },
    {
        icon: CheckCircle,
        title: "Payment Tracking",
        description: "Mark payments as paid, skip months, and get alerts on overdue bills.",
        accent: "#00D4AA",
    },
    {
        icon: BarChart3,
        title: "Analytics & Insights",
        description: "Visualize spending patterns with detailed charts and category breakdowns.",
        accent: "#3B82F6",
    },
    {
        icon: Download,
        title: "Export & Reports",
        description: "Export your subscription data as CSV or download detailed PDF reports.",
        accent: "#8B5CF6",
    },
]

export function FeaturesGrid() {
    return (
        <section id="features" className="relative py-20 md:py-28">
            {/* Background glow */}
            <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#00D4AA]/[0.02] blur-[120px] rounded-full pointer-events-none" />

            <div className="relative mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-14"
                >
                    <span className="inline-block text-xs font-medium tracking-widest uppercase text-[#00D4AA] mb-4">
                        Features
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-[family-name:var(--font-plus-jakarta)]">
                        Everything You Need to Save Money
                    </h2>
                    <p className="text-base md:text-lg text-[#7A8BA8] max-w-2xl mx-auto">
                        From tracking subscriptions to smart budgeting, SubTracker gives you complete control over your recurring expenses.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                    {features.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.5, delay: index * 0.08 }}
                                className="group glass-card glass-card-hover rounded-xl p-5 md:p-6"
                            >
                                <div
                                    className="w-11 h-11 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                                    style={{
                                        background: `${feature.accent}15`,
                                        color: feature.accent,
                                    }}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>
                                <h3 className="font-semibold text-base md:text-lg text-white mb-2 font-[family-name:var(--font-plus-jakarta)]">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-[#7A8BA8] leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
