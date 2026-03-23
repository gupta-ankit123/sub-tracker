"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

const features = [
    "Unlimited subscriptions",
    "Utility bill tracking",
    "Smart budgeting",
    "Safe-to-spend calculator",
    "Unused subscription detection",
    "Analytics dashboard",
    "CSV & PDF export",
    "Email reminders",
    "Payment tracking",
]

export function PricingSection() {
    return (
        <section id="pricing" className="relative py-20 md:py-28">
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
                        Pricing
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-[family-name:var(--font-plus-jakarta)]">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-base md:text-lg text-[#7A8BA8]">
                        No hidden fees. No premium tiers. Just free.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.97 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="max-w-md mx-auto"
                >
                    <div className="relative glass-card rounded-2xl p-8 gradient-border">
                        {/* Badge */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-semibold bg-[#00D4AA] text-[#0B0F1A] shadow-lg shadow-[#00D4AA]/25">
                                <Sparkles className="h-3 w-3" />
                                Most Popular
                            </span>
                        </div>

                        <div className="text-center mb-8 pt-4">
                            <h3 className="text-xl font-semibold text-white mb-4 font-[family-name:var(--font-plus-jakarta)]">
                                Free Forever
                            </h3>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-5xl md:text-6xl font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
                                    ₹0
                                </span>
                                <span className="text-[#7A8BA8] text-sm">/ month</span>
                            </div>
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mb-6" />

                        <ul className="space-y-3.5 mb-8">
                            {features.map((feature) => (
                                <li key={feature} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-[#00D4AA]/10 flex items-center justify-center shrink-0">
                                        <Check className="h-3 w-3 text-[#00D4AA]" />
                                    </div>
                                    <span className="text-sm text-[#C0CAD8]">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Button
                            className="w-full bg-[#00D4AA] hover:bg-[#00BF99] text-[#0B0F1A] font-semibold shadow-lg shadow-[#00D4AA]/20 hover:shadow-[#00D4AA]/40 transition-all duration-300"
                            size="lg"
                            asChild
                        >
                            <Link href="/sign-up">Get Started Free</Link>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
