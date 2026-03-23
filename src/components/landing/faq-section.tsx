"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const faqs = [
    {
        question: "Is SubTracker really free?",
        answer: "Yes, SubTracker is completely free to use. All features including subscription tracking, budgeting, analytics, and export are available at no cost. No credit card required.",
    },
    {
        question: "What subscriptions can I track?",
        answer: "You can track any recurring subscription including OTT platforms (Netflix, Hotstar, Prime), music streaming (Spotify, Apple Music), cloud storage, productivity tools, gaming services, and more.",
    },
    {
        question: "How does unused subscription detection work?",
        answer: "SubTracker monitors when you last marked a subscription as used. If a subscription hasn't been used beyond its expected frequency (e.g., a monthly service unused for 45+ days), it gets flagged as potentially unused with a savings estimate.",
    },
    {
        question: "Can I track utility bills too?",
        answer: "Yes! SubTracker supports tracking variable utility bills like electricity, water, gas, internet, and mobile postpaid. You can record monthly bills, get estimates based on historical data, and track payment status.",
    },
    {
        question: "Is my data secure?",
        answer: "Yes, we take security seriously. All passwords are hashed with bcrypt, sessions use secure HTTP-only JWT cookies, and your data is stored in an encrypted PostgreSQL database. We never share your data with third parties.",
    },
    {
        question: "Can I export my data?",
        answer: "Absolutely! You can export all your subscription data as a CSV file for spreadsheet analysis or download a comprehensive PDF report with spending breakdowns, category analysis, and more.",
    },
]

function FaqItem({ question, answer, isOpen, onClick }: {
    question: string
    answer: string
    isOpen: boolean
    onClick: () => void
}) {
    return (
        <div
            className={`rounded-xl border transition-all duration-300 ${
                isOpen
                    ? "border-[#00D4AA]/20 bg-white/[0.03]"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]"
            }`}
        >
            <button
                onClick={onClick}
                className="flex w-full cursor-pointer items-center justify-between p-5 text-left"
            >
                <span className="font-medium text-sm md:text-base text-white pr-4">
                    {question}
                </span>
                <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#7A8BA8] transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-[#00D4AA]" : ""
                    }`}
                />
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 text-sm text-[#7A8BA8] leading-relaxed">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export function FaqSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    return (
        <section id="faq" className="relative py-20 md:py-28">
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
                        FAQ
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-[family-name:var(--font-plus-jakarta)]">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-base md:text-lg text-[#7A8BA8]">
                        Got questions? We&apos;ve got answers.
                    </p>
                </motion.div>

                <div className="max-w-2xl mx-auto space-y-3">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={faq.question}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.4, delay: index * 0.06 }}
                        >
                            <FaqItem
                                question={faq.question}
                                answer={faq.answer}
                                isOpen={openIndex === index}
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
