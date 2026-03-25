"use client"

import { useSubscriptions } from "@/features/subscriptions/api/use-subscriptions"
import { useUtilityBills } from "@/features/subscriptions/api/use-utility-bills"
import { Button } from "@/components/ui/button"
import { SubscriptionFormDialog } from "@/features/subscriptions/components/subscription-form-dialog"
import { Plus, TrendingUp, DollarSign, AlertCircle, Sparkles, Lightbulb, Target, Wallet, CheckCircle, Clock, Check, Zap, ShieldCheck, CreditCard, BarChart3, AlertTriangle, RefreshCw, PlusCircle, MoreVertical, Droplets, Flame, Wifi, Smartphone, Building } from "lucide-react"
import { useMemo } from "react"
import Link from "next/link"
import { useSafeToSpend } from "@/features/budgets/api/use-safe-to-spend"
import { useBudgets } from "@/features/budgets/api/use-budgets"
import { useBudgetAnalytics } from "@/features/budgets/api/use-budget-analytics"
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

const INR = (val: number, decimals = 0) =>
    val.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: decimals })

// ---------- Chart Components ----------

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

    if (dataTotal === 0) return <div className="flex items-center justify-center h-52 text-[#bacac2] text-sm">No data</div>

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-52 h-52 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    {slices.map((slice, i) => (<path key={i} d={slice.path} fill={slice.color} />))}
                    <circle cx="50" cy="50" r="29" fill="#0a0e19" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-[#bacac2] text-[10px] font-bold uppercase tracking-widest">Total</p>
                    <p className="text-xl font-black text-[#dfe2f2] font-[family-name:var(--font-plus-jakarta)]">{INR(total)}</p>
                </div>
            </div>
            <div className="w-full space-y-2 mt-6">
                {data.slice(0, 5).map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-xs font-medium text-[#bacac2]">{item.name}</span>
                        </div>
                        <span className="text-xs font-bold text-[#dfe2f2]">{INR(item.value)}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

function StackedBarChart({ data }: { data: { label: string; subscriptions: number; utilities: number; expenses: number }[] }) {
    const maxValue = Math.max(...data.map(d => d.subscriptions + d.utilities + d.expenses), 1)

    return (
        <div className="space-y-5">
            {data.map((month, i) => {
                const total = month.subscriptions + month.utilities + month.expenses
                const isCurrentMonth = i === data.length - 1
                const subW = (month.subscriptions / maxValue) * 100
                const utilW = (month.utilities / maxValue) * 100
                const expW = (month.expenses / maxValue) * 100
                return (
                    <div key={i} className="flex items-center gap-4">
                        <span className="text-xs text-[#bacac2] w-10 shrink-0">{month.label}</span>
                        <div className="flex-1 h-4 bg-[#171b27] rounded-full overflow-hidden flex">
                            {month.subscriptions > 0 && (
                                <div className="h-full bg-[#46f1c5]" style={{ width: `${subW}%` }} />
                            )}
                            {month.utilities > 0 && (
                                <div className="h-full bg-[#adc6ff]" style={{ width: `${utilW}%` }} />
                            )}
                            {month.expenses > 0 && (
                                <div className="h-full bg-[#dfd0ff]" style={{ width: `${expW}%` }} />
                            )}
                        </div>
                        <span className={cn(
                            "text-xs font-bold w-16 text-right shrink-0",
                            isCurrentMonth ? "text-[#46f1c5]" : "text-white"
                        )}>
                            {total >= 1000 ? `₹${(total / 1000).toFixed(1)}k` : `₹${total.toFixed(0)}`}
                        </span>
                    </div>
                )
            })}
            {/* Legend */}
            <div className="flex gap-6 pt-2">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#46f1c5]" /><span className="text-[10px] text-[#bacac2]">Subscriptions</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#adc6ff]" /><span className="text-[10px] text-[#bacac2]">Utilities</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#dfd0ff]" /><span className="text-[10px] text-[#bacac2]">Expenses</span></div>
            </div>
        </div>
    )
}

// ---------- Main Component ----------

export function DashboardContent({ userName }: { userName: string }) {
    const { data, isLoading } = useSubscriptions()
    const { data: utilityBillsData, isLoading: utilLoading } = useUtilityBills()
    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`
    const { data: stsData } = useSafeToSpend(currentMonth)
    const { data: budgetsData } = useBudgets(currentMonth)
    const { data: budgetAnalyticsData } = useBudgetAnalytics(6)

    const insights = useMemo(() => {
        const subscriptions: Subscription[] = data?.data || []
        if (subscriptions.length === 0 && !utilityBillsData?.data?.length && !budgetsData?.data?.length) return null

        const activeSubscriptions = subscriptions.filter(sub => sub.status === "ACTIVE")
        const now = new Date()

        // --- Subscription totals ---
        const subscriptionMonthlyTotal = activeSubscriptions.reduce(
            (sum, sub) => sum + calculateMonthlyAmount(Number(sub.amount), sub.billingCycle), 0
        )

        // --- Utility bill totals ---
        const utilityBills: any[] = utilityBillsData?.data || []
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
        const utilityMonthlyTotal = utilityBills.reduce((sum: number, bill: any) => {
            const currentRecord = bill.billRecords?.find((r: any) => {
                const recordDate = new Date(r.billingMonth)
                return `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, "0")}` === currentMonthStr
            })
            return sum + Number(currentRecord?.amount || bill.amount || 0)
        }, 0)

        // --- Manual budget expense totals (exclude subscription spend to avoid double-counting) ---
        const budgets: any[] = budgetsData?.data || []
        const manualExpenseTotal = budgets.reduce((sum: number, b: any) => sum + Number(b.manualSpent || 0), 0)

        // --- Combined totals ---
        const totalMonthlySpend = subscriptionMonthlyTotal + utilityMonthlyTotal + manualExpenseTotal
        const annualProjection = totalMonthlySpend * 12

        // --- Unified category breakdown ---
        const categoryMap: Record<string, number> = {}

        activeSubscriptions.forEach(sub => {
            const monthlyAmount = calculateMonthlyAmount(Number(sub.amount), sub.billingCycle)
            categoryMap[sub.category] = (categoryMap[sub.category] || 0) + monthlyAmount
        })

        utilityBills.forEach((bill: any) => {
            const cat = bill.category || "Utilities"
            const currentRecord = bill.billRecords?.find((r: any) => {
                const rd = new Date(r.billingMonth)
                return `${rd.getFullYear()}-${String(rd.getMonth() + 1).padStart(2, "0")}` === currentMonthStr
            })
            categoryMap[cat] = (categoryMap[cat] || 0) + Number(currentRecord?.amount || bill.amount || 0)
        })

        budgets.forEach((b: any) => {
            const manual = Number(b.manualSpent || 0)
            if (manual > 0) {
                categoryMap[b.category] = (categoryMap[b.category] || 0) + manual
            }
        })

        const totalCategoryAmount = Object.values(categoryMap).reduce((s, v) => s + v, 0)
        const categoryBreakdownRaw = Object.entries(categoryMap)
            .sort((a, b) => b[1] - a[1])
            .map(([name, value], index) => ({
                name,
                value,
                color: getCategoryColor(index)
            }))

        // --- Unused subscriptions ---
        const unusedSubscriptions = subscriptions.filter(sub => {
            if (sub.status !== "ACTIVE") return false
            if (sub.usageFrequency === "NEVER") return true
            if (!sub.lastUsedDate) {
                const daysSinceCreated = Math.floor((Date.now() - new Date(sub.createdAt).getTime()) / (1000 * 60 * 60 * 24))
                if (daysSinceCreated < 30) return false
                return true
            }
            const lastUsed = new Date(sub.lastUsedDate)
            const daysSinceUsed = Math.floor((Date.now() - lastUsed.getTime()) / (1000 * 60 * 60 * 24))
            const thresholds: Record<string, number> = { "DAILY": 7, "WEEKLY": 14, "MONTHLY": 45, "RARELY": 60, "NEVER": 30 }
            return daysSinceUsed > (thresholds[sub.usageFrequency] || 45)
        })
        const potentialSavings = unusedSubscriptions.reduce((sum, sub) =>
            sum + calculateMonthlyAmount(Number(sub.amount), sub.billingCycle), 0)

        // --- Payment status ---
        const overdueThisMonth = activeSubscriptions.filter(sub => {
            if (sub.paymentStatus === "OVERDUE" || sub.paymentStatus === "FAILED") return true
            if (sub.paymentStatus !== "SUCCESS" && sub.paymentStatus !== "SKIPPED") {
                return new Date(sub.nextBillingDate) < now
            }
            return false
        })

        // --- Budget health ---
        const overspentBudgets = budgets.filter((b: any) => Number(b.spent || 0) > Number(b.limit || 0))

        // --- 6-month trend ---
        const budgetAnalytics: any[] = budgetAnalyticsData?.data || []
        const trendData: { label: string; subscriptions: number; utilities: number; expenses: number }[] = []
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const label = d.toLocaleString('default', { month: 'short' })
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`

            // Subscriptions: use current monthly total (stable)
            const subAmount = subscriptionMonthlyTotal

            // Utilities: find bill records for this month
            let utilAmount = 0
            utilityBills.forEach((bill: any) => {
                const record = bill.billRecords?.find((r: any) => {
                    const rd = new Date(r.billingMonth)
                    return `${rd.getFullYear()}-${String(rd.getMonth() + 1).padStart(2, "0")}` === monthKey
                })
                if (record) utilAmount += Number(record.amount)
            })
            // If no records for past months and it's not current, use 0
            if (i === 0 && utilAmount === 0) utilAmount = utilityMonthlyTotal

            // Budget expenses: from budget analytics (use totalSpent minus subscription portion)
            let expAmount = 0
            const analyticsMonth = budgetAnalytics.find((a: any) => {
                const ad = new Date(a.month)
                return `${ad.getFullYear()}-${String(ad.getMonth() + 1).padStart(2, "0")}` === monthKey
            })
            if (analyticsMonth) {
                // totalSpent includes subscriptions, so subtract subscription portion
                expAmount = Math.max(0, Number(analyticsMonth.totalSpent || 0) - subAmount)
            }
            if (i === 0 && expAmount === 0) expAmount = manualExpenseTotal

            trendData.push({ label, subscriptions: subAmount, utilities: utilAmount, expenses: expAmount })
        }

        // --- Top 5 expenses ---
        const top5Items: { name: string; amount: number; source: string; icon: string }[] = []
        activeSubscriptions.forEach(sub => {
            top5Items.push({
                name: sub.name,
                amount: calculateMonthlyAmount(Number(sub.amount), sub.billingCycle),
                source: "subscription",
                icon: sub.name.charAt(0)
            })
        })
        utilityBills.forEach((bill: any) => {
            const currentRecord = bill.billRecords?.find((r: any) => {
                const rd = new Date(r.billingMonth)
                return `${rd.getFullYear()}-${String(rd.getMonth() + 1).padStart(2, "0")}` === currentMonthStr
            })
            top5Items.push({
                name: bill.name,
                amount: Number(currentRecord?.amount || bill.amount || 0),
                source: "utility",
                icon: bill.name.charAt(0)
            })
        })
        budgets.forEach((b: any) => {
            const manual = Number(b.manualSpent || 0)
            if (manual > 0) {
                top5Items.push({
                    name: b.category,
                    amount: manual,
                    source: "expense",
                    icon: b.category.charAt(0)
                })
            }
        })
        top5Items.sort((a, b) => b.amount - a.amount)

        // --- Upcoming bills ---
        const upcomingSubs = activeSubscriptions
            .filter(s => s.paymentStatus !== "SUCCESS")
            .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime())
            .slice(0, 4)

        // --- Recent activity ---
        const recentActivity = subscriptions.slice(0, 3).map((sub) => {
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

        return {
            subscriptionMonthlyTotal,
            utilityMonthlyTotal,
            manualExpenseTotal,
            totalMonthlySpend,
            annualProjection,
            categoryBreakdownRaw,
            totalCategoryAmount,
            activeCount: activeSubscriptions.length,
            utilityCount: utilityBills.length,
            budgetCount: budgets.length,
            unusedCount: unusedSubscriptions.length,
            potentialSavings,
            overdueCount: overdueThisMonth.length,
            overspentBudgets,
            trendData,
            top5Items: top5Items.slice(0, 5),
            upcomingSubs,
            recentActivity,
            budgets,
        }
    }, [data, utilityBillsData, budgetsData, budgetAnalyticsData, stsData])

    if (isLoading || utilLoading) {
        return (
            <div className="pt-4 pb-12 px-6 md:px-10 max-w-7xl mx-auto">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="h-9 w-64 bg-[#1b1f2b] rounded-xl animate-pulse" />
                        <div className="h-5 w-80 mt-2 bg-[#1b1f2b] rounded-xl animate-pulse" />
                    </div>
                    <div className="h-12 w-32 bg-[#1b1f2b] rounded-xl animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="glass-card rounded-xl p-6 h-36 animate-pulse" />
                    ))}
                </div>
                <div className="glass-card rounded-xl p-8 mb-10 h-72 animate-pulse" />
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 mb-10">
                    <div className="lg:col-span-6 glass-card rounded-xl p-6 h-64 animate-pulse" />
                    <div className="lg:col-span-4 glass-card rounded-xl p-6 h-64 animate-pulse" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <div className="glass-card rounded-xl p-6 h-64 animate-pulse" />
                    <div className="glass-card rounded-xl p-6 h-64 animate-pulse" />
                </div>
            </div>
        )
    }

    const subscriptions: Subscription[] = data?.data || []

    if (!insights || (subscriptions.length === 0 && !utilityBillsData?.data?.length)) {
        return (
            <div className="pt-4 pb-12 px-6 md:px-10 max-w-7xl mx-auto">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-extrabold font-[family-name:var(--font-plus-jakarta)] text-[#dfe2f2] tracking-tight mb-2">Subscription Overview</h2>
                        <p className="text-[#bacac2] font-medium">Welcome back, {userName}. Start tracking your subscriptions.</p>
                    </div>
                </div>
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

    // Safe-to-spend data
    const safeToSpend = stsData?.data
    const monthlyIncome = Number(safeToSpend?.monthlyIncome || 0)
    const safeAmount = Number(safeToSpend?.safeToSpend || 0)
    const safePercent = monthlyIncome > 0 ? (safeAmount / monthlyIncome) * 100 : 0
    const safeColor = safePercent > 20 ? "#46f1c5" : safePercent > 5 ? "#F59E0B" : "#ffb4ab"

    // Upcoming bills with status
    const upcomingBills = insights.upcomingSubs.map((sub: Subscription) => {
        const dueDate = new Date(sub.nextBillingDate)
        const nowDate = new Date()
        const daysUntilDue = Math.ceil((dueDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24))
        let status: "paid" | "pending" | "overdue" = "pending"
        if (sub.paymentStatus === "SUCCESS") status = "paid"
        else if (sub.paymentStatus === "OVERDUE" || sub.paymentStatus === "FAILED" || daysUntilDue < 0) status = "overdue"
        return { ...sub, dueDate, daysUntilDue, status }
    })

    const now = new Date()
    const currentMonthName = now.toLocaleString('default', { month: 'long', year: 'numeric' })

    // Source breakdown
    const sourceTotal = insights.totalMonthlySpend || 1
    const sources = [
        { label: "Subscriptions", amount: insights.subscriptionMonthlyTotal, color: "#46f1c5", count: insights.activeCount, icon: <CreditCard className="h-4 w-4" /> },
        { label: "Utility Bills", amount: insights.utilityMonthlyTotal, color: "#adc6ff", count: insights.utilityCount, icon: <Zap className="h-4 w-4" /> },
        { label: "Manual Expenses", amount: insights.manualExpenseTotal, color: "#dfd0ff", count: insights.budgetCount, icon: <Wallet className="h-4 w-4" /> },
    ]

    return (
        <div className="pt-4 pb-12 px-6 md:px-10 max-w-7xl mx-auto">

            {/* ===== Section A: Hero ===== */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-extrabold font-[family-name:var(--font-plus-jakarta)] text-[#dfe2f2] tracking-tight mb-2">
                        Financial Overview
                    </h2>
                    <p className="text-[#bacac2] font-medium">
                        Welcome back, {userName}. Here&apos;s your spending snapshot for {currentMonthName}.
                    </p>
                </div>
                <div className="flex gap-3">
                    <IncomeDialog currentIncome={monthlyIncome || undefined}>
                        <button className="px-5 py-3 bg-white/5 text-[#dfe2f2] font-bold rounded-xl flex items-center gap-2 hover:bg-white/10 transition-all border border-white/[0.06] text-sm">
                            <DollarSign className="h-4 w-4" />
                            Set Income
                        </button>
                    </IncomeDialog>
                    <SubscriptionFormDialog>
                        <button className="px-5 py-3 bg-[#00D4AA] text-[#005643] font-bold rounded-xl flex items-center gap-2 hover:shadow-[0_10px_30px_rgba(0,212,170,0.3)] hover:scale-[1.02] transition-all active:scale-95 text-sm">
                            <Plus className="h-4 w-4" />
                            Add New
                        </button>
                    </SubscriptionFormDialog>
                </div>
            </div>

            {/* ===== Section B: 4 Stat Cards ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {/* Total Monthly Spend */}
                <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#46f1c5]/10 rounded-full blur-3xl group-hover:bg-[#46f1c5]/20 transition-colors" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-[#46f1c5]/10 rounded-lg text-[#46f1c5]">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold text-[#46f1c5] px-2 py-1 bg-[#46f1c5]/10 rounded-full">all sources</span>
                    </div>
                    <h3 className="text-[#bacac2] text-sm font-medium mb-1">Total Monthly Spend</h3>
                    <p className="text-3xl font-extrabold font-[family-name:var(--font-plus-jakarta)] text-[#dfe2f2]">
                        {INR(insights.totalMonthlySpend)}
                    </p>
                </div>

                {/* Safe to Spend */}
                <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl transition-colors" style={{ backgroundColor: `${safeColor}15` }} />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${safeColor}15` }}>
                            <ShieldCheck className="h-6 w-6" style={{ color: safeColor }} />
                        </div>
                        {monthlyIncome > 0 && (
                            <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ color: safeColor, backgroundColor: `${safeColor}15` }}>
                                {safePercent.toFixed(0)}% left
                            </span>
                        )}
                    </div>
                    <h3 className="text-[#bacac2] text-sm font-medium mb-1">Safe to Spend</h3>
                    <p className="text-3xl font-extrabold font-[family-name:var(--font-plus-jakarta)] text-[#dfe2f2]">
                        {monthlyIncome > 0 ? INR(safeAmount) : "Set Income"}
                    </p>
                </div>

                {/* Yearly Projection */}
                <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#adc6ff]/10 rounded-full blur-3xl group-hover:bg-[#adc6ff]/20 transition-colors" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-[#adc6ff]/10 rounded-lg text-[#adc6ff]">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold text-[#adc6ff] px-2 py-1 bg-[#adc6ff]/10 rounded-full">projected</span>
                    </div>
                    <h3 className="text-[#bacac2] text-sm font-medium mb-1">Yearly Projection</h3>
                    <p className="text-3xl font-extrabold font-[family-name:var(--font-plus-jakarta)] text-[#dfe2f2]">
                        {INR(insights.annualProjection)}
                    </p>
                </div>

                {/* Potential Savings */}
                <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#dfd0ff]/10 rounded-full blur-3xl group-hover:bg-[#dfd0ff]/20 transition-colors" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-[#dfd0ff]/10 rounded-lg text-[#dfd0ff]">
                            <Lightbulb className="h-6 w-6" />
                        </div>
                        {insights.unusedCount > 0 && (
                            <span className="text-xs font-bold text-[#dfd0ff] px-2 py-1 bg-[#dfd0ff]/10 rounded-full">
                                {insights.unusedCount} unused
                            </span>
                        )}
                    </div>
                    <h3 className="text-[#bacac2] text-sm font-medium mb-1">Potential Savings</h3>
                    <p className="text-3xl font-extrabold font-[family-name:var(--font-plus-jakarta)] text-[#dfe2f2]">
                        {INR(insights.potentialSavings)}
                    </p>
                </div>
            </div>

            {/* ===== Section C: 6-Month Spending Trend ===== */}
            <div className="glass-card rounded-xl p-8 mb-10">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold font-[family-name:var(--font-plus-jakarta)] text-[#dfe2f2]">Monthly Spending Trend</h3>
                    <span className="px-3 py-1 text-xs font-bold bg-[#46f1c5] text-[#005643] rounded-full">6 Months</span>
                </div>
                <StackedBarChart data={insights.trendData} />
            </div>

            {/* ===== Section D: Source Breakdown + Category Donut ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 mb-10">
                {/* Spending by Source */}
                <div className="lg:col-span-6 glass-card rounded-xl p-8">
                    <h3 className="text-lg font-bold font-[family-name:var(--font-plus-jakarta)] text-[#dfe2f2] mb-8">Spending by Source</h3>
                    <div className="space-y-6">
                        {sources.map((src) => {
                            const pct = sourceTotal > 0 ? (src.amount / sourceTotal) * 100 : 0
                            return (
                                <div key={src.label} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg" style={{ backgroundColor: `${src.color}15`, color: src.color }}>
                                                {src.icon}
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-[#dfe2f2]">{src.label}</span>
                                                <span className="text-xs text-[#bacac2] ml-2">{src.count} items</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-[#dfe2f2]">{INR(src.amount)}</span>
                                            <span className="text-xs text-[#bacac2] ml-2">{pct.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                    <div className="h-3 bg-[#171b27] rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%`, backgroundColor: src.color }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Category Donut */}
                <div className="lg:col-span-4 glass-card rounded-xl p-8">
                    <h3 className="text-lg font-bold font-[family-name:var(--font-plus-jakarta)] text-[#dfe2f2] mb-6">By Category</h3>
                    <SimplePieChart
                        data={insights.categoryBreakdownRaw}
                        total={insights.totalCategoryAmount}
                    />
                </div>
            </div>

            {/* ===== Section E: Budget Health + Top 5 ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Budget Health */}
                <div className="glass-card rounded-xl p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold font-[family-name:var(--font-plus-jakarta)] text-[#dfe2f2]">Budget Health</h3>
                        <Link href="/budgets" className="text-[#46f1c5] text-xs font-bold hover:underline">Manage</Link>
                    </div>
                    {insights.budgets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <Target className="h-10 w-10 text-[#bacac2]/30 mb-3" />
                            <p className="text-sm text-[#bacac2]">No budgets set for this month.</p>
                            <Link href="/budgets" className="text-[#46f1c5] text-xs font-bold mt-2 hover:underline">Set budgets</Link>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {insights.budgets.slice(0, 5).map((b: any) => {
                                const spent = Number(b.spent || 0)
                                const limit = Number(b.limit || 0)
                                const ratio = limit > 0 ? spent / limit : 0
                                const pct = Math.min(ratio * 100, 100)
                                const overspent = spent > limit

                                let barColor = '#46f1c5'
                                if (ratio > 0.9 && !overspent) barColor = '#F59E0B'
                                if (overspent) barColor = '#ffb4ab'

                                return (
                                    <div key={b.id}>
                                        <div className="flex justify-between mb-1.5">
                                            <span className="text-sm font-bold text-[#dfe2f2]">{b.category}</span>
                                            <span className={cn("text-xs font-bold", overspent ? "text-[#ffb4ab]" : "text-[#bacac2]")}>
                                                {INR(spent)} / {INR(limit)}
                                            </span>
                                        </div>
                                        <div className="h-2.5 bg-[#171b27] rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{ width: overspent ? '100%' : `${pct}%`, backgroundColor: barColor }}
                                            />
                                        </div>
                                        {overspent && (
                                            <p className="text-[10px] text-[#ffb4ab] font-bold mt-1">
                                                Exceeded by {INR(spent - limit)}
                                            </p>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Top 5 Expenses */}
                <div className="glass-card rounded-xl p-8">
                    <h3 className="text-lg font-bold font-[family-name:var(--font-plus-jakarta)] text-[#dfe2f2] mb-6">Top 5 Expenses</h3>
                    {insights.top5Items.length === 0 ? (
                        <div className="flex items-center justify-center py-10 text-sm text-[#bacac2]">No expenses this month</div>
                    ) : (
                        <div className="space-y-5">
                            {insights.top5Items.map((item, i) => {
                                const maxAmount = insights.top5Items[0]?.amount || 1
                                const pct = (item.amount / maxAmount) * 100
                                const sourceColor = item.source === "subscription" ? "#46f1c5" : item.source === "utility" ? "#adc6ff" : "#dfd0ff"
                                const sourceLabel = item.source === "subscription" ? "Sub" : item.source === "utility" ? "Utility" : "Expense"
                                return (
                                    <div key={`${item.name}-${i}`} className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: `${sourceColor}15`, color: sourceColor }}>
                                            {item.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between mb-1">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="text-sm font-bold text-white truncate">{item.name}</span>
                                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ backgroundColor: `${sourceColor}15`, color: sourceColor }}>
                                                        {sourceLabel}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-bold text-white shrink-0 ml-2">{INR(item.amount)}</span>
                                            </div>
                                            <div className="h-2 bg-[#171b27] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{ width: `${pct}%`, backgroundColor: sourceColor, opacity: 1 - i * 0.15 }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ===== Section F: Upcoming Bills + Alerts ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 mb-10">
                {/* Upcoming Bills Table */}
                <div className="lg:col-span-6 glass-card rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-white/[0.06] flex justify-between items-center">
                        <h3 className="text-lg font-bold font-[family-name:var(--font-plus-jakarta)] text-[#dfe2f2]">Upcoming Bills</h3>
                        <Link href="/subscriptions" className="text-[#46f1c5] text-sm font-bold hover:underline">View All</Link>
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
                                    <tr key={sub.id} className="hover:bg-white/5 transition-colors">
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
                                            {INR(Number(sub.amount), 2)}
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
                                    <tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-[#bacac2]">No upcoming bills</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Alerts & Insights */}
                <div className="lg:col-span-4 glass-card rounded-xl p-8">
                    <h3 className="text-lg font-bold font-[family-name:var(--font-plus-jakarta)] text-[#dfe2f2] mb-6">Alerts & Insights</h3>
                    <div className="space-y-4">
                        {monthlyIncome === 0 && (
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#F59E0B]/5 border border-[#F59E0B]/20">
                                <DollarSign className="h-5 w-5 text-[#F59E0B] shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-[#dfe2f2]">Set Your Income</p>
                                    <p className="text-xs text-[#bacac2] mt-0.5">Add your monthly income to unlock Safe-to-Spend tracking.</p>
                                </div>
                            </div>
                        )}

                        {insights.unusedCount > 0 && (
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#dfd0ff]/5 border border-[#dfd0ff]/20">
                                <Lightbulb className="h-5 w-5 text-[#dfd0ff] shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-[#dfe2f2]">{insights.unusedCount} Unused Subscription{insights.unusedCount > 1 ? 's' : ''}</p>
                                    <p className="text-xs text-[#bacac2] mt-0.5">You could save {INR(insights.potentialSavings)}/month by cancelling them.</p>
                                </div>
                            </div>
                        )}

                        {insights.overdueCount > 0 && (
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#ffb4ab]/5 border border-[#ffb4ab]/20">
                                <AlertTriangle className="h-5 w-5 text-[#ffb4ab] shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-[#dfe2f2]">{insights.overdueCount} Overdue Bill{insights.overdueCount > 1 ? 's' : ''}</p>
                                    <p className="text-xs text-[#bacac2] mt-0.5">You have payments past their due date.</p>
                                </div>
                            </div>
                        )}

                        {insights.overspentBudgets.length > 0 && (
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#ffb4ab]/5 border border-[#ffb4ab]/20">
                                <Target className="h-5 w-5 text-[#ffb4ab] shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-[#dfe2f2]">{insights.overspentBudgets.length} Budget{insights.overspentBudgets.length > 1 ? 's' : ''} Exceeded</p>
                                    <p className="text-xs text-[#bacac2] mt-0.5">
                                        {insights.overspentBudgets.map((b: any) => b.category).join(', ')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {monthlyIncome > 0 && insights.unusedCount === 0 && insights.overdueCount === 0 && insights.overspentBudgets.length === 0 && (
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#46f1c5]/5 border border-[#46f1c5]/20">
                                <CheckCircle className="h-5 w-5 text-[#46f1c5] shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-[#dfe2f2]">All Good!</p>
                                    <p className="text-xs text-[#bacac2] mt-0.5">No issues detected. Your finances are on track.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ===== Section G: Recent Activity ===== */}
            {insights.recentActivity.length > 0 && (
                <section className="glass-card rounded-xl p-8">
                    <h3 className="text-lg font-bold font-[family-name:var(--font-plus-jakarta)] text-[#dfe2f2] mb-8">Recent Activity</h3>
                    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-1/2 before:bg-white/[0.08]">
                        {insights.recentActivity.map((activity: any, i: number) => (
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
