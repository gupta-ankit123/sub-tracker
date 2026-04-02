"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus, Copy, Wallet } from "lucide-react"
import { useBudgets } from "../api/use-budgets"
import { SafeToSpendCard } from "./safe-to-spend-card"
import { BudgetFormDialog } from "./budget-form-dialog"
import { BudgetCategoryCard } from "./budget-category-card"
import { CarryForwardDialog } from "./carry-forward-dialog"

function getMonthString(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`
}

function formatMonthDisplay(date: Date): string {
    return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" })
}

export function BudgetPageContent() {
    const [currentDate, setCurrentDate] = useState(() => {
        const now = new Date()
        return new Date(now.getFullYear(), now.getMonth(), 1)
    })

    const month = getMonthString(currentDate)
    const { data, isLoading } = useBudgets(month)
    const budgets = data?.data || []

    const goToPrevMonth = () => {
        setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
    }
    const goToNextMonth = () => {
        setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
    }

    return (
        <div className="min-h-screen p-4 md:p-8 space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight font-[family-name:var(--font-plus-jakarta)]">
                        Budgets
                    </h1>
                    <p className="text-[#bacac2] mt-1.5 text-sm">
                        Track your spending against monthly budgets and stay on top of your finances.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <CarryForwardDialog currentMonth={month}>
                        <Button variant="outline" size="sm" className="gap-1.5 rounded-xl border-white/[0.08] bg-transparent hover:bg-white/5">
                            <Copy className="h-4 w-4" />
                            Carry Forward
                        </Button>
                    </CarryForwardDialog>
                    <BudgetFormDialog month={month}>
                        <Button size="sm" className="gap-1.5 rounded-xl bg-[#00D4AA] text-[#005643] font-bold shadow-[0_10px_20px_rgba(0,212,170,0.2)] hover:scale-95 transition-all">
                            <Plus className="h-4 w-4" />
                            Add Budget
                        </Button>
                    </BudgetFormDialog>
                </div>
            </div>

            {/* Month selector - glass pill */}
            <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.06] backdrop-blur-sm">
                    <Button variant="ghost" size="icon" onClick={goToPrevMonth} className="h-8 w-8 rounded-full hover:bg-white/[0.08]">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-semibold min-w-[160px] text-center font-[family-name:var(--font-plus-jakarta)]">
                        {formatMonthDisplay(currentDate)}
                    </span>
                    <Button variant="ghost" size="icon" onClick={goToNextMonth} className="h-8 w-8 rounded-full hover:bg-white/[0.08]">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Safe to spend */}
            <SafeToSpendCard month={month} />

            {/* Budget cards grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-6 rounded-2xl bg-[rgba(23,27,39,0.8)] border border-white/[0.05] animate-pulse">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-white/[0.06]" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-5 w-28 bg-white/[0.06] rounded" />
                                    <div className="h-3 w-20 bg-white/[0.06] rounded" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <div className="h-3 w-24 bg-white/[0.06] rounded" />
                                    <div className="h-3 w-10 bg-white/[0.06] rounded" />
                                </div>
                                <div className="h-2 w-full bg-white/[0.06] rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : budgets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl bg-[rgba(23,27,39,0.8)] border border-white/[0.05] backdrop-blur-sm">
                    <div className="w-14 h-14 rounded-2xl bg-[#00D4AA]/10 flex items-center justify-center mb-4">
                        <Wallet className="h-7 w-7 text-[#00D4AA]" />
                    </div>
                    <p className="text-[#bacac2] mb-1 text-sm font-medium">No budgets for this month yet.</p>
                    <p className="text-[#bacac2]/60 text-xs mb-5">Create a budget to start tracking your spending.</p>
                    <BudgetFormDialog month={month}>
                        <Button className="gap-1.5 rounded-xl bg-[#00D4AA] text-[#005643] font-bold shadow-[0_10px_20px_rgba(0,212,170,0.2)] hover:scale-95 transition-all">
                            <Plus className="h-4 w-4" />
                            Create Your First Budget
                        </Button>
                    </BudgetFormDialog>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {budgets.map((budget) => (
                        <BudgetCategoryCard
                            key={budget.id}
                            id={budget.id}
                            category={budget.category}
                            limit={Number(budget.limit)}
                            spent={budget.spent}
                            month={month}
                        />
                    ))}
                </div>
            )}

        </div>
    )
}
