"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export function CtaBanner() {
    return (
        <section className="relative py-20 md:py-28 overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#00D4AA]/[0.06] via-transparent to-[#3B82F6]/[0.04]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#00D4AA]/[0.05] blur-[120px] rounded-full" />
            </div>

            <div className="relative mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-[family-name:var(--font-plus-jakarta)]">
                        Start Saving Money Today
                    </h2>
                    <p className="text-base md:text-lg text-[#7A8BA8] mb-8 max-w-xl mx-auto">
                        Join thousands of users who are already tracking their subscriptions and taking control of their finances.
                    </p>
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
                </motion.div>
            </div>
        </section>
    )
}
