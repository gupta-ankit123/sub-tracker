"use client"

import { useSubscriptions } from "@/features/subscriptions/api/use-subscriptions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SubscriptionFormDialog } from "@/features/subscriptions/components/subscription-form-dialog"
import { Plus, TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart as PieChartIcon, Calendar } from "lucide-react"
import { useMemo } from "react"

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
        <div className="flex items-center gap-4">
            <svg viewBox="0 0 100 100" className="w-32 h-32">
                {slices.map((slice, i) => (
                    <path key={i} d={slice.path} fill={slice.color} />
                ))}
                <circle cx="50" cy="50" r="25" fill="white" />
            </svg>
            <div className="flex flex-col gap-1">
                {data.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground truncate max-w-[100px]">{item.name}</span>
                        <span className="font-medium">{item.value.toFixed(0)}%</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
    const maxValue = Math.max(...data.map(d => d.value), 1)

    return (
        <div className="space-y-3">
            {data.map((item, i) => (
                <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span>{item.label}</span>
                        <span className="font-medium">₹{item.value.toFixed(2)}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all"
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

    if (isLoading) {
        return <div className="flex items-center justify-center p-8">Loading...</div>
    }

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

    if (subscriptions.length === 0) {
        return (
            <div className="h-full bg-neutral-500/5 p-4 md:p-8 overflow-auto">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">Analytics</h1>
                        <p className="text-muted-foreground mt-1">Detailed insights into your subscriptions.</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-sm border">
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-semibold">No data yet</h3>
                            <p className="text-muted-foreground">Add subscriptions to see analytics.</p>
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
        <div className="h-full bg-neutral-500/5 p-4 md:p-8 overflow-auto">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Analytics</h1>
                        <p className="text-muted-foreground mt-1">Detailed insights into your subscriptions.</p>
                    </div>
                    <SubscriptionFormDialog>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Subscription
                        </Button>
                    </SubscriptionFormDialog>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">₹{analytics.monthlyTotal.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">per month</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Annual Spending</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">₹{analytics.annualTotal.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">per year</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg. per Sub</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">₹{analytics.avgPerSubscription.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">per month</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{analytics.activeCount}</div>
                            <p className="text-xs text-muted-foreground">
                                of {analytics.totalSubscriptions} total
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <PieChartIcon className="h-5 w-5" />
                                Spending by Category
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SimplePieChart data={analytics.categoryData} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                By Billing Cycle
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <BarChart data={analytics.billingCycleData} />
                        </CardContent>
                    </Card>
                </div>

                {analytics.highestSubscription && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Most Expensive Subscription</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-4">
                                    {analytics.highestSubscription.logoUrl ? (
                                        <img
                                            src={analytics.highestSubscription.logoUrl}
                                            alt={analytics.highestSubscription.name}
                                            className="w-12 h-12 rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-xl font-bold">
                                            {analytics.highestSubscription.name.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-lg">{analytics.highestSubscription.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {analytics.highestSubscription.billingCycle.replace('_', ' ')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold">
                                        {analytics.highestSubscription.currency} {Number(analytics.highestSubscription.amount).toFixed(2)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        ₹{calculateMonthlyAmount(Number(analytics.highestSubscription.amount), analytics.highestSubscription.billingCycle).toFixed(2)}/month
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="text-lg">Category Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {analytics.categoryData.map((cat, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: cat.color }}
                                        />
                                        <span>{cat.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-muted-foreground">
                                            ₹{cat.amount.toFixed(2)}/mo
                                        </span>
                                        <span className="font-medium w-12 text-right">
                                            {cat.value.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
