"use client"

import { useSubscriptions } from "@/features/subscriptions/api/use-subscriptions"
import { useUtilityBills } from "@/features/subscriptions/api/use-utility-bills"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SubscriptionFormDialog } from "@/features/subscriptions/components/subscription-form-dialog"
import { UtilityBillFormDialog } from "@/features/subscriptions/components/utility-bill-form-dialog"
import { Plus, TrendingUp, DollarSign, AlertCircle, Sparkles, Lightbulb, Target, Wallet, CheckCircle, Clock, Check, Download, FileText, Zap, ShieldCheck, CreditCard, BarChart3, AlertTriangle, RefreshCw, PlusCircle, MoreVertical } from "lucide-react"
import { useMemo } from "react"
import Link from "next/link"
import { exportToCSV, exportToPDF } from "@/features/subscriptions/api/use-export"
import { useSafeToSpend } from "@/features/budgets/api/use-safe-to-spend"
import { useBudgets } from "@/features/budgets/api/use-budgets"
import { IncomeDialog } from "@/features/budgets/components/income-dialog"
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
    const colors = ["#46f1c5", "#adc6ff", "#dfd0ff", "#64748b", "#00D4AA", "#00C49F", "#FFBB28", "#FF8042", "#a4de6c", "#d0ed57"]
    return colors[index % colors.length]
}

