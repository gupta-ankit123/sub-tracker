"use client"

import { useSubscriptions } from "../api/use-subscriptions"
import { SubscriptionFormDialog } from "./subscription-form-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, Calendar, TrendingUp, Wallet, PieChart as PieChartIcon } from "lucide-react"
import { useDeleteSubscription } from "../api/use-delete-subscription"
import { useMarkAsPaid } from "../api/use-mark-as-paid"
import { useSkipPayment } from "../api/use-skip-payment"
import { useMarkAsUsed } from "../api/use-mark-as-used"
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns"
import { Check, SkipForward, AlertCircle, CheckCircle, Clock, Zap } from "lucide-react"

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
    lastPaidDate: string | null
    paymentStatus: string
    paymentMethod: string | null
    usageFrequency: string
    lastUsedDate: string | null
}

function calculateMonthlyAmount(amount: string | number, billingCycle: string): number {
    const numAmount = typeof amount === 'string' ? Number(amount) : amount
    switch (billingCycle) {
        case "WEEKLY":
            return numAmount * 4.33
        case "MONTHLY":
            return numAmount
        case "QUARTERLY":
            return numAmount / 3
        case "SEMI_ANNUAL":
            return numAmount / 6
        case "ANNUAL":
            return numAmount / 12
        case "ONE_TIME":
            return 0
        default:
            return numAmount
    }
}

