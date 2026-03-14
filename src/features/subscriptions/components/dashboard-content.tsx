"use client"

import { useSubscriptions } from "@/features/subscriptions/api/use-subscriptions"
import { useUtilityBills } from "@/features/subscriptions/api/use-utility-bills"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SubscriptionFormDialog } from "@/features/subscriptions/components/subscription-form-dialog"
import { UtilityBillFormDialog } from "@/features/subscriptions/components/utility-bill-form-dialog"
import { Plus, TrendingUp, DollarSign, AlertCircle, Sparkles, Lightbulb, Target, Wallet, CheckCircle, Clock, Check, Download, FileText, Zap } from "lucide-react"
import { useMemo } from "react"
import Link from "next/link"
import { exportToCSV, exportToPDF } from "@/features/subscriptions/api/use-export"

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
    createdAt: string
    lastPaidDate: string | null
    paymentStatus: string
    paymentMethod: string | null
    usageFrequency: string
    lastUsedDate: string | null
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

function getCategoryColor(index: number): string {
    const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#a4de6c", "#d0ed57"]
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

        return { path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`, color: item.color }
    })

    if (total === 0) return <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">No data</div>

    return (
        <div className="flex items-center gap-4">
            <svg viewBox="0 0 100 100" className="w-24 h-24">
                {slices.map((slice, i) => (<path key={i} d={slice.path} fill={slice.color} />))}
                <circle cx="50" cy="50" r="25" fill="white" />
            </svg>
            <div className="flex flex-col gap-1">
                {data.slice(0, 4).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground truncate max-w-[80px]">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function DashboardContent({ userName }: { userName: string }) {
    const { data, isLoading } = useSubscriptions()

    const insights = useMemo(() => {
        const subscriptions = data?.data || []
        if (subscriptions.length === 0) return null

        const activeSubscriptions = subscriptions.filter(sub => sub.status === "ACTIVE")

        const monthlyTotal = activeSubscriptions.reduce((sum, sub) => sum + calculateMonthlyAmount(Number(sub.amount), sub.billingCycle), 0)
        const annualTotal = monthlyTotal * 12

        const categoryBreakdown = activeSubscriptions.reduce((acc, sub) => {
            const monthlyAmount = calculateMonthlyAmount(Number(sub.amount), sub.billingCycle)
            acc[sub.category] = (acc[sub.category] || 0) + monthlyAmount
            return acc
        }, {} as Record<string, number>)

        const totalCategoryAmount = Object.values(categoryBreakdown).reduce((sum, val) => sum + val, 0)

        const sortedCategories = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])
        const topCategory = sortedCategories[0]
        const topCategoryPercent = topCategory ? ((topCategory[1] / totalCategoryAmount) * 100).toFixed(0) : "0"

        const unusedSubscriptions = subscriptions.filter(sub => {
            if (sub.status !== "ACTIVE") return false
            if (sub.usageFrequency === "NEVER") return true
            if (!sub.lastUsedDate) {
                return true
            }
            const lastUsed = new Date(sub.lastUsedDate)
            const daysSinceUsed = Math.floor((Date.now() - lastUsed.getTime()) / (1000 * 60 * 60 * 24))
            const thresholdDays = {
                "DAILY": 7,
                "WEEKLY": 14,
                "MONTHLY": 45,
                "RARELY": 60,
                "NEVER": 30
            }
            return daysSinceUsed > (thresholdDays[sub.usageFrequency as keyof typeof thresholdDays] || 45)
        })

        const potentialSavings = unusedSubscriptions.reduce((sum, sub) => 
            sum + calculateMonthlyAmount(Number(sub.amount), sub.billingCycle), 0)

        const autoRenewSubscriptions = activeSubscriptions.filter(sub => sub.autoRenew)

        const paidThisMonth = activeSubscriptions.filter(sub => sub.paymentStatus === "SUCCESS")
        const pendingThisMonth = activeSubscriptions.filter(sub => sub.paymentStatus === "PENDING")
        const overdueThisMonth = activeSubscriptions.filter(sub => sub.paymentStatus === "OVERDUE" || sub.paymentStatus === "FAILED")

        const paidAmount = paidThisMonth.reduce((sum, sub) => sum + Number(sub.amount), 0)
        const pendingAmount = pendingThisMonth.reduce((sum, sub) => sum + Number(sub.amount), 0)
        const overdueAmount = overdueThisMonth.reduce((sum, sub) => sum + Number(sub.amount), 0)

        return {
            monthlyTotal,
            annualTotal,
            topCategory: topCategory ? topCategory[0] : null,
            topCategoryPercent,
            totalSubscriptions: subscriptions.length,
            activeCount: activeSubscriptions.length,
            unusedCount: unusedSubscriptions.length,
            autoRenewCount: autoRenewSubscriptions.length,
            categoryBreakdown: sortedCategories.map(([name, value], index) => ({
                name,
                value: totalCategoryAmount > 0 ? (value / totalCategoryAmount) * 100 : 0,
                color: getCategoryColor(index)
            })),
            upcomingSubs: activeSubscriptions.slice(0, 3),
            paidCount: paidThisMonth.length,
            pendingCount: pendingThisMonth.length,
            overdueCount: overdueThisMonth.length,
            paidAmount,
            pendingAmount,
            overdueAmount,
            totalMonthlyAmount: paidAmount + pendingAmount + overdueAmount,
            potentialSavings,
            unusedSubscriptions
        }
    }, [data])

    if (isLoading) {
        return <div className="flex items-center justify-center p-8">Loading...</div>
    }

    const subscriptions: Subscription[] = data?.data || []

    if (subscriptions.length === 0) {
        return (
            <div className="h-full bg-neutral-500/5 p-4 md:p-8 overflow-auto">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-muted-foreground mt-1">Welcome back, {userName}! Start tracking your subscriptions.</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-sm border">
                        <Sparkles className="h-12 w-12 text-primary mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Welcome to Subscription Tracker!</h3>
                        <p className="text-muted-foreground text-center mb-6">Add your first subscription to start tracking your spending.</p>
                        <SubscriptionFormDialog>
                            <Button><Plus className="mr-2 h-4 w-4" />Add Your First Subscription</Button>
                        </SubscriptionFormDialog>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full bg-neutral-500/5 p-4 md:p-8 overflow-auto">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Welcome back, {userName}! Here's your spending overview.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-blue-100">Monthly Spending</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">₹{insights?.monthlyTotal.toFixed(2) || 0}</div>
                            <p className="text-xs text-blue-100">per month</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-purple-100">Annual Spending</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">₹{insights?.annualTotal.toFixed(2) || 0}</div>
                            <p className="text-xs text-purple-100">per year</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{insights?.activeCount || 0}</div>
                            <p className="text-xs text-muted-foreground">of {insights?.totalSubscriptions || 0} total</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Auto-Renew</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{insights?.autoRenewCount || 0}</div>
                            <p className="text-xs text-muted-foreground">subscriptions</p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            This Month's Bills
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="flex items-center justify-center mb-2">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <p className="text-2xl font-bold text-green-600">₹{insights?.paidAmount.toFixed(0) || 0}</p>
                                <p className="text-sm text-green-700">Paid ({insights?.paidCount || 0})</p>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                <div className="flex items-center justify-center mb-2">
                                    <Clock className="h-6 w-6 text-yellow-600" />
                                </div>
                                <p className="text-2xl font-bold text-yellow-600">₹{insights?.pendingAmount.toFixed(0) || 0}</p>
                                <p className="text-sm text-yellow-700">Pending ({insights?.pendingCount || 0})</p>
                            </div>
                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                <div className="flex items-center justify-center mb-2">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <p className="text-2xl font-bold text-red-600">₹{insights?.overdueAmount.toFixed(0) || 0}</p>
                                <p className="text-sm text-red-700">Overdue ({insights?.overdueCount || 0})</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Total:</span>
                                <span className="text-xl font-bold">₹{insights?.totalMonthlyAmount.toFixed(0) || 0}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {insights && insights.unusedCount > 0 && (
                    <Card className="mb-6 border-orange-200 bg-orange-50/50">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
                                <AlertCircle className="h-5 w-5" />
                                Unused Subscriptions - Potential Savings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-3 bg-orange-100 rounded-lg mb-4">
                                <p className="text-orange-800 font-medium">
                                    You could save <span className="text-xl font-bold">₹{insights.potentialSavings.toFixed(0)}/month</span> ({insights.potentialSavings * 12}/year) by cancelling unused subscriptions
                                </p>
                            </div>
                            <div className="space-y-3">
                                {insights.unusedSubscriptions?.map((sub: Subscription) => (
                                    <div key={sub.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                        <div className="flex items-center gap-3">
                                            {sub.logoUrl ? <img src={sub.logoUrl} alt={sub.name} className="w-8 h-8 rounded" /> :
                                                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-sm font-bold">{sub.name.charAt(0)}</div>}
                                            <div>
                                                <p className="font-medium text-sm">{sub.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {sub.lastUsedDate 
                                                        ? `Last used ${Math.floor((Date.now() - new Date(sub.lastUsedDate).getTime()) / (1000 * 60 * 60 * 24))} days ago`
                                                        : 'Never used'}
                                                    {' • '}
                                                    {sub.usageFrequency === 'NEVER' ? 'Marked as never used' : sub.usageFrequency.toLowerCase()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">₹{calculateMonthlyAmount(Number(sub.amount), sub.billingCycle).toFixed(0)}/mo</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-6 md:grid-cols-2 mb-6">
                    <Card>
                        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Lightbulb className="h-5 w-5 text-yellow-500" />Insights</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex items-start gap-3">
                                    <DollarSign className="h-5 w-5 text-blue-500 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-sm">Annual Spending</p>
                                        <p className="text-sm text-muted-foreground">You spend <span className="font-bold text-blue-600">₹{insights?.annualTotal.toFixed(0)}</span> per year on subscriptions</p>
                                    </div>
                                </div>
                            </div>
                            {insights?.topCategory && (
                                <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                                    <div className="flex items-start gap-3">
                                        <TrendingUp className="h-5 w-5 text-purple-500 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-sm">Top Category</p>
                                            <p className="text-sm text-muted-foreground"><span className="font-bold text-purple-600">{insights.topCategoryPercent}%</span> of your spending goes to <span className="font-bold">{insights.topCategory}</span></p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {insights && insights.unusedCount > 0 && (
                                <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-sm">Unused Subscriptions</p>
                                            <p className="text-sm text-muted-foreground">You have <span className="font-bold text-orange-600">{insights.unusedCount}</span> subscription{insights.unusedCount > 1 ? 's' : ''} that might be unused</p>
                                            <p className="text-sm text-orange-700 font-medium mt-1">Save ₹{insights.potentialSavings.toFixed(0)}/month by cancelling</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                                <div className="flex items-start gap-3">
                                    <Wallet className="h-5 w-5 text-green-500 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-sm">Daily Cost</p>
                                        <p className="text-sm text-muted-foreground">Your subscriptions cost <span className="font-bold text-green-600">₹{((insights?.monthlyTotal || 0) / 30).toFixed(2)}</span> per day</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5" />Spending by Category</CardTitle></CardHeader>
                        <CardContent><SimplePieChart data={insights?.categoryBreakdown || []} /></CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Upcoming This Week</CardTitle>
                            <Button variant="outline" size="sm" asChild><Link href="/upcoming">View All</Link></Button>
                        </CardHeader>
                        <CardContent>
                            {insights?.upcomingSubs?.map((sub: Subscription) => (
                                <div key={sub.id} className="flex items-center justify-between py-2">
                                    <div className="flex items-center gap-3">
                                        {sub.logoUrl ? <img src={sub.logoUrl} alt={sub.name} className="w-8 h-8 rounded" /> :
                                            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-sm font-bold">{sub.name.charAt(0)}</div>}
                                        <div>
                                            <p className="font-medium text-sm">{sub.name}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(sub.nextBillingDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">₹{Number(sub.amount).toFixed(2)}</p>
                                        <p className="text-xs text-green-600">₹{(calculateMonthlyAmount(Number(sub.amount), sub.billingCycle) * 12).toFixed(0)}/yr</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <SubscriptionFormDialog>
                                <Button className="w-full justify-start" variant="outline"><Plus className="mr-2 h-4 w-4" />Add New Subscription</Button>
                            </SubscriptionFormDialog>
                            <UtilityBillFormDialog>
                                <Button className="w-full justify-start" variant="outline"><Zap className="mr-2 h-4 w-4" />Add Utility Bill</Button>
                            </UtilityBillFormDialog>
                            <Button className="w-full justify-start" variant="outline" asChild><Link href="/subscriptions"><Target className="mr-2 h-4 w-4" />View All Subscriptions</Link></Button>
                            <Button className="w-full justify-start" variant="outline" asChild><Link href="/utility-bills"><Zap className="mr-2 h-4 w-4" />Utility Bills</Link></Button>
                            <Button className="w-full justify-start" variant="outline" asChild><Link href="/analytics"><TrendingUp className="mr-2 h-4 w-4" />View Analytics</Link></Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Download className="h-5 w-5" />
                                Export Data
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button 
                                className="w-full justify-start" 
                                variant="outline"
                                onClick={exportToCSV}
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                Download CSV
                            </Button>
                            <Button 
                                className="w-full justify-start" 
                                variant="outline"
                                onClick={exportToPDF}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF Report
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
