import Link from "next/link"
import { Check } from "lucide-react"

const features = [
    "Unlimited Subscriptions",
    "Utility Bill Tracking",
    "Monthly Insights Reports",
    "Smart Push Notifications",
    "Budget Management",
    "CSV & PDF Export",
]

export function PricingSection() {
    return (
        <section id="pricing" className="py-24 px-6 relative">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-plus-jakarta)] font-bold mb-12">
                    One Simple Plan
                </h2>

                <div className="bg-[rgba(49,52,65,0.4)] backdrop-blur-[16px] p-10 md:p-16 rounded-3xl border border-white/10 relative overflow-hidden">
                    {/* Accent orb */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#46f1c5]/10 rounded-full blur-3xl" />

                    <h3 className="text-2xl font-bold mb-2 relative z-10">Free Forever</h3>
                    <div className="flex items-center justify-center gap-2 mb-8 relative z-10">
                        <span className="text-5xl font-black font-[family-name:var(--font-plus-jakarta)] text-[#46f1c5]">
                            ₹0
                        </span>
                        <span className="text-[#bacac2]">/mo</span>
                    </div>

                    <ul className="text-left space-y-5 max-w-xs mx-auto mb-12 relative z-10">
                        {features.map((feature) => (
                            <li key={feature} className="flex items-center gap-3">
                                <Check className="w-5 h-5 text-[#46f1c5] shrink-0" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <Link
                        href="/sign-up"
                        className="relative z-10 inline-block w-full max-w-sm bg-[#00d4aa] text-[#005643] py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all text-center"
                    >
                        Start Your Journey
                    </Link>
                </div>
            </div>
        </section>
    )
}
