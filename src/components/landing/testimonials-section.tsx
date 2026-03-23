import { Star } from "lucide-react"

const testimonials = [
    {
        name: "Arjun Sharma",
        location: "Mumbai, India",
        initials: "AS",
        quote: "I found three Netflix accounts being charged to different cards. SubTracker saved me ₹1,500/month instantly.",
        gradient: "from-[#46f1c5] to-[#0566d9]",
    },
    {
        name: "Ananya Patel",
        location: "Bangalore, India",
        initials: "AP",
        quote: "The clean UI makes financial planning actually fun. Best tool for keeping track of all those hidden SaaS costs.",
        gradient: "from-[#c6afff] to-[#0566d9]",
    },
    {
        name: "Rohan Gupta",
        location: "Delhi, India",
        initials: "RG",
        quote: "Highly recommend for students. Helps you stay on top of gym, hosting, and streaming bills effortlessly.",
        gradient: "from-[#f59e0b] to-[#ef4444]",
    },
]

export function TestimonialsSection() {
    return (
        <section className="py-24 px-6 bg-[#171b27]/50">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-plus-jakarta)] font-bold mb-16 text-center">
                    User Stories
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t) => (
                        <div
                            key={t.name}
                            className="bg-[#1b1f2b] p-8 rounded-2xl border border-white/5"
                        >
                            {/* Stars */}
                            <div className="flex gap-1 text-[#46f1c5] mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-current" />
                                ))}
                            </div>

                            <p className="italic text-[#dfe2f2] mb-8">
                                &ldquo;{t.quote}&rdquo;
                            </p>

                            <div className="flex items-center gap-4">
                                <div
                                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-sm font-bold`}
                                >
                                    {t.initials}
                                </div>
                                <div>
                                    <p className="font-bold">{t.name}</p>
                                    <p className="text-xs text-[#bacac2]">{t.location}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
