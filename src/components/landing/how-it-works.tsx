"use client"

import { UserPlus, ListPlus, TrendingDown } from "lucide-react"
import { motion } from "framer-motion"

const steps = [
    {
        number: "01",
        icon: UserPlus,
        title: "Sign Up Free",
        description: "Create your free account in 30 seconds. No credit card required, no hidden charges.",
    },
    {
        number: "02",
        icon: ListPlus,
        title: "Add Your Bills",
        description: "Add your subscriptions, utility bills, and set monthly budgets for each spending category.",
    },
    {
        number: "03",
        icon: TrendingDown,
        title: "Track & Save",
        description: "Get insights, detect unused services, track payments, and know your safe-to-spend amount.",
    },
]

export function HowItWorks() {
    return (
        <section id="how-it-works" className="relative py-20 md:py-28">
            {/* Subtle divider at top */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

            <div className="relative mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-14"
                >
                    <span className="inline-block text-xs font-medium tracking-widest uppercase text-[#00D4AA] mb-4">
                        How It Works
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-[family-name:var(--font-plus-jakarta)]">
                        Get Started in Minutes
                    </h2>
                    <p className="text-base md:text-lg text-[#7A8BA8] max-w-2xl mx-auto">
                        Three simple steps to take control of your finances.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
                    {/* Connecting line (desktop only) */}
                    <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-px bg-gradient-to-r from-[#00D4AA]/30 via-[#3B82F6]/30 to-[#8B5CF6]/30" />

                    {steps.map((step, index) => {
                        const Icon = step.icon
                        return (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.5, delay: index * 0.15 }}
                                className="text-center relative"
                            >
                                {/* Step number circle */}
                                <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#00D4AA]/20 to-[#3B82F6]/10 border border-[#00D4AA]/20 mb-6 z-10">
                                    <span className="text-lg font-bold text-[#00D4AA] font-[family-name:var(--font-plus-jakarta)]">
                                        {step.number}
                                    </span>
                                    {/* Glow ring */}
                                    <div className="absolute inset-0 rounded-full bg-[#00D4AA]/10 blur-md -z-10" />
                                </div>

                                <div className="mb-3">
                                    <Icon className="h-5 w-5 mx-auto text-[#7A8BA8]" />
                                </div>
                                <h3 className="font-semibold text-xl text-white mb-2 font-[family-name:var(--font-plus-jakarta)]">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-[#7A8BA8] max-w-xs mx-auto leading-relaxed">
                                    {step.description}
                                </p>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
