"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
    {
        question: "Is my data secure with SubTracker?",
        answer: "Yes, we use bank-level 256-bit encryption and never store your login credentials. Your data is your own.",
    },
    {
        question: "How does auto-detection work?",
        answer: "Our algorithm scans your transaction history for recurring merchants and billing patterns to identify subscriptions.",
    },
    {
        question: "Can I cancel subscriptions through the app?",
        answer: "SubTracker helps you identify and track subscriptions. To cancel, we provide direct links to each service's cancellation page.",
    },
    {
        question: "Does it support international banks?",
        answer: "Currently we support Indian banks and payment methods. International support is on our roadmap.",
    },
    {
        question: "What happens if a subscription is missed?",
        answer: "You'll receive email notifications before bills are due and alerts when payments are overdue, so you never miss a payment.",
    },
    {
        question: "Are there any hidden fees?",
        answer: "No, SubTracker is completely free. All features including analytics, budgeting, and export are available at no cost.",
    },
]

export function FaqSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    return (
        <section id="faq" className="py-24 px-6">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-plus-jakarta)] font-bold mb-16 text-center">
                    Frequently Asked Questions
                </h2>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={faq.question} className="bg-[#1b1f2b] rounded-xl overflow-hidden">
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full p-6 text-left font-bold flex justify-between items-center group cursor-pointer"
                            >
                                {faq.question}
                                <ChevronDown
                                    className={`w-5 h-5 text-[#46f1c5] transition-transform duration-300 shrink-0 ml-4 ${
                                        openIndex === index ? "rotate-180" : ""
                                    }`}
                                />
                            </button>
                            {openIndex === index && (
                                <div className="px-6 pb-6 text-[#bacac2] text-sm">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
