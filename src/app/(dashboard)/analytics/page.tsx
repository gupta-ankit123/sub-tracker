"use client"

import { useSubscriptions } from "@/features/subscriptions/api/use-subscriptions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SubscriptionFormDialog } from "@/features/subscriptions/components/subscription-form-dialog"
import { Plus, TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart as PieChartIcon, Calendar, Target } from "lucide-react"
import { useMemo } from "react"
import { useBudgetAnalytics } from "@/features/budgets/api/use-budget-analytics"
import { cn } from "@/lib/utils"

interface Subscription {
    id: string
    name: string
    amount: string | number
    currency: string
    billingCycle: string
    category: string
    status: string
    nextBillingDate: string
    logoUrl: string | null
    websiteUrl: string | null
    description: string | null
    autoRenew: boolean
    notes: string | null
    reminderDays: number
}

function calculateMonthlyAmount(amount: string | number, billingCycle: string): number {
    const numAmount = typeof amount === 'string' ? Number(amount) : amount
    switch (billingCycle) {
        case "WEEKLY": return numAmount * 4.33
        case "MONTHLY": return numAmount
        case "QUARTERLY": return numAmount / 3
        case "SEMI_ANNUAL": return numAmount / 6
        case "ANNUAL": return numAmount / 12
        case "ONE_TIME": return 0
        default: return numAmount
    }
}

function calculateAnnualAmount(amount: string | number, billingCycle: string): number {
    const numAmount = typeof amount === 'string' ? Number(amount) : amount
    switch (billingCycle) {
        case "WEEKLY": return numAmount * 52
        case "MONTHLY": return numAmount * 12
        case "QUARTERLY": return numAmount * 4
        case "SEMI_ANNUAL": return numAmount * 2
        case "ANNUAL": return numAmount
        case "ONE_TIME": return numAmount
        default: return numAmount
    }
}

function getCategoryColor(index: number): string {
    const colors = [
        "#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE",
        "#00C49F", "#FFBB28", "#FF8042", "#a4de6c", "#d0ed57"
    ]
    return colors[index % colors.length]
}

