"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IndianRupee } from "lucide-react"
import { useSafeToSpend } from "../api/use-safe-to-spend"
import { IncomeDialog } from "./income-dialog"

interface SafeToSpendCardProps {
    month?: string
}

export function SafeToSpendCard({ month }: SafeToSpendCardProps) {
    const { data, isLoading } = useSafeToSpend(month)
    const sts = data?.data

    if (isLoading) {
        return (
            <section className="relative overflow-hidden p-8 rounded-[2rem] bg-[rgba(27,31,43,0.6)] backdrop-blur-xl border border-white/[0.06] shadow-2xl">
                <div className="h-56 bg-white/[0.06] rounded animate-pulse" />
            </section>
        )
    }

    if (!sts || sts.monthlyIncome === 0) {
        return (
            <section className="relative overflow-hidden p-8 rounded-[2rem] bg-[rgba(27,31,43,0.6)] backdrop-blur-xl border border-white/[0.06] border-dashed shadow-2xl">
                <CardContent className="p-0 flex flex-col items-center justify-center text-center">
                    <IndianRupee className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="font-medium mb-1">Set your income to track safe-to-spend</p>
                    <p className="text-sm text-muted-foreground mb-3">We&apos;ll calculate how much you can safely spend each month.</p>
                    <IncomeDialog>
                        <Button>Set Monthly Income</Button>
                    </IncomeDialog>
                </CardContent>
            </section>
        )
    }

    const safeToSpend = sts.safeToSpend
    const monthlyIncome = sts.monthlyIncome
    const spent = sts.fixedBills + sts.budgetAllocations

    const percentage = monthlyIncome > 0 ? Math.round((safeToSpend / monthlyIncome) * 100) : 0
    const clampedPercentage = Math.max(0, Math.min(100, percentage))
    const strokeDashoffset = 628 - (628 * clampedPercentage / 100)

    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const currentDay = now.getDate()
    const daysLeft = daysInMonth - currentDay
    const dailyLimit = daysLeft > 0 ? safeToSpend / daysLeft : 0

    const ratio = monthlyIncome > 0 ? safeToSpend / monthlyIncome : 0
    const accentColor = ratio > 0.2 ? "#00D4AA" : ratio > 0.1 ? "#F59E0B" : "#EF4444"

    return (
        <section className="relative overflow-hidden p-8 rounded-[2rem] bg-[rgba(27,31,43,0.6)] backdrop-blur-xl border border-white/[0.06] shadow-2xl">
            {/* Glow orb */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-[#00D4AA]/10 blur-[100px] rounded-full" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                {/* Circular Progress */}
                <div className="relative w-56 h-56 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 224 224">
                        <circle
                            cx="112"
                            cy="112"
                            r="100"
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="12"
                            className="text-white/[0.06]"
                        />
                        <circle
                            cx="112"
                            cy="112"
                            r="100"
                            fill="transparent"
                            stroke={accentColor}
                            strokeWidth="12"
                            strokeDasharray="628"
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-700 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                            Safe to Spend
                        </p>
                        <h2 className="text-4xl font-black mt-1">
                            {safeToSpend >= 0 ? "\u20B9" : "-\u20B9"}
                            {Math.abs(safeToSpend).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </h2>
                        <p className="text-xs font-bold mt-1" style={{ color: accentColor }}>
                            {clampedPercentage}% Remaining
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground font-medium">Total Budget</p>
                        <p className="text-2xl font-bold">
                            {"\u20B9"}{monthlyIncome.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground font-medium">Spent so far</p>
                        <p className="text-2xl font-bold text-[#ffb4ab]">
                            {"\u20B9"}{spent.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground font-medium">Days Left</p>
                        <p className="text-2xl font-bold">
                            {daysLeft} {daysLeft === 1 ? "Day" : "Days"}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground font-medium">Daily Limit</p>
                        <p className="text-2xl font-bold text-[#00D4AA]">
                            {"\u20B9"}{Math.max(0, dailyLimit).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Edit Income button */}
            <div className="relative z-10 mt-6 flex justify-end">
                <IncomeDialog currentIncome={sts.monthlyIncome}>
                    <Button variant="outline" size="sm">Edit Income</Button>
                </IncomeDialog>
            </div>
        </section>
    )
}