function getCategoryColor(index: number): string {
    const colors = [
        "#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE",
        "#00C49F", "#FFBB28", "#FF8042", "#a4de6c", "#d0ed57", "#8884d8"
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
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-muted-foreground">{item.name}</span>
                        <span className="font-medium">{item.value.toFixed(0)}%</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function SubscriptionList() {
    const { data, isLoading } = useSubscriptions()
    const deleteMutation = useDeleteSubscription()
    const markAsPaidMutation = useMarkAsPaid()
    const skipPaymentMutation = useSkipPayment()
    const markAsUsedMutation = useMarkAsUsed()

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this subscription?")) {
            deleteMutation.mutate({ param: { id } })
        }
    }

    if (isLoading) {
        return <div className="flex items-center justify-center p-8">Loading...</div>
    }

    const subscriptions: Subscription[] = data?.data || []

    const now = new Date()
    const weekStart = startOfWeek(now)
    const weekEnd = endOfWeek(now)
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    const totalMonthlySpending = subscriptions
        .filter(sub => sub.status === "ACTIVE")
        .reduce((sum, sub) => sum + calculateMonthlyAmount(Number(sub.amount), sub.billingCycle), 0)

    const annualProjection = totalMonthlySpending * 12

    const upcomingThisWeek = subscriptions.filter(sub => {
        if (sub.status !== "ACTIVE") return false
        const billingDate = parseISO(sub.nextBillingDate)
        return isWithinInterval(billingDate, { start: weekStart, end: weekEnd })
    })

    const upcomingThisMonth = subscriptions.filter(sub => {
        if (sub.status !== "ACTIVE") return false
        const billingDate = parseISO(sub.nextBillingDate)
        return isWithinInterval(billingDate, { start: monthStart, end: monthEnd })
    })

    const categorySpending = subscriptions
        .filter(sub => sub.status === "ACTIVE")
        .reduce((acc, sub) => {
            const monthlyAmount = calculateMonthlyAmount(Number(sub.amount), sub.billingCycle)
            acc[sub.category] = (acc[sub.category] || 0) + monthlyAmount
            return acc
        }, {} as Record<string, number>)

    const totalCategorySpending = Object.values(categorySpending).reduce((sum, val) => sum + val, 0)

    const categoryData = Object.entries(categorySpending)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value], index) => ({
            name,
            value: totalCategorySpending > 0 ? (value / totalCategorySpending) * 100 : 0,
            color: getCategoryColor(index)
        }))

    if (subscriptions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-sm border">
                <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold">No subscriptions yet</h3>
                    <p className="text-muted-foreground">Start tracking your subscriptions by adding one.</p>
                </div>
                <SubscriptionFormDialog>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Subscription
                    </Button>
                </SubscriptionFormDialog>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Monthly Spending</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">₹{totalMonthlySpending.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">per month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Annual Projection</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">₹{annualProjection.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">per year</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming This Week</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{upcomingThisWeek.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {upcomingThisWeek.reduce((sum, sub) => sum + Number(sub.amount), 0).toFixed(2)} INR
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming This Month</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{upcomingThisMonth.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {upcomingThisMonth.reduce((sum, sub) => sum + Number(sub.amount), 0).toFixed(2)} INR
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <PieChartIcon className="h-5 w-5" />
                            Spending by Category
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SimplePieChart data={categoryData} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Upcoming Bills</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {upcomingThisMonth.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No upcoming bills this month</p>
                        ) : (
                            <div className="space-y-3">
                                {upcomingThisMonth.slice(0, 5).map((sub) => (
                                    <div key={sub.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {sub.logoUrl ? (
                                                <img src={sub.logoUrl} alt={sub.name} className="w-8 h-8 rounded" />
                                            ) : (
                                                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                                                    <span className="text-sm font-bold text-primary">
                                                        {sub.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-sm">{sub.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(sub.nextBillingDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="font-medium">
                                            {sub.currency} {Number(sub.amount).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end">
                <SubscriptionFormDialog>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Subscription
                    </Button>
                </SubscriptionFormDialog>
            </div>

            <div className="grid gap-4">
                {subscriptions.map((subscription) => (
                    <div
                        key={subscription.id}
                        className={`p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow ${subscription.paymentStatus === 'SUCCESS' ? 'border-l-4 border-l-green-500' :
                                subscription.paymentStatus === 'FAILED' ? 'border-l-4 border-l-red-500' :
                                    subscription.paymentStatus === 'OVERDUE' ? 'border-l-4 border-l-red-500' :
                                        'border-l-4 border-l-yellow-500'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {subscription.logoUrl ? (
                                    <img
                                        src={subscription.logoUrl}
                                        alt={subscription.name}
                                        className="w-12 h-12 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <span className="text-xl font-bold text-primary">
                                            {subscription.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold">{subscription.name}</h3>
                                    <p className="text-sm text-muted-foreground">{subscription.category}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Due: {new Date(subscription.nextBillingDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="font-bold text-lg">
                                        {subscription.currency} {Number(subscription.amount).toFixed(2)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {subscription.billingCycle.replace('_', ' ').toLowerCase()}
                                    </p>
                                    <p className="text-xs text-green-600 font-medium">
                                        ₹{(calculateMonthlyAmount(Number(subscription.amount), subscription.billingCycle) * 12).toFixed(0)}/year
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    {subscription.paymentStatus === 'SUCCESS' ? (
                                        <span className="flex items-center gap-1 text-green-600 text-sm">
                                            <CheckCircle className="h-4 w-4" />
                                            Paid {subscription.lastPaidDate ? `on ${new Date(subscription.lastPaidDate).toLocaleDateString()}` : ''}
                                        </span>
                                    ) : subscription.paymentStatus === 'FAILED' ? (
                                        <span className="flex items-center gap-1 text-red-600 text-sm">
                                            <AlertCircle className="h-4 w-4" />
                                            Payment Failed
                                        </span>
                                    ) : subscription.paymentStatus === 'OVERDUE' ? (
                                        <span className="flex items-center gap-1 text-red-600 text-sm">
                                            <AlertCircle className="h-4 w-4" />
                                            Overdue
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-yellow-600 text-sm">
                                            <Clock className="h-4 w-4" />
                                            Pending
                                        </span>
                                    )}
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-7"
                                    onClick={() => markAsUsedMutation.mutate({ param: { id: subscription.id } })}
                                    disabled={markAsUsedMutation.isPending}
                                >
                                    <Zap className="h-3 w-3 mr-1" />
                                    I just used this
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                {subscription.paymentStatus !== 'SUCCESS' && (
                                    <>
                                        <Button
                                            size="sm"
                                            onClick={() => markAsPaidMutation.mutate({
                                                param: { id: subscription.id }
                                            })}
                                            disabled={markAsPaidMutation.isPending}
                                        >
                                            <Check className="h-4 w-4 mr-1" />
                                            Mark Paid
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => skipPaymentMutation.mutate({ param: { id: subscription.id } })}
                                            disabled={skipPaymentMutation.isPending}
                                        >
                                            <SkipForward className="h-4 w-4 mr-1" />
                                            Skip
                                        </Button>
                                    </>
                                )}
                                <SubscriptionFormDialog subscription={subscription}>
                                    <Button variant="outline" size="icon">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </SubscriptionFormDialog>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleDelete(subscription.id)}
                                    disabled={deleteMutation.isPending}
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
