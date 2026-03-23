"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CreditCard, BarChart3, Shield } from "lucide-react"
import { motion } from "framer-motion"

export function HeroSection() {
    return (
        <section className="relative overflow-hidden min-h-[90vh] flex items-center">
            {/* Background effects */}
            <div className="absolute inset-0">
                <div className="absolute top-[-30%] right-[-15%] w-[800px] h-[800px] rounded-full bg-[#00D4AA]/[0.04] blur-[150px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#3B82F6]/[0.04] blur-[120px]" />
                <div className="absolute top-[20%] left-[50%] w-[400px] h-[400px] rounded-full bg-[#8B5CF6]/[0.03] blur-[100px]" />
                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>

            <div className="relative mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-20 md:py-32">
                <div className="text-center max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/20 mb-8">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse" />
                            Free Forever — No Credit Card Required
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 font-[family-name:var(--font-plus-jakarta)]"
                    >
                        Take Control of Your{" "}
                        <span className="bg-gradient-to-r from-[#00D4AA] to-[#00E4BB] bg-clip-text text-transparent">
                            Subscriptions
                        </span>{" "}
                        &{" "}
                        <span className="bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent">
                            Bills
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                        className="text-base sm:text-lg md:text-xl text-[#7A8BA8] mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        Track OTT subscriptions, manage utility bills, set smart budgets, and discover
                        how much you can safely spend each month. Built for India.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 md:mb-20"
                    >
                        <Button
                            size="lg"
                            asChild
                            className="text-base px-8 bg-[#00D4AA] hover:bg-[#00BF99] text-[#0B0F1A] font-semibold shadow-lg shadow-[#00D4AA]/25 hover:shadow-[#00D4AA]/40 transition-all duration-300"
                        >
                            <Link href="/sign-up">
                                Get Started Free
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            asChild
                            className="text-base px-8 border-white/[0.1] bg-white/[0.04] text-[#C0CAD8] hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15]"
                        >
                            <Link href="/sign-in">Sign In</Link>
                        </Button>
                    </motion.div>

                    {/* Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 60, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="relative mx-auto max-w-4xl"
                    >
                        <div className="glass-card rounded-xl p-5 sm:p-6 md:p-8 gradient-border">
                            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
                                {[
                                    {
                                        icon: CreditCard,
                                        value: "12",
                                        label: "Active Subscriptions",
                                        gradient: "from-[#00D4AA]/20 to-[#00D4AA]/5",
                                        iconColor: "text-[#00D4AA]",
                                        textColor: "text-[#00D4AA]/70",
                                    },
                                    {
                                        icon: BarChart3,
                                        value: "₹4,850",
                                        label: "Monthly Spend",
                                        gradient: "from-[#3B82F6]/20 to-[#3B82F6]/5",
                                        iconColor: "text-[#3B82F6]",
                                        textColor: "text-[#3B82F6]/70",
                                    },
                                    {
                                        icon: Shield,
                                        value: "₹32,150",
                                        label: "Safe to Spend",
                                        gradient: "from-[#8B5CF6]/20 to-[#8B5CF6]/5",
                                        iconColor: "text-[#8B5CF6]",
                                        textColor: "text-[#8B5CF6]/70",
                                    },
                                ].map((card) => {
                                    const Icon = card.icon
                                    return (
                                        <div
                                            key={card.label}
                                            className={`rounded-lg bg-gradient-to-br ${card.gradient} border border-white/[0.06] p-3 sm:p-4 text-left`}
                                        >
                                            <Icon className={`h-4 w-4 sm:h-5 sm:w-5 mb-2 ${card.iconColor}`} />
                                            <p className="text-lg sm:text-2xl font-bold text-white">{card.value}</p>
                                            <p className={`text-[10px] sm:text-xs ${card.textColor}`}>{card.label}</p>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                                {[
                                    { name: "Netflix", amount: "₹199", status: "Paid", statusColor: "bg-[#00D4AA]/10 text-[#00D4AA]" },
                                    { name: "Spotify", amount: "₹119", status: "Due in 3 days", statusColor: "bg-[#F59E0B]/10 text-[#F59E0B]" },
                                    { name: "AWS", amount: "₹2,500", status: "Pending", statusColor: "bg-[#EF4444]/10 text-[#EF4444]" },
                                ].map((item) => (
                                    <div
                                        key={item.name}
                                        className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]"
                                    >
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-[#00D4AA]/10 flex items-center justify-center text-xs sm:text-sm font-bold text-[#00D4AA]">
                                                {item.name[0]}
                                            </div>
                                            <span className="font-medium text-xs sm:text-sm text-white">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <span className="font-semibold text-xs sm:text-sm text-white">{item.amount}</span>
                                            <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full ${item.statusColor}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Fade-out at bottom */}
                        <div className="absolute -bottom-1 left-0 right-0 h-20 bg-gradient-to-t from-[#0B0F1A] to-transparent pointer-events-none" />
                        {/* Glow behind card */}
                        <div className="absolute -inset-10 bg-[#00D4AA]/[0.03] blur-[80px] rounded-full -z-10" />
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
