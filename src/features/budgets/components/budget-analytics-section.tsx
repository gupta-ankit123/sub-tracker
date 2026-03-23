"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import { useBudgetAnalytics } from "../api/use-budget-analytics"
import { cn } from "@/lib/utils"

function getCategoryColor(index: number): string {
    const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#a4de6c", "#d0ed57"]
    return colors[index % colors.length]
}

export function BudgetAnalyticsSection({ months = 6 }: { months?: number }) {
    const { data, isLoading } = useBudgetAnalytics(months)
    const analytics = data?.data || []

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="h-40 bg-white/[0.06] rounded animate-pulse" />
                </CardContent>
            </Card>
        )
    }

    // Get the current month (last entry) for the bar chart
    const currentMonthData = analytics[analytics.length - 1]
    if (!currentMonthData || currentMonthData.categories.length === 0) return null

    const maxValue = Math.max(
        ...currentMonthData.categories.map((c) => Math.max(c.limit, c.spent)),
        1
    )

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Budget vs Actual
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {currentMonthData.categories.map((cat, i) => {
                    const overspent = cat.spent > cat.limit
                    return (
                        <div key={cat.category} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">{cat.category}</span>
                                <span className={cn(overspent ? "text-[#EF4444] font-medium" : "text-muted-foreground")}>
                                    ₹{cat.spent.toLocaleString("en-IN")} / ₹{cat.limit.toLocaleString("en-IN")}
                                </span>
                            </div>
                            <div className="relative h-5 bg-white/[0.06] rounded-full overflow-hidden">
                                <div
                                    className="absolute inset-y-0 left-0 bg-white/[0.1] rounded-full"
                                    style={{ width: `${(cat.limit / maxValue) * 100}%` }}
                                />
                                <div
                                    className={cn(
                                        "absolute inset-y-0 left-0 rounded-full",
                                        overspent ? "bg-[#EF4444]" : "bg-opacity-80"
                                    )}
                                    style={{
                                        width: `${(cat.spent / maxValue) * 100}%`,
                                        backgroundColor: overspent ? undefined : getCategoryColor(i),
                                    }}
                                />
                            </div>
                        </div>
                    )
                })}

                {/* Month-over-month adherence */}
                {analytics.length > 1 && (
                    <div className="pt-4 border-t">
                        <p className="text-sm font-medium mb-2">Monthly Adherence Trend</p>
                        <div className="flex items-end gap-1 h-16">
                            {analytics.map((m, i) => {
                                const adherence = m.totalLimit > 0
                                    ? Math.min((1 - (m.totalSpent - m.totalLimit) / m.totalLimit) * 100, 100)
                                    : 100
                                const clampedAdherence = Math.max(adherence, 0)
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                        <div
                                            className={cn(
                                                "w-full rounded-t",
                                                clampedAdherence >= 70 ? "bg-[#00D4AA]" : clampedAdherence >= 40 ? "bg-[#F59E0B]" : "bg-[#EF4444]"
                                            )}
                                            style={{ height: `${clampedAdherence}%` }}
                                        />
                                        <span className="text-[10px] text-muted-foreground">
                                            {new Date(m.month).toLocaleDateString("en-IN", { month: "short" })}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