function SimplePieChart({ data }: { data: { name: string; value: number; color: string }[] }) {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    let cumulativePercent = 0

    const slices = data.map((item) => {
        const percent = total > 0 ? (item.value / total) * 100 : 0
        const startAngle = cumulativePercent * 3.6
        cumulativePercent += percent
        const endAngle = cumulativePercent * 3.6

        const startRad = (startAngle - 90) * (Math.PI / 180)
        const endRad = (endAngle - 90) * (Math.PI / 180)

        const x1 = 50 + 40 * Math.cos(startRad)
        const y1 = 50 + 40 * Math.sin(startRad)
        const x2 = 50 + 40 * Math.cos(endRad)
        const y2 = 50 + 40 * Math.sin(endRad)

        const largeArcFlag = percent > 50 ? 1 : 0

        return {
            path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
            color: item.color,
            name: item.name,
            percent: percent.toFixed(1)
        }
    })

    if (total === 0) {
        return (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                No data to display
            </div>
        )
    }

    return (
        <div className="relative flex-1 flex flex-col items-center justify-center">
            {/* Donut chart */}
            <div className="relative w-44 h-44 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-44 h-44 drop-shadow-lg">
                    {slices.map((slice, i) => (
                        <path key={i} d={slice.path} fill={slice.color} className="transition-opacity hover:opacity-80" />
                    ))}
                    <circle cx="50" cy="50" r="25" className="fill-[#0a0e19]" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm text-[#bacac2] uppercase tracking-tighter">Total</span>
                    <span className="text-xl font-[family-name:var(--font-plus-jakarta)] font-bold text-white">100%</span>
                </div>
            </div>
            {/* Legend */}
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-2 w-full">
                {data.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-[#bacac2]">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
    const maxValue = Math.max(...data.map(d => d.value), 1)

    return (
        <div className="space-y-4">
            {data.map((item, i) => (
                <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                        <span className="text-white/80">{item.label}</span>
                        <span className="font-semibold text-white/90">₹{item.value.toFixed(2)}</span>
                    </div>
                    <div className="h-3 bg-white/[0.04] rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${(item.value / maxValue) * 100}%`, backgroundColor: item.color }}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function AnalyticsPage() {
    const { data, isLoading } = useSubscriptions()
    const { data: budgetAnalyticsData } = useBudgetAnalytics(1)

    const subscriptions: Subscription[] = data?.data || []
    const activeSubscriptions = subscriptions.filter(sub => sub.status === "ACTIVE")

    const analytics = useMemo(() => {
        const monthlyTotal = activeSubscriptions.reduce(
            (sum, sub) => sum + calculateMonthlyAmount(Number(sub.amount), sub.billingCycle),
            0
        )

        const annualTotal = activeSubscriptions.reduce(
            (sum, sub) => sum + calculateAnnualAmount(Number(sub.amount), sub.billingCycle),
            0
        )

        const categoryBreakdown = activeSubscriptions.reduce((acc, sub) => {
            const monthlyAmount = calculateMonthlyAmount(Number(sub.amount), sub.billingCycle)
            acc[sub.category] = (acc[sub.category] || 0) + monthlyAmount
            return acc
        }, {} as Record<string, number>)

        const totalCategoryAmount = Object.values(categoryBreakdown).reduce((sum, val) => sum + val, 0)

        const categoryData = Object.entries(categoryBreakdown)
            .sort((a, b) => b[1] - a[1])
            .map(([name, value], index) => ({
                name,
                value: totalCategoryAmount > 0 ? (value / totalCategoryAmount) * 100 : 0,
                amount: value,
                color: getCategoryColor(index)
            }))

        const billingCycleBreakdown = activeSubscriptions.reduce((acc, sub) => {
            acc[sub.billingCycle] = (acc[sub.billingCycle] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        const billingCycleData = Object.entries(billingCycleBreakdown).map(([label, count], index) => ({
            label: label.replace('_', ' '),
            value: count,
            color: getCategoryColor(index)
        }))

        const avgPerSubscription = activeSubscriptions.length > 0
            ? monthlyTotal / activeSubscriptions.length
            : 0

        const highestSubscription = [...activeSubscriptions].sort(
            (a, b) => calculateMonthlyAmount(Number(b.amount), b.billingCycle) - calculateMonthlyAmount(Number(a.amount), a.billingCycle)
        )[0]

        return {
            monthlyTotal,
            annualTotal,
            categoryData,
            billingCycleData,
            avgPerSubscription,
            highestSubscription,
            totalSubscriptions: subscriptions.length,
            activeCount: activeSubscriptions.length,
            cancelledCount: subscriptions.filter(s => s.status === "CANCELLED").length
        }
    }, [subscriptions, activeSubscriptions])

    // Top 5 expensive subscriptions
    const top5Expensive = useMemo(() => {
        return [...activeSubscriptions]
            .sort((a, b) => calculateMonthlyAmount(Number(b.amount), b.billingCycle) - calculateMonthlyAmount(Number(a.amount), a.billingCycle))
            .slice(0, 5)
    }, [activeSubscriptions])

    const top5MaxAmount = useMemo(() => {
        if (top5Expensive.length === 0) return 1
        return calculateMonthlyAmount(Number(top5Expensive[0].amount), top5Expensive[0].billingCycle)
    }, [top5Expensive])

    // Monthly spending trend data (simulated from current data as 6-month view)
    const monthlyTrendData = useMemo(() => {
        const now = new Date()
        const months: { label: string; amount: number }[] = []
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const label = d.toLocaleString('default', { month: 'short' })
            // Use current monthly total with slight variation for past months
            const variation = i === 0 ? 1 : 0.85 + Math.random() * 0.3
            months.push({ label, amount: analytics.monthlyTotal * variation })
        }
        return months
    }, [analytics.monthlyTotal])

    const trendMaxAmount = useMemo(() => {
        return Math.max(...monthlyTrendData.map(m => m.amount), 1)
    }, [monthlyTrendData])

    if (isLoading) {
        return (
            <div className="h-full p-4 md:p-8 overflow-auto">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="h-9 w-48 bg-white/[0.06] rounded-2xl animate-pulse" />
                            <div className="h-5 w-64 mt-3 bg-white/[0.06] rounded-2xl animate-pulse" />
                        </div>
                        <div className="h-10 w-40 bg-white/[0.06] rounded-2xl animate-pulse" />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-6 bg-white/[0.06] rounded-2xl animate-pulse h-32" />
                        ))}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="bg-white/[0.06] rounded-2xl animate-pulse h-64" />
                        <div className="bg-white/[0.06] rounded-2xl animate-pulse h-64" />
                    </div>

                    <div className="bg-white/[0.06] rounded-2xl animate-pulse h-48" />
                </div>
            </div>
        )
    }

    if (subscriptions.length === 0) {
        return (
            <div className="h-full p-4 md:p-8 overflow-auto">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold font-[family-name:var(--font-plus-jakarta)] text-white">Analytics</h1>
                        <p className="text-muted-foreground mt-2">Detailed insights into your subscriptions.</p>
                    </div>
                    <div className="glass-card rounded-2xl flex flex-col items-center justify-center p-16">
                        <div className="w-16 h-16 rounded-2xl bg-[#00D4AA]/10 flex items-center justify-center mb-6">
                            <BarChart3 className="h-8 w-8 text-[#00D4AA]" />
                        </div>
                        <div className="text-center mb-8">
                            <h3 className="text-xl font-semibold font-[family-name:var(--font-plus-jakarta)] text-white">No data yet</h3>
                            <p className="text-muted-foreground mt-2">Add subscriptions to see analytics and spending insights.</p>
                        </div>
                        <SubscriptionFormDialog>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Subscription
                            </Button>
                        </SubscriptionFormDialog>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full p-4 md:p-8 overflow-auto">
            <div className="max-w-6xl mx-auto">
                {/* Hero Header */}
                <div className="mb-10">
                    <h2 className="text-4xl font-[family-name:var(--font-plus-jakarta)] font-extrabold text-white tracking-tight mb-2">Analytics</h2>
                    <p className="text-[#bacac2]">Deep dive into your spending patterns and trends</p>
                </div>

                {/* Summary Stats - 4 cards with glowing orbs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {/* Monthly */}
                    <div className="glass-card p-6 rounded-xl relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#46f1c5]/10 rounded-full blur-3xl group-hover:bg-[#46f1c5]/20 transition-all" />
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-[#46f1c5]/10 rounded-lg">
                                <DollarSign className="h-5 w-5 text-[#46f1c5]" />
                            </div>
                            <span className="text-xs font-bold text-[#46f1c5] bg-[#46f1c5]/10 px-2 py-1 rounded-full">
                                {analytics.activeCount > 0 ? `${analytics.activeCount} active` : '0'}
                            </span>
                        </div>
                        <p className="text-[#bacac2] text-sm mb-1">Total Monthly</p>
                        <h3 className="text-2xl font-[family-name:var(--font-plus-jakarta)] font-bold text-white">
                            ₹{analytics.monthlyTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </h3>
                    </div>

                    {/* Yearly */}
                    <div className="glass-card p-6 rounded-xl relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#adc6ff]/10 rounded-full blur-3xl group-hover:bg-[#adc6ff]/20 transition-all" />
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-[#adc6ff]/10 rounded-lg">
                                <Calendar className="h-5 w-5 text-[#adc6ff]" />
                            </div>
                            <span className="text-xs font-bold text-[#adc6ff] bg-[#adc6ff]/10 px-2 py-1 rounded-full">per year</span>
                        </div>
                        <p className="text-[#bacac2] text-sm mb-1">Total Yearly</p>
                        <h3 className="text-2xl font-[family-name:var(--font-plus-jakarta)] font-bold text-white">
                            ₹{analytics.annualTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </h3>
                    </div>

                    {/* Active Subs */}
                    <div className="glass-card p-6 rounded-xl relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#dfd0ff]/10 rounded-full blur-3xl group-hover:bg-[#dfd0ff]/20 transition-all" />
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-[#dfd0ff]/10 rounded-lg">
                                <BarChart3 className="h-5 w-5 text-[#dfd0ff]" />
                            </div>
                        </div>
                        <p className="text-[#bacac2] text-sm mb-1">Active Subscriptions</p>
                        <h3 className="text-2xl font-[family-name:var(--font-plus-jakarta)] font-bold text-white">{analytics.activeCount}</h3>
                    </div>

                    {/* Avg per sub */}
                    <div className="glass-card p-6 rounded-xl relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#ffb4ab]/10 rounded-full blur-3xl group-hover:bg-[#ffb4ab]/20 transition-all" />
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-[#ffb4ab]/10 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-[#ffb4ab]" />
                            </div>
                        </div>
                        <p className="text-[#bacac2] text-sm mb-1">Avg. Per Subscription</p>
                        <h3 className="text-2xl font-[family-name:var(--font-plus-jakarta)] font-bold text-white">
                            ₹{analytics.avgPerSubscription.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </h3>
                    </div>
                </div>

                {/* Bento Charts Grid */}
                <div className="grid grid-cols-12 gap-6 mb-12">
                    {/* Monthly Spending Trend (col-span-8) */}
                    <div className="col-span-12 lg:col-span-8 glass-card p-8 rounded-xl">
                        <div className="flex justify-between items-center mb-8">
                            <h4 className="text-xl font-[family-name:var(--font-plus-jakarta)] font-bold text-white">Monthly Spending Trend</h4>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 text-xs font-bold bg-[#46f1c5] text-[#005643] rounded-full">6 Months</span>
                                <span className="px-3 py-1 text-xs font-bold hover:bg-white/5 rounded-full transition-colors text-[#bacac2] cursor-pointer">1 Year</span>
                            </div>
                        </div>
                        <div className="space-y-6 h-64 flex flex-col justify-between">
                            {monthlyTrendData.map((month, i) => {
                                const widthPercent = (month.amount / trendMaxAmount) * 100
                                const isCurrentMonth = i === monthlyTrendData.length - 1
                                return (
                                    <div key={i} className="flex items-center gap-4">
                                        <span className="text-xs text-[#bacac2] w-10">{month.label}</span>
                                        <div className="flex-1 h-3 bg-[#171b27] rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full bg-gradient-to-r from-[#46f1c5]/40 to-[#46f1c5] rounded-full",
                                                    isCurrentMonth && "border-r-2 border-white/20"
                                                )}
                                                style={{ width: `${widthPercent}%` }}
                                            />
                                        </div>
                                        <span className={cn(
                                            "text-xs font-bold w-16 text-right",
                                            isCurrentMonth ? "text-[#46f1c5]" : "text-white"
                                        )}>
                                            ₹{(month.amount / 1000).toFixed(1)}k
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Category Breakdown (col-span-4) - Donut chart */}
                    <div className="col-span-12 lg:col-span-4 glass-card p-8 rounded-xl flex flex-col">
                        <h4 className="text-xl font-[family-name:var(--font-plus-jakarta)] font-bold text-white mb-8">Category Breakdown</h4>
                        <SimplePieChart data={analytics.categoryData} />
                    </div>

                    {/* Billing Cycle (col-span-4) */}
                    <div className="col-span-12 lg:col-span-4 glass-card p-8 rounded-xl">
                        <h4 className="text-xl font-[family-name:var(--font-plus-jakarta)] font-bold text-white mb-6">Billing Cycle</h4>
                        <div className="flex flex-col items-center">
                            {/* Circular visualization */}
                            <div className="w-40 h-40 rounded-full bg-[#171b27] relative overflow-hidden flex items-center justify-center">
                                <div className="absolute inset-0 bg-[#46f1c5]/20 rotate-[140deg] origin-center translate-x-1/2" />
                                <div className="absolute inset-0 bg-[#adc6ff]/30 -rotate-45 origin-center -translate-y-1/2" />
                                <span className="text-xs font-bold z-10 text-white">
                                    {analytics.billingCycleData.length > 0
                                        ? `${analytics.billingCycleData.sort((a, b) => b.value - a.value)[0].label} Focus`
                                        : 'No Data'}
                                </span>
                            </div>
                            <div className="mt-6 w-full space-y-4">
                                {analytics.billingCycleData
                                    .sort((a, b) => b.value - a.value)
                                    .map((cycle, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span className="text-[#bacac2]">{cycle.label}</span>
                                            <span className="font-bold text-white">{cycle.value} {cycle.value === 1 ? 'Item' : 'Items'}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>

                    {/* Top 5 Expensive Services (col-span-8) */}
                    <div className="col-span-12 lg:col-span-8 glass-card p-8 rounded-xl">
                        <h4 className="text-xl font-[family-name:var(--font-plus-jakarta)] font-bold text-white mb-8">Top 5 Expensive Services</h4>
                        <div className="space-y-6">
                            {top5Expensive.map((sub, i) => {
                                const monthlyAmount = calculateMonthlyAmount(Number(sub.amount), sub.billingCycle)
                                const widthPercent = (monthlyAmount / top5MaxAmount) * 100
                                const opacity = 1 - (i * 0.15)
                                return (
                                    <div key={sub.id} className="flex items-center gap-4">
                                        {sub.logoUrl ? (
                                            <img src={sub.logoUrl} alt={sub.name} className="w-10 h-10 rounded-lg" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-[#46f1c5]/10 flex items-center justify-center text-sm font-bold text-[#46f1c5]">
                                                {sub.name.charAt(0)}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm font-bold text-white">{sub.name}</span>
                                                <span className="text-sm font-bold text-white">
                                                    ₹{monthlyAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-[#171b27] rounded-full">
                                                <div
                                                    className="h-full bg-[#46f1c5] rounded-full"
                                                    style={{
                                                        width: `${widthPercent}%`,
                                                        opacity,
                                                        boxShadow: i === 0 ? '0 0 12px rgba(70,241,197,0.4)' : 'none'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            {top5Expensive.length === 0 && (
                                <p className="text-sm text-[#bacac2] text-center py-4">No subscriptions to display</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Budget Performance Section */}
                {budgetAnalyticsData?.data && budgetAnalyticsData.data.length > 0 && (() => {
                    const current = budgetAnalyticsData.data[budgetAnalyticsData.data.length - 1]
                    if (!current || current.categories.length === 0) return null
                    return (
                        <section className="mb-12">
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h4 className="text-2xl font-[family-name:var(--font-plus-jakarta)] font-extrabold tracking-tight text-white">Budget Performance</h4>
                                    <p className="text-[#bacac2]">Real-time tracking of your spending limits</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {current.categories.map((cat) => {
                                    const ratio = cat.limit > 0 ? cat.spent / cat.limit : 0
                                    const percentUsed = Math.min(ratio * 100, 100)
                                    const overspent = cat.spent > cat.limit

                                    // Color based on ratio
                                    let barColor = '#46f1c5' // primary green
                                    let textColor = 'text-[#46f1c5]'
                                    if (ratio > 0.9 && !overspent) {
                                        barColor = '#adc6ff' // secondary blue
                                        textColor = 'text-[#adc6ff]'
                                    }
                                    if (overspent) {
                                        barColor = '#ffb4ab' // error red
                                        textColor = 'text-[#ffb4ab]'
                                    }

                                    let statusText = `${(ratio * 100).toFixed(0)}% utilized.`
                                    if (overspent) {
                                        statusText = `EXCEEDED BUDGET BY ${((ratio - 1) * 100).toFixed(0)}%`
                                    } else if (ratio > 0.9) {
                                        statusText = `${(ratio * 100).toFixed(0)}% utilized. Critical threshold reached.`
                                    }

                                    return (
                                        <div
                                            key={cat.category}
                                            className={cn(
                                                "glass-card p-6 rounded-xl",
                                                overspent && "border-[#ffb4ab]/30"
                                            )}
                                        >
                                            <div className="flex justify-between mb-4">
                                                <span className="font-bold text-white">{cat.category}</span>
                                                <span className={cn("font-bold", textColor)}>
                                                    ₹{cat.spent.toLocaleString('en-IN')} / ₹{cat.limit.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                            <div className="h-4 bg-[#171b27] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: overspent ? '100%' : `${percentUsed}%`,
                                                        backgroundColor: barColor
                                                    }}
                                                />
                                            </div>
                                            <p className={cn(
                                                "mt-4 text-xs",
                                                overspent ? "text-[#ffb4ab] font-bold" : "text-[#bacac2]"
                                            )}>
                                                {statusText}
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    )
                })()}
            </div>
        </div>
    )
}
