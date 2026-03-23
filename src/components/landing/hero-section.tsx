import Link from "next/link"
import { CreditCard, BarChart3, Shield } from "lucide-react"

export function HeroSection() {
    return (
        <section className="relative pt-40 pb-20 px-6 overflow-hidden">
            {/* Background orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#46f1c5]/20 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#c6afff]/10 rounded-full blur-[120px] -z-10" />

            <div className="max-w-7xl mx-auto text-center relative z-10">
                <h1 className="text-5xl md:text-7xl font-extrabold font-[family-name:var(--font-plus-jakarta)] leading-tight tracking-tight mb-6">
                    Track Every Subscription.
                    <br />
                    <span className="text-[#46f1c5]">Save More Money.</span>
                </h1>
                <p className="text-[#bacac2] text-lg md:text-xl max-w-2xl mx-auto mb-10">
                    Stop losing money to forgotten trials and duplicate services. The luminous way to manage your digital ecosystem.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
                    <Link
                        href="/sign-up"
                        className="bg-[#00d4aa] text-[#005643] px-8 py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_30px_rgba(70,241,197,0.3)] transition-all active:scale-95 text-center"
                    >
                        Get Started Free
                    </Link>
                    <Link
                        href="/sign-in"
                        className="border border-[#3b4a44] bg-[#0f131e]/20 backdrop-blur-md px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/5 transition-all text-center"
                    >
                        Sign In
                    </Link>
                </div>

                {/* Dashboard Preview */}
                <div className="relative max-w-5xl mx-auto">
                    <div className="bg-[rgba(49,52,65,0.4)] backdrop-blur-[16px] p-4 sm:p-6 rounded-2xl border border-white/10 shadow-2xl">
                        {/* Stat cards */}
                        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5">
                            {[
                                { icon: CreditCard, value: "12", label: "Active Subscriptions", color: "#46f1c5" },
                                { icon: BarChart3, value: "₹4,850", label: "Monthly Spend", color: "#adc6ff" },
                                { icon: Shield, value: "₹32,150", label: "Safe to Spend", color: "#c6afff" },
                            ].map((card) => {
                                const Icon = card.icon
                                return (
                                    <div
                                        key={card.label}
                                        className="rounded-xl bg-[#1b1f2b] border border-white/5 p-3 sm:p-4 text-left"
                                    >
                                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 mb-2" style={{ color: card.color }} />
                                        <p className="text-lg sm:text-2xl font-bold text-white">{card.value}</p>
                                        <p className="text-[10px] sm:text-xs text-[#bacac2]">{card.label}</p>
                                    </div>
                                )
                            })}
                        </div>
                        {/* Mock subscription rows */}
                        <div className="space-y-2">
                            {[
                                { name: "Netflix", amount: "₹199", status: "Paid", statusBg: "bg-[#46f1c5]/10 text-[#46f1c5]" },
                                { name: "Spotify", amount: "₹119", status: "Due in 3 days", statusBg: "bg-[#f59e0b]/10 text-[#f59e0b]" },
                                { name: "AWS", amount: "₹2,500", status: "Pending", statusBg: "bg-[#ef4444]/10 text-[#ef4444]" },
                            ].map((item) => (
                                <div
                                    key={item.name}
                                    className="flex items-center justify-between p-3 rounded-xl bg-[#0a0e19]/50 border border-white/5"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#46f1c5]/10 flex items-center justify-center text-sm font-bold text-[#46f1c5]">
                                            {item.name[0]}
                                        </div>
                                        <span className="font-medium text-sm text-white">{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-sm text-white">{item.amount}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.statusBg}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
