"use client"

import { motion } from "framer-motion"
import { Quote } from "lucide-react"

const testimonials = [
    {
        name: "Rahul S.",
        location: "Mumbai",
        initials: "RS",
        gradientFrom: "#00D4AA",
        gradientTo: "#3B82F6",
        quote: "I was paying for 4 streaming services I barely used. SubTracker helped me identify and cancel them, saving me over ₹1,500/month!",
    },
    {
        name: "Priya M.",
        location: "Bangalore",
        initials: "PM",
        gradientFrom: "#8B5CF6",
        gradientTo: "#3B82F6",
        quote: "The budgeting feature is a game-changer. I finally know how much I can safely spend each month after all my bills and subscriptions.",
    },
    {
        name: "Arjun K.",
        location: "Delhi",
        initials: "AK",
        gradientFrom: "#F59E0B",
        gradientTo: "#EF4444",
        quote: "Tracking utility bills used to be a nightmare. Now I get estimates, track payments, and never miss a due date. Highly recommend!",
    },
]

export function TestimonialsSection() {
    return (
        <section className="relative py-20 md:py-28">
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
                        Testimonials
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-[family-name:var(--font-plus-jakarta)]">
                        Loved by Thousands
                    </h2>
                    <p className="text-base md:text-lg text-[#7A8BA8]">
                        See what our users have to say.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
                    {testimonials.map((t, index) => (
                        <motion.div
                            key={t.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="glass-card glass-card-hover rounded-xl p-6"
                        >
                            <Quote className="h-5 w-5 text-[#00D4AA]/40 mb-4" />
                            <p className="text-sm text-[#C0CAD8] mb-6 leading-relaxed">
                                &ldquo;{t.quote}&rdquo;
                            </p>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                    style={{
                                        background: `linear-gradient(135deg, ${t.gradientFrom}40, ${t.gradientTo}40)`,
                                    }}
                                >
                                    {t.initials}
                                </div>
                                <div>
                                    <p className="font-medium text-sm text-white">{t.name}</p>
                                    <p className="text-xs text-[#7A8BA8]">{t.location}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
