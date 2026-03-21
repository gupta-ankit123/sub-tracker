import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, BarChart3, CreditCard, Shield } from "lucide-react"

export function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white">
            <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-20 md:py-32">
                <div className="text-center max-w-3xl mx-auto">
                    <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
                        Free Forever
                    </Badge>

                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
                        Take Control of Your{" "}
                        <span className="text-primary">Subscriptions</span> &{" "}
                        <span className="text-primary">Bills</span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Track OTT subscriptions, manage utility bills, set smart budgets, and discover how much you can safely spend each month. Built for India.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <Button size="lg" asChild className="text-base px-8">
                            <Link href="/sign-up">
                                Get Started Free
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild className="text-base px-8">
                            <Link href="/sign-in">Sign In</Link>
                        </Button>
                    </div>

                    {/* Dashboard Preview */}
                    <div className="relative mx-auto max-w-4xl">
                        <div className="rounded-xl border bg-white shadow-2xl p-6 md:p-8">
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-4 text-white text-left">
                                    <CreditCard className="h-5 w-5 mb-2 opacity-80" />
                                    <p className="text-2xl font-bold">12</p>
                                    <p className="text-xs text-blue-100">Active Subscriptions</p>
                                </div>
                                <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-4 text-white text-left">
                                    <BarChart3 className="h-5 w-5 mb-2 opacity-80" />
                                    <p className="text-2xl font-bold">₹4,850</p>
                                    <p className="text-xs text-purple-100">Monthly Spend</p>
                                </div>
                                <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-4 text-white text-left">
                                    <Shield className="h-5 w-5 mb-2 opacity-80" />
                                    <p className="text-2xl font-bold">₹32,150</p>
                                    <p className="text-xs text-green-100">Safe to Spend</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { name: "Netflix", amount: "₹199", status: "Paid", color: "bg-green-100 text-green-700" },
                                    { name: "Spotify", amount: "₹119", status: "Due in 3 days", color: "bg-yellow-100 text-yellow-700" },
                                    { name: "AWS", amount: "₹2,500", status: "Pending", color: "bg-orange-100 text-orange-700" },
                                ].map((item) => (
                                    <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                                {item.name[0]}
                                            </div>
                                            <span className="font-medium text-sm">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-sm">{item.amount}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${item.color}`}>{item.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="absolute -inset-4 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none" />
                    </div>
                </div>
            </div>
        </section>
    )
}
