"use client"

import { motion } from "framer-motion"

const stats = [
    { value: "10,000+", label: "Subscriptions Tracked" },
    { value: "₹50L+", label: "Money Saved" },
    { value: "5,000+", label: "Happy Users" },
    { value: "99.9%", label: "Uptime" },
]

export function StatsSection() {
    return (
        <section className="relative py-16 md:py-20">
            {/* Top/bottom dividers */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#00D4AA]/[0.02] via-transparent to-[#3B82F6]/[0.02]" />

            <div className="relative mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="text-center"
                        >
                            <p className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-2 font-[family-name:var(--font-plus-jakarta)]">
                                {stat.value}
                            </p>
                            <p className="text-xs md:text-sm text-[#7A8BA8] tracking-wide uppercase">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
