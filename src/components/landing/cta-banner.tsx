import Link from "next/link"

export function CtaBanner() {
    return (
        <section className="py-20 px-6 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#46f1c5]/[0.05] blur-[120px] rounded-full" />

            <div className="relative max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-plus-jakarta)] font-bold mb-4">
                    Start Saving Money Today
                </h2>
                <p className="text-[#bacac2] text-lg mb-8 max-w-xl mx-auto">
                    Join thousands of users who are already tracking their subscriptions and taking control of their finances.
                </p>
                <Link
                    href="/sign-up"
                    className="inline-block bg-[#00d4aa] text-[#005643] px-8 py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_30px_rgba(70,241,197,0.3)] transition-all active:scale-95"
                >
                    Get Started Free
                </Link>
            </div>
        </section>
    )
}