function SimplePieChart({ data, total }: { data: { name: string; value: number; color: string }[]; total: number }) {
    const dataTotal = data.reduce((sum, item) => sum + item.value, 0)
    let cumulativePercent = 0

    const slices = data.map((item) => {
        const percent = dataTotal > 0 ? (item.value / dataTotal) * 100 : 0
        const startAngle = cumulativePercent * 3.6
        cumulativePercent += percent
        const endAngle = cumulativePercent * 3.6

        const startRad = (startAngle - 90) * (Math.PI / 180)
        const endRad = (endAngle - 90) * (Math.PI / 180)

        const outerR = 48
        const innerR = 30

        const x1o = 50 + outerR * Math.cos(startRad)
        const y1o = 50 + outerR * Math.sin(startRad)
        const x2o = 50 + outerR * Math.cos(endRad)
        const y2o = 50 + outerR * Math.sin(endRad)

        const x1i = 50 + innerR * Math.cos(endRad)
        const y1i = 50 + innerR * Math.sin(endRad)
        const x2i = 50 + innerR * Math.cos(startRad)
        const y2i = 50 + innerR * Math.sin(startRad)

        const largeArcFlag = percent > 50 ? 1 : 0

        const path = `M ${x1o} ${y1o} A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${x2i} ${y2i} Z`

        return { path, color: item.color }
    })

    if (dataTotal === 0) return <div className="flex items-center justify-center h-64 text-[#bacac2] text-sm">No data</div>

    return (
        <div className="relative w-64 h-64 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full">
                {slices.map((slice, i) => (<path key={i} d={slice.path} fill={slice.color} />))}
                <circle cx="50" cy="50" r="29" fill="#0a0e19" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[#bacac2] text-xs font-bold uppercase tracking-widest">Total</p>
                <p className="text-2xl font-black text-[#dfe2f2] font-[family-name:var(--font-plus-jakarta)]">{total.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</p>
            </div>
        </div>
    )
}

export function DashboardContent({ userName }: { userName: string }) {
    const { data, isLoading } = useSubscriptions()
    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`
    const { data: stsData } = useSafeToSpend(currentMonth)
    const { data: budgetsData } = useBudgets(currentMonth)

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
                // Give new subscriptions a 30-day grace period before flagging as unused
                const daysSinceCreated = Math.floor((Date.now() - new Date(sub.createdAt).getTime()) / (1000 * 60 * 60 * 24))
                if (daysSinceCreated < 30) return false
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
            categoryBreakdownRaw: sortedCategories.map(([name, value], index) => ({
                name,
                value,
                color: getCategoryColor(index)
            })),
            upcomingSubs: activeSubscriptions.slice(0, 4),
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
        return (
            <div className="pt-4 pb-12 px-6 md:px-10 max-w-7xl mx-auto">
                {/* Hero skeleton */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="h-9 w-64 bg-[#1b1f2b] rounded-xl animate-pulse" />
                        <div className="h-5 w-80 mt-2 bg-[#1b1f2b] rounded-xl animate-pulse" />
                    </div>
                    <div className="h-12 w-32 bg-[#1b1f2b] rounded-xl animate-pulse" />
                </div>

                {/* Stat cards skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="glass-card rounded-xl p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-10 w-10 bg-white/[0.06] rounded-lg animate-pulse" />
                                <div className="h-6 w-20 bg-white/[0.06] rounded-full animate-pulse" />
                            </div>
                            <div className="h-4 w-32 bg-white/[0.06] rounded animate-pulse mb-2" />
                            <div className="h-9 w-24 bg-white/[0.06] rounded animate-pulse" />
                        </div>
                    ))}
                </div>

                {/* Main grid skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 mb-10">
                    <div className="lg:col-span-6 glass-card rounded-xl p-6">
                        <div className="h-6 w-40 bg-white/[0.06] rounded animate-pulse mb-6" />
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-16 bg-white/[0.06] rounded-xl animate-pulse" />
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-4 glass-card rounded-xl p-6">
                        <div className="h-6 w-32 bg-white/[0.06] rounded animate-pulse mb-8" />
                        <div className="h-64 w-64 mx-auto bg-white/[0.06] rounded-full animate-pulse" />
                    </div>
                </div>

                {/* Recent activity skeleton */}
                <div className="glass-card rounded-xl p-8">
                    <div className="h-6 w-40 bg-white/[0.06] rounded animate-pulse mb-8" />
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-6">
                                <div className="h-10 w-10 bg-white/[0.06] rounded-full animate-pulse shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-48 bg-white/[0.06] rounded animate-pulse" />
                                    <div className="h-3 w-64 bg-white/[0.06] rounded animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const subscriptions: Subscription[] = data?.data || []

    if (subscriptions.length === 0) {
        return (
            <div className="pt-4 pb-12 px-6 md:px-10 max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-extrabold font-[family-name:var(--font-plus-jakarta)] text-[#dfe2f2] tracking-tight mb-2">Subscription Overview</h2>
                        <p className="text-[#bacac2] font-medium">Welcome back, {userName}. Start tracking your subscriptions.</p>
                    </div>
                </div>

                {/* Empty State Card */}
                <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#00D4AA]/10 flex items-center justify-center mb-5">
                        <Sparkles className="h-8 w-8 text-[#46f1c5]" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-[#dfe2f2] font-[family-name:var(--font-plus-jakarta)]">Welcome to Subscription Tracker!</h3>
                    <p className="text-[#bacac2] text-center mb-6">Add your first subscription to start tracking your spending.</p>
                    <SubscriptionFormDialog>
                        <button className="px-6 py-3 bg-[#00D4AA] text-[#005643] font-bold rounded-xl flex items-center gap-2 hover:shadow-[0_10px_30px_rgba(0,212,170,0.3)] hover:scale-[1.02] transition-all active:scale-95">
                            <Plus className="h-5 w-5" />
                            Add Your First Subscription
                        </button>
                    </SubscriptionFormDialog>
                </div>
            </div>
        )
    }

    // Determine upcoming bills with status
    const upcomingBills = insights?.upcomingSubs?.map((sub: Subscription) => {
        const dueDate = new Date(sub.nextBillingDate)
        const now = new Date()
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        let status: "paid" | "pending" | "overdue" = "pending"
        if (sub.paymentStatus === "SUCCESS") status = "paid"
        else if (sub.paymentStatus === "OVERDUE" || sub.paymentStatus === "FAILED" || daysUntilDue < 0) status = "overdue"

        return { ...sub, dueDate, daysUntilDue, status }
    }) || []

    // Recent activity from subscriptions
    const recentActivity = subscriptions.slice(0, 3).map((sub, i) => {
        if (sub.paymentStatus === "SUCCESS" && sub.lastPaidDate) {
            return {
                icon: <RefreshCw className="h-4 w-4 text-[#46f1c5]" />,
                borderColor: "border-[#46f1c5]/40",
                shadowColor: "shadow-[0_0_10px_rgba(70,241,197,0.2)]",
                title: `Payment successful for ${sub.name}`,
                detail: `${new Date(sub.lastPaidDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}${sub.paymentMethod ? ` via ${sub.paymentMethod}` : ""}`,
            }
        }
        if (sub.paymentStatus === "OVERDUE" || sub.paymentStatus === "FAILED") {
            return {
                icon: <AlertTriangle className="h-4 w-4 text-[#ffb4ab]" />,
                borderColor: "border-[#ffb4ab]/40",
                shadowColor: "",
                title: `Payment overdue for ${sub.name}`,
                detail: `Due ${new Date(sub.nextBillingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
            }
        }
        return {
            icon: <PlusCircle className="h-4 w-4 text-[#dfd0ff]" />,
            borderColor: "border-[#dfd0ff]/40",
            shadowColor: "",
            title: `Subscription active: ${sub.name}`,
            detail: `${sub.category} - ${new Date(sub.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
        }
    })

    return (
        <div className="pt-4 pb-12 px-6 md:px-10 max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-extrabold font-[family-name:var(--font-plus-jakarta)] text-[#dfe2f2] tracking-tight mb-2">Subscription Overview</h2>
                    <p className="text-[#bacac2] font-medium">Welcome back, {userName}. Your financial observatory is active.</p>
                </div>
                <SubscriptionFormDialog>
                    <button className="px-6 py-3 bg-[#00D4AA] text-[#005643] font-bold rounded-xl flex items-center gap-2 hover:shadow-[0_10px_30px_rgba(0,212,170,0.3)] hover:scale-[1.02] transition-all active:scale-95">
                        <Plus className="h-5 w-5" />
                        Add New
                    </button>
                </SubscriptionFormDialog>
            </div>

            {/* 4 Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {/* Active Subscriptions */}
                <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#46f1c5]/10 rounded-full blur-3xl group-hover:bg-[#46f1c5]/20 transition-colors" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-[#46f1c5]/10 rounded-lg text-[#46f1c5]">
                            <CreditCard className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold text-[#46f1c5] px-2 py-1 bg-[#46f1c5]/10 rounded-full">{insights?.activeCount || 0} active</span>
                    </div>
                    <h3 className="text-[#bacac2] text-sm font-medium mb-1">Active Subscriptions</h3>
                    <p className="text-3xl font-extrabold font-[family-name:var(--font-plus-jakarta)] text-[#dfe2f2]">{insights?.activeCount || 0}</p>
                </div>

                {/* Monthly Spending */}
                <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#0566d9]/10 rounded-full blur-3xl group-hover:bg-[#0566d9]/20 transition-colors" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-[#0566d9]/10 rounded-lg text-[#adc6ff]">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold text-[#adc6ff] px-2 py-1 bg-[#0566d9]/10 rounded-full">per month</span>
                    </div>
                    <h3 className="text-[#bacac2] text-sm font-medium mb-1">Monthly Spending</h3>
                    <p className="text-3xl font-extrabold font-[family-name:var(--font-plus-jakarta)] text-[#dfe2f2]">{(insights?.monthlyTotal || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</p>
                </div>

                {/* Yearly Projection */}
                <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#c6afff]/10 rounded-full blur-3xl group-hover:bg-[#c6afff]/20 transition-colors" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-[#c6afff]/10 rounded-lg text-[#dfd0ff]">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold text-[#dfd0ff] px-2 py-1 bg-[#c6afff]/10 rounded-full">Projected</span>
                    </div>
                    <h3 className="text-[#bacac2] text-sm font-medium mb-1">Yearly Projection</h3>
                    <p className="text-3xl font-extrabold font-[family-name:var(--font-plus-jakarta)] text-[#dfe2f2]">{(insights?.annualTotal || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</p>
                </div>

                {/* Upcoming Bills */}
                <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#ffb4ab]/10 rounded-full blur-3xl group-hover:bg-[#ffb4ab]/20 transition-colors" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-[#ffb4ab]/10 rounded-lg text-[#ffb4ab]">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold text-[#ffb4ab] px-2 py-1 bg-[#ffb4ab]/10 rounded-full">{insights?.overdueCount || 0} due soon</span>
                    </div>
                    <h3 className="text-[#bacac2] text-sm font-medium mb-1">Upcoming Bills</h3>
                    <p className="text-3xl font-extrabold font-[family-name:var(--font-plus-jakarta)] text-[#dfe2f2]">{(insights?.pendingAmount || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</p>
                </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 mb-10">
                {/* Left: Upcoming Bills Table (60%) */}
                <div className="lg:col-span-6 glass-card rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-white/[0.06] flex justify-between items-center">
                        <h3 className="text-lg font-bold font-[family-name:var(--font-plus-jakarta)] text-[#dfe2f2]">Upcoming Bills</h3>
                        <Link href="/upcoming" className="text-[#46f1c5] text-sm font-bold hover:underline">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left">
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-[#bacac2]/60">Service</th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-[#bacac2]/60">Due Date</th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-[#bacac2]/60">Amount</th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-[#bacac2]/60 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.06]">
                                {upcomingBills.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                {sub.logoUrl ? (
                                                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center p-1.5 overflow-hidden">
                                                        <img alt={sub.name} className="w-full h-full object-contain" src={sub.logoUrl} />
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-[#46f1c5]/10 flex items-center justify-center text-sm font-bold text-[#46f1c5]">
                                                        {sub.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-bold text-[#dfe2f2]">{sub.name}</p>
                                                    <p className="text-xs text-[#bacac2]">{sub.category}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-medium text-[#dfe2f2]">
                                            {sub.dueDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                                        </td>
                                        <td className="px-6 py-5 text-sm font-extrabold text-[#dfe2f2]">
                                            {Number(sub.amount).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {sub.status === "paid" && (
                                                <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#46f1c5]/10 text-[#46f1c5]">Paid</span>
                                            )}
                                            {sub.status === "pending" && (
                                                <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#dfd0ff]/10 text-[#dfd0ff]">Pending</span>
                                            )}
                                            {sub.status === "overdue" && (
                                                <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#ffb4ab]/10 text-[#ffb4ab]">Overdue</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {upcomingBills.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-sm text-[#bacac2]">No upcoming bills</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Spending by Category Donut (40%) */}
                <div className="lg:col-span-4 glass-card rounded-xl p-6 flex flex-col items-center">
                    <div className="w-full flex justify-between items-center mb-8">
                        <h3 className="text-lg font-bold font-[family-name:var(--font-plus-jakarta)] text-[#dfe2f2]">By Category</h3>
                        <div className="p-2 bg-[#313441] rounded-lg cursor-pointer">
                            <MoreVertical className="h-4 w-4 text-[#bacac2]" />
                        </div>
                    </div>
                    <SimplePieChart
                        data={insights?.categoryBreakdownRaw || []}
                        total={insights?.monthlyTotal || 0}
                    />
                    <div className="w-full space-y-3 mt-8">
                        {insights?.categoryBreakdownRaw?.slice(0, 4).map((cat, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                    <span className="text-sm font-medium text-[#bacac2]">{cat.name}</span>
                                </div>
                                <span className="text-sm font-bold text-[#dfe2f2]">{cat.value.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity Timeline */}
            {recentActivity.length > 0 && (
                <section className="glass-card rounded-xl p-8">
                    <h3 className="text-lg font-bold font-[family-name:var(--font-plus-jakarta)] text-[#dfe2f2] mb-8">Recent Activity</h3>
                    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-1/2 before:bg-white/[0.08]">
                        {recentActivity.map((activity, i) => (
                            <div key={i} className="relative flex items-center gap-6 group">
                                <div className={cn(
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#313441] z-10 transition-transform group-hover:scale-110",
                                    activity.borderColor,
                                    "border",
                                    activity.shadowColor
                                )}>
                                    {activity.icon}
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-sm font-bold text-[#dfe2f2]">{activity.title}</p>
                                    <p className="text-xs text-[#bacac2]">{activity.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}
