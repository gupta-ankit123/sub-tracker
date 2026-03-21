"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus, Copy } from "lucide-react"
import { useBudgets } from "../api/use-budgets"
import { SafeToSpendCard } from "./safe-to-spend-card"
import { BudgetFormDialog } from "./budget-form-dialog"
import { BudgetCategoryCard } from "./budget-category-card"
import { CarryForwardDialog } from "./carry-forward-dialog"
import { BudgetAnalyticsSection } from "./budget-analytics-section"

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
        <div className="h-full bg-neutral-500/5 p-4 md:p-8 overflow-auto">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Budgets</h1>
                        <p className="text-muted-foreground mt-1">Track your spending against budgets.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <CarryForwardDialog currentMonth={month}>
                            <Button variant="outline" size="sm">
                                <Copy className="h-4 w-4 mr-1" />Carry Forward
                            </Button>
                        </CarryForwardDialog>
                        <BudgetFormDialog month={month}>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-1" />Add Budget
                            </Button>
                        </BudgetFormDialog>
                    </div>
                </div>

                {/* Month selector */}
                <div className="flex items-center justify-center gap-4">
                    <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <span className="text-lg font-semibold min-w-[180px] text-center">
                        {formatMonthDisplay(currentDate)}
                    </span>
                    <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>

                {/* Safe to spend */}
                <SafeToSpendCard month={month} />

                {/* Budget cards grid */}
                {isLoading ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-6 bg-white rounded-lg border">
                                <div className="h-28 bg-gray-200 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                ) : budgets.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border">
                        <p className="text-muted-foreground mb-2">No budgets for this month yet.</p>
                        <BudgetFormDialog month={month}>
                            <Button><Plus className="h-4 w-4 mr-1" />Create Your First Budget</Button>
                        </BudgetFormDialog>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

                {/* Analytics */}
                <BudgetAnalyticsSection />
            </div>
        </div>
    )
}
