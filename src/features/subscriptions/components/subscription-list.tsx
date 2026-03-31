"use client"

import { useSubscriptions } from "../api/use-subscriptions"
import { SubscriptionFormDialog } from "./subscription-form-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, Calendar, TrendingUp, Wallet, PieChart as PieChartIcon, CreditCard, ChevronLeft, ChevronRight } from "lucide-react"
import { useDeleteSubscription } from "../api/use-delete-subscription"
import { useMarkAsPaid } from "../api/use-mark-as-paid"
import { useSkipPayment } from "../api/use-skip-payment"
import { useMarkAsUsed } from "../api/use-mark-as-used"
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO, format, isBefore, addDays, addMonths, subMonths } from "date-fns"
import { Check, SkipForward, AlertCircle, CheckCircle, Clock, Zap, Search, MoreHorizontal, CalendarDays } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useMemo } from "react"

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

function advanceByCycle(date: Date, cycle: string): Date {
    switch (cycle) {
        case "WEEKLY": return addDays(date, 7)
        case "MONTHLY": return addMonths(date, 1)
        case "QUARTERLY": return addMonths(date, 3)
        case "SEMI_ANNUAL": return addMonths(date, 6)
        case "ANNUAL": return addMonths(date, 12)
        default: return addMonths(date, 1)
    }
}

function rewindByCycle(date: Date, cycle: string): Date {
    switch (cycle) {
        case "WEEKLY": return addDays(date, -7)
        case "MONTHLY": return subMonths(date, 1)
        case "QUARTERLY": return subMonths(date, 3)
        case "SEMI_ANNUAL": return subMonths(date, 6)
        case "ANNUAL": return subMonths(date, 12)
        default: return subMonths(date, 1)
    }
}

function getProjectedDateInMonth(nextBillingDate: string, billingCycle: string, mStart: Date, mEnd: Date): Date | null {
    const anchor = parseISO(nextBillingDate)

    if (billingCycle === "ONE_TIME") {
        return isWithinInterval(anchor, { start: mStart, end: mEnd }) ? anchor : null
    }

    // Walk forward from anchor
    let fwd = anchor
    while (fwd < mStart) {
        fwd = advanceByCycle(fwd, billingCycle)
    }
    if (isWithinInterval(fwd, { start: mStart, end: mEnd })) return fwd

    // Walk backward from anchor
    let bwd = anchor
    while (bwd > mEnd) {
        bwd = rewindByCycle(bwd, billingCycle)
    }
    if (isWithinInterval(bwd, { start: mStart, end: mEnd })) return bwd

    return null
}

function getCategoryColor(index: number): string {
    const colors = [
        "#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE",
        "#00C49F", "#FFBB28", "#FF8042", "#a4de6c", "#d0ed57", "#8884d8"
    ]
    return colors[index % colors.length]
}

const logoGradients = [
    "from-[#00D4AA]/30 to-[#00D4AA]/10",
    "from-[#3B82F6]/30 to-[#3B82F6]/10",
    "from-[#8B5CF6]/30 to-[#8B5CF6]/10",
    "from-[#F59E0B]/30 to-[#F59E0B]/10",
    "from-[#EF4444]/30 to-[#EF4444]/10",
    "from-[#EC4899]/30 to-[#EC4899]/10",
    "from-[#06B6D4]/30 to-[#06B6D4]/10",
]

const logoTextColors = [
    "text-[#00D4AA]",
    "text-[#3B82F6]",
    "text-[#8B5CF6]",
    "text-[#F59E0B]",
    "text-[#EF4444]",
    "text-[#EC4899]",
    "text-[#06B6D4]",
]

const logoBgColors = [
    { bg: "bg-[#00D4AA]/10", border: "border-[#00D4AA]/20", text: "text-[#00D4AA]", orb: "#00D4AA" },
    { bg: "bg-[#3B82F6]/10", border: "border-[#3B82F6]/20", text: "text-[#3B82F6]", orb: "#3B82F6" },
    { bg: "bg-[#8B5CF6]/10", border: "border-[#8B5CF6]/20", text: "text-[#8B5CF6]", orb: "#8B5CF6" },
    { bg: "bg-[#F59E0B]/10", border: "border-[#F59E0B]/20", text: "text-[#F59E0B]", orb: "#F59E0B" },
    { bg: "bg-[#EF4444]/10", border: "border-[#EF4444]/20", text: "text-[#EF4444]", orb: "#EF4444" },
    { bg: "bg-[#EC4899]/10", border: "border-[#EC4899]/20", text: "text-[#EC4899]", orb: "#EC4899" },
    { bg: "bg-[#06B6D4]/10", border: "border-[#06B6D4]/20", text: "text-[#06B6D4]", orb: "#06B6D4" },
]

function getLogoGradient(index: number) {
    return logoGradients[index % logoGradients.length]
}

function getLogoTextColor(index: number) {
    return logoTextColors[index % logoTextColors.length]
}

function getLogoColors(index: number) {
    return logoBgColors[index % logoBgColors.length]
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
            <div className="flex items-center justify-center h-40 text-[#7A8BA8] text-sm">
                No data to display
            </div>
        )
    }

    return (
        <div className="flex items-center gap-6">
            <svg viewBox="0 0 100 100" className="w-36 h-36 shrink-0">
                {slices.map((slice, i) => (
                    <path key={i} d={slice.path} fill={slice.color} className="transition-opacity hover:opacity-80" />
                ))}
                <circle cx="50" cy="50" r="25" fill="#0f1219" />
            </svg>
            <div className="flex flex-col gap-2">
                {data.map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs">
                        <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-[#7A8BA8]">{item.name}</span>
                        <span className="font-medium text-white">{item.value.toFixed(0)}%</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "ACTIVE":
            return (
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20">
                    Active
                </span>
            )
        case "CANCELLED":
            return (
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-slate-500/10 text-slate-400 border border-slate-500/20">
                    Cancelled
                </span>
            )
        case "PAUSED":
            return (
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Paused
                </span>
            )
        default:
            return (
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-white/[0.06] text-[#7A8BA8]">
                    {status}
                </span>
            )
    }
}

function getBillingCycleLabel(cycle: string): string {
    switch (cycle) {
        case "WEEKLY": return "/ week"
        case "MONTHLY": return "/ month"
        case "QUARTERLY": return "/ quarter"
        case "SEMI_ANNUAL": return "/ 6 months"
        case "ANNUAL": return "/ year"
        case "ONE_TIME": return "one-time"
        default: return "/ month"
    }
}

type StatusFilter = "ALL" | "ACTIVE" | "PAUSED" | "CANCELLED" | "UPCOMING" | "HISTORY"
type CycleFilter = "ALL" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "SEMI_ANNUAL" | "ANNUAL" | "ONE_TIME"
type HistoryFilter = "all" | "SUCCESS" | "PENDING" | "OVERDUE" | "SKIPPED"

export function SubscriptionList() {
    const { data, isLoading } = useSubscriptions()
    const deleteMutation = useDeleteSubscription()
    const markAsPaidMutation = useMarkAsPaid()
    const skipPaymentMutation = useSkipPayment()
    const markAsUsedMutation = useMarkAsUsed()

    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")
    const [cycleFilter, setCycleFilter] = useState<CycleFilter>("ALL")
    const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all")
    const [historySearch, setHistorySearch] = useState("")
    const [selectedDate, setSelectedDate] = useState(() => {
        const n = new Date()
        return new Date(n.getFullYear(), n.getMonth(), 1)
    })
    const goToPrevMonth = () => setSelectedDate(d => subMonths(d, 1))
    const goToNextMonth = () => setSelectedDate(d => addMonths(d, 1))

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this subscription?")) {
            deleteMutation.mutate({ param: { id } })
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-8">
                {/* Filter bar skeleton */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[300px] h-14 bg-white/[0.04] rounded-xl animate-pulse" />
                    <div className="h-12 w-64 bg-white/[0.04] rounded-xl animate-pulse" />
                    <div className="h-14 w-40 bg-white/[0.04] rounded-xl animate-pulse" />
                </div>

                {/* Card grid skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="glass-card rounded-3xl p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="h-14 w-14 bg-white/[0.06] rounded-2xl animate-pulse" />
                                <div className="h-6 w-16 bg-white/[0.06] rounded-full animate-pulse" />
                            </div>
                            <div className="h-5 w-32 bg-white/[0.06] rounded-lg animate-pulse mb-2" />
                            <div className="h-3 w-24 bg-white/[0.06] rounded-lg animate-pulse mb-6" />
                            <div className="h-8 w-28 bg-white/[0.06] rounded-lg animate-pulse mb-6" />
                            <div className="pt-6 border-t border-white/[0.04]">
                                <div className="h-3 w-20 bg-white/[0.06] rounded-lg animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const subscriptions: Subscription[] = data?.data || []

    const now = new Date()
    const isCurrentMonth = selectedDate.getFullYear() === now.getFullYear() && selectedDate.getMonth() === now.getMonth()
    const weekStart = startOfWeek(now)
    const weekEnd = endOfWeek(now)
    const monthStart = startOfMonth(selectedDate)
    const monthEnd = endOfMonth(selectedDate)

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

    // Upcoming bills computation
    const next30Days = addDays(now, 30)

    const overdueBills = subscriptions.filter(sub => {
        if (sub.status !== "ACTIVE") return false
        if (sub.paymentStatus === "SUCCESS" || sub.paymentStatus === "SKIPPED") return false
        const billingDate = parseISO(sub.nextBillingDate)
        return isBefore(billingDate, now)
    })

    const dueThisWeekBills = subscriptions.filter(sub => {
        if (sub.status !== "ACTIVE") return false
        const billingDate = parseISO(sub.nextBillingDate)
        return isWithinInterval(billingDate, { start: weekStart, end: weekEnd })
    })

    const dueThisMonthBills = subscriptions.filter(sub => {
        if (sub.status !== "ACTIVE") return false
        const billingDate = parseISO(sub.nextBillingDate)
        return isWithinInterval(billingDate, { start: monthStart, end: monthEnd })
    })

    const dueNext30DaysBills = subscriptions.filter(sub => {
        if (sub.status !== "ACTIVE") return false
        const billingDate = parseISO(sub.nextBillingDate)
        return isWithinInterval(billingDate, { start: now, end: next30Days })
    })

    const laterThisMonthBills = dueThisMonthBills.filter(sub => {
        const billingDate = parseISO(sub.nextBillingDate)
        const isOverdue = isBefore(billingDate, now)
        const isDueThisWeek = isWithinInterval(billingDate, { start: weekStart, end: weekEnd })
        return !isOverdue && !isDueThisWeek
    })

    const totalOverdueBills = overdueBills.reduce((sum, sub) => sum + Number(sub.amount), 0)
    const totalDueThisWeek = dueThisWeekBills.reduce((sum, sub) => sum + Number(sub.amount), 0)
    const totalDueThisMonth = dueThisMonthBills.reduce((sum, sub) => sum + Number(sub.amount), 0)

    const getDaysUntil = (dateStr: string) => {
        const date = parseISO(dateStr)
        const diffTime = date.getTime() - now.getTime()
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    const formatDueLabel = (dateStr: string) => {
        const days = getDaysUntil(dateStr)
        if (days === 0) return "Due today"
        if (days === 1) return "Due in 1 day"
        return `Due in ${days} days`
    }

    // Billing history computation — use date-based overdue detection (same as upcoming view)
    const isOverdueByDate = (sub: Subscription) => {
        if (sub.paymentStatus === "OVERDUE" || sub.paymentStatus === "FAILED") return true
        if (sub.status === "ACTIVE" && sub.paymentStatus !== "SUCCESS" && sub.paymentStatus !== "SKIPPED") {
            return isBefore(parseISO(sub.nextBillingDate), now)
        }
        return false
    }

    const totalPaid = subscriptions
        .filter(item => item.paymentStatus === "SUCCESS")
        .reduce((sum, item) => sum + Number(item.amount), 0)

    const overdueSubIds = new Set(subscriptions.filter(isOverdueByDate).map(s => s.id))

    const totalPending = subscriptions
        .filter(item => item.paymentStatus === "PENDING" && !overdueSubIds.has(item.id))
        .reduce((sum, item) => sum + Number(item.amount), 0)

    const totalOverduePayments = subscriptions
        .filter(item => isOverdueByDate(item))
        .reduce((sum, item) => sum + Number(item.amount), 0)

    const historyFilteredSubs = historyFilter === "all"
        ? subscriptions
        : historyFilter === "OVERDUE"
            ? subscriptions.filter(item => isOverdueByDate(item))
            : historyFilter === "PENDING"
                ? subscriptions.filter(item => item.paymentStatus === "PENDING" && !overdueSubIds.has(item.id))
                : subscriptions.filter(item => item.paymentStatus === historyFilter)

    const historySearchedSubs = historySearch
        ? historyFilteredSubs.filter(item =>
            item.name.toLowerCase().includes(historySearch.toLowerCase()) ||
            item.category.toLowerCase().includes(historySearch.toLowerCase())
        )
        : historyFilteredSubs

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case "SUCCESS": return "bg-[#46f1c5]/10 text-[#46f1c5] border border-[#46f1c5]/20"
            case "FAILED": return "bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/20"
            case "OVERDUE": return "bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/20"
            case "PENDING": return "bg-amber-500/10 text-amber-500 border border-amber-500/20"
            case "SKIPPED": return "bg-[#313441] text-[#bacac2]/60 border border-[#3b4a44]/30"
            default: return "bg-[#313441] text-[#bacac2]/60 border border-[#3b4a44]/30"
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "SUCCESS": return "Paid"
            case "FAILED": return "Overdue"
            case "OVERDUE": return "Overdue"
            case "PENDING": return "Pending"
            case "SKIPPED": return "Skipped"
            default: return status
        }
    }

    const getIconColor = (status: string) => {
        switch (status) {
            case "SUCCESS": return { bg: "bg-[#46f1c5]/20", text: "text-[#46f1c5]", glow: "bg-[#46f1c5]/20" }
            case "FAILED": return { bg: "bg-[#ffb4ab]/20", text: "text-[#ffb4ab]", glow: "bg-[#ffb4ab]/20" }
            case "OVERDUE": return { bg: "bg-[#ffb4ab]/20", text: "text-[#ffb4ab]", glow: "bg-[#ffb4ab]/20" }
            case "PENDING": return { bg: "bg-amber-500/20", text: "text-amber-500", glow: "bg-amber-500/20" }
            case "SKIPPED": return { bg: "bg-[#313441]", text: "text-[#bacac2]", glow: "bg-[#313441]/20" }
            default: return { bg: "bg-[#46f1c5]/20", text: "text-[#46f1c5]", glow: "bg-[#46f1c5]/20" }
        }
    }

    const getRelativeTime = (dateStr: string, status: string) => {
        const date = new Date(dateStr)
        const diffMs = date.getTime() - now.getTime()
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

        if (status === "SUCCESS") return { text: "Completed", className: "text-[#46f1c5]" }
        if (status === "SKIPPED") return { text: "Paused", className: "text-[#bacac2]/60" }
        if (diffDays < 0) return { text: `${Math.abs(diffDays)} days ago`, className: "text-[#ffb4ab]" }
        if (diffDays === 0) return { text: "Today", className: "text-amber-500" }
        if (diffDays === 1) return { text: "Tomorrow", className: "text-amber-500" }
        return { text: `In ${diffDays} days`, className: "text-amber-500" }
    }

    const historyFilterOptions = [
        { value: "all", label: "All" },
        { value: "SUCCESS", label: "Paid" },
        { value: "PENDING", label: "Pending" },
        { value: "OVERDUE", label: "Overdue" },
        { value: "SKIPPED", label: "Skipped" },
    ]

    // Filter subscriptions
    const filteredSubscriptions = subscriptions.filter(sub => {
        const matchesSearch = searchQuery === "" ||
            sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sub.category.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "ALL" || sub.status === statusFilter
        const matchesCycle = cycleFilter === "ALL" || sub.billingCycle === cycleFilter
        return matchesSearch && matchesStatus && matchesCycle
    })

    const activeCount = subscriptions.filter(s => s.status === "ACTIVE").length

    if (subscriptions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-16 glass-card rounded-2xl">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00D4AA]/20 to-[#3B82F6]/20 flex items-center justify-center mb-6">
                    <Wallet className="h-8 w-8 text-[#00D4AA]" />
                </div>
                <h3 className="text-lg font-semibold font-[family-name:var(--font-plus-jakarta)] mb-2">No subscriptions yet</h3>
                <p className="text-[#7A8BA8] text-center mb-8 max-w-sm">Start tracking your subscriptions by adding your first one. We will help you stay on top of your spending.</p>
                <SubscriptionFormDialog>
                    <Button className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-black font-medium rounded-xl px-6">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Subscription
                    </Button>
                </SubscriptionFormDialog>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header description + Add button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-[#7A8BA8] max-w-lg">
                    You have <span className="text-white font-semibold">{activeCount} active</span> services costing a total of{" "}
                    <span className="text-[#00D4AA] font-bold">&#8377;{totalMonthlySpending.toFixed(2)}</span> this month.
                </p>
                <SubscriptionFormDialog>
                    <Button className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-black font-bold font-[family-name:var(--font-plus-jakarta)] rounded-xl px-8 py-6 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(0,212,170,0.2)]">
                        <Plus className="h-5 w-5" />
                        Add Subscription
                    </Button>
                </SubscriptionFormDialog>
            </div>

            {/* View Tabs */}
            <div className="flex gap-1 p-1 bg-[#1b1f2b] rounded-xl overflow-x-auto">
                {(["ALL", "ACTIVE", "PAUSED", "CANCELLED", "UPCOMING", "HISTORY"] as StatusFilter[]).map((status) => {
                    const label = status === "ALL" ? "All"
                        : status === "UPCOMING" ? "Upcoming"
                        : status === "HISTORY" ? "History"
                        : status.charAt(0) + status.slice(1).toLowerCase()
                    return (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                statusFilter === status
                                    ? "bg-[#00D4AA] text-black font-bold shadow-lg"
                                    : "text-[#7A8BA8] hover:text-white"
                            }`}
                        >
                            {label}
                        </button>
                    )
                })}
            </div>

            {/* Filter Bar — only for subscription list views */}
            {statusFilter !== "UPCOMING" && statusFilter !== "HISTORY" && (
                <section className="flex flex-wrap items-center gap-4">
                    {/* Search Input */}
                    <div className="flex-1 min-w-[280px] relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#7A8BA8]" />
                        <input
                            type="text"
                            placeholder="Search services, categories, or keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#0a0e19] border-none rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-[#7A8BA8] focus:outline-none focus:ring-1 focus:ring-[#00D4AA]/40 focus:bg-[#171b27] transition-all text-sm"
                        />
                    </div>

                    {/* Billing Cycle Dropdown */}
                    <select
                        value={cycleFilter}
                        onChange={(e) => setCycleFilter(e.target.value as CycleFilter)}
                        className="bg-[#1b1f2b] border-none rounded-xl py-4 px-6 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-[#00D4AA]/40 appearance-none min-w-[160px] cursor-pointer"
                    >
                        <option value="ALL">Billing Cycle</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                        <option value="QUARTERLY">Quarterly</option>
                        <option value="SEMI_ANNUAL">Semi-Annual</option>
                        <option value="ANNUAL">Yearly</option>
                        <option value="ONE_TIME">One-Time</option>
                    </select>
                </section>
            )}

            {/* ========== UPCOMING VIEW ========== */}
            {statusFilter === "UPCOMING" && (
                <div className="space-y-10">
                    {/* Summary Stat Cards */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#EF4444]/10 blur-3xl -mr-8 -mt-8" />
                            <p className="text-[#7A8BA8] text-sm font-medium mb-1">Overdue</p>
                            <div className="flex items-end justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold font-[family-name:var(--font-plus-jakarta)] text-[#EF4444]">
                                        ₹{totalOverdueBills.toFixed(2)}
                                    </h3>
                                    <p className="text-xs text-[#7A8BA8]">
                                        {overdueBills.length} {overdueBills.length === 1 ? "bill" : "bills"} pending
                                    </p>
                                </div>
                                <div className="p-2 bg-[#EF4444]/15 rounded-xl">
                                    <AlertCircle className="h-5 w-5 text-[#EF4444]" />
                                </div>
                            </div>
                        </div>

                        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#F59E0B]/10 blur-3xl -mr-8 -mt-8" />
                            <p className="text-[#7A8BA8] text-sm font-medium mb-1">Due This Week</p>
                            <div className="flex items-end justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold font-[family-name:var(--font-plus-jakarta)] text-[#F59E0B]">
                                        ₹{totalDueThisWeek.toFixed(2)}
                                    </h3>
                                    <p className="text-xs text-[#7A8BA8]">
                                        {dueThisWeekBills.length} {dueThisWeekBills.length === 1 ? "bill" : "bills"} arriving
                                    </p>
                                </div>
                                <div className="p-2 bg-[#F59E0B]/15 rounded-xl">
                                    <Clock className="h-5 w-5 text-[#F59E0B]" />
                                </div>
                            </div>
                        </div>

                        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#3B82F6]/10 blur-3xl -mr-8 -mt-8" />
                            <p className="text-[#7A8BA8] text-sm font-medium mb-1">Due This Month</p>
                            <div className="flex items-end justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold font-[family-name:var(--font-plus-jakarta)] text-[#3B82F6]">
                                        ₹{totalDueThisMonth.toFixed(2)}
                                    </h3>
                                    <p className="text-xs text-[#7A8BA8]">
                                        {dueThisMonthBills.length} {dueThisMonthBills.length === 1 ? "bill" : "bills"} scheduled
                                    </p>
                                </div>
                                <div className="p-2 bg-[#3B82F6]/15 rounded-xl">
                                    <Calendar className="h-5 w-5 text-[#3B82F6]" />
                                </div>
                            </div>
                        </div>

                        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00D4AA]/10 blur-3xl -mr-8 -mt-8" />
                            <p className="text-[#7A8BA8] text-sm font-medium mb-1">Next 30 Days</p>
                            <div className="flex items-end justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold font-[family-name:var(--font-plus-jakarta)] text-[#00D4AA]">
                                        ₹{dueNext30DaysBills.reduce((sum, sub) => sum + Number(sub.amount), 0).toFixed(2)}
                                    </h3>
                                    <p className="text-xs text-[#7A8BA8]">
                                        {dueNext30DaysBills.length} {dueNext30DaysBills.length === 1 ? "bill" : "bills"} upcoming
                                    </p>
                                </div>
                                <div className="p-2 bg-[#00D4AA]/15 rounded-xl">
                                    <Calendar className="h-5 w-5 text-[#00D4AA]" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Overdue Section */}
                    {overdueBills.length > 0 && (
                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                                <h2 className="text-lg font-bold font-[family-name:var(--font-plus-jakarta)] tracking-tight">
                                    Overdue Payments
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {overdueBills.map((sub) => (
                                    <div
                                        key={sub.id}
                                        className="glass-card rounded-2xl p-5 border-[#EF4444]/20 bg-[#EF4444]/5 relative overflow-hidden flex flex-col sm:flex-row gap-5 items-start sm:items-center"
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EF4444]" />
                                        <div className="w-14 h-14 rounded-2xl bg-[#1b1f2b] flex items-center justify-center border border-white/[0.06] shrink-0 shadow-lg">
                                            {sub.logoUrl ? (
                                                <img src={sub.logoUrl} alt={sub.name} className="w-10 h-10 rounded-lg object-cover" />
                                            ) : (
                                                <span className="text-xl font-bold text-[#EF4444]">{sub.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-lg font-[family-name:var(--font-plus-jakarta)]">{sub.name}</h4>
                                                <span className="text-[#EF4444] font-bold text-lg">₹{Number(sub.amount).toFixed(2)}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-[#EF4444] uppercase tracking-wider">
                                                    Was due: {new Date(sub.nextBillingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                                </span>
                                                <span className="h-1 w-1 rounded-full bg-white/20" />
                                                <span className="text-xs text-[#7A8BA8]">{sub.billingCycle}</span>
                                            </div>
                                        </div>
                                        <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                                            <Button
                                                size="sm"
                                                className="flex-1 sm:flex-none bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-bold rounded-xl text-xs"
                                                onClick={() => markAsPaidMutation.mutate({ param: { id: sub.id } })}
                                                disabled={markAsPaidMutation.isPending}
                                            >
                                                Pay Now
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Due This Week Section */}
                    {dueThisWeekBills.length > 0 && (
                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                                <h2 className="text-lg font-bold font-[family-name:var(--font-plus-jakarta)] tracking-tight">
                                    Due This Week
                                </h2>
                            </div>
                            <div className="space-y-3">
                                {dueThisWeekBills.map((sub) => (
                                    <div
                                        key={sub.id}
                                        className="glass-card rounded-2xl p-4 flex flex-col lg:flex-row items-center gap-4 hover:bg-white/[0.04] transition-colors group"
                                    >
                                        <div className="flex items-center gap-4 flex-grow w-full">
                                            <div className="w-12 h-12 rounded-xl bg-[#1b1f2b] flex items-center justify-center border border-white/[0.06] group-hover:border-[#00D4AA]/30 transition-colors">
                                                {sub.logoUrl ? (
                                                    <img src={sub.logoUrl} alt={sub.name} className="w-8 h-8 rounded object-cover" />
                                                ) : (
                                                    <span className="text-sm font-bold text-[#F59E0B]">{sub.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div className="flex-grow">
                                                <h4 className="font-bold text-base font-[family-name:var(--font-plus-jakarta)]">{sub.name}</h4>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-[#7A8BA8]">{formatDueLabel(sub.nextBillingDate)}</span>
                                                    <span className="h-0.5 w-0.5 rounded-full bg-white/20" />
                                                    <span className="text-xs text-[#7A8BA8]">
                                                        {new Date(sub.nextBillingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between w-full lg:w-auto gap-8">
                                            <div className="text-right">
                                                <p className="font-bold text-lg">₹{Number(sub.amount).toFixed(2)}</p>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-black tracking-tighter ${
                                                    sub.autoRenew
                                                        ? "bg-[#3B82F6]/10 text-[#3B82F6]"
                                                        : "bg-[#F59E0B]/10 text-[#F59E0B]"
                                                }`}>
                                                    {sub.autoRenew ? "Auto-Pay On" : "Action Required"}
                                                </span>
                                            </div>
                                            <Button
                                                size="sm"
                                                className="px-5 py-2.5 bg-[#00D4AA] text-[#00382b] font-bold rounded-xl text-xs hover:shadow-[0_0_20px_rgba(0,212,170,0.3)]"
                                                onClick={() => markAsPaidMutation.mutate({ param: { id: sub.id } })}
                                                disabled={markAsPaidMutation.isPending}
                                            >
                                                Mark as Paid
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Later This Month Section */}
                    {laterThisMonthBills.length > 0 && (
                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                                <h2 className="text-lg font-bold font-[family-name:var(--font-plus-jakarta)] tracking-tight">
                                    Later This Month
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {laterThisMonthBills.map((sub) => (
                                    <div
                                        key={sub.id}
                                        className="glass-card rounded-2xl p-4 flex items-center justify-between hover:border-[#00D4AA]/20 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-[#1b1f2b] flex items-center justify-center border border-white/[0.06]">
                                                {sub.logoUrl ? (
                                                    <img src={sub.logoUrl} alt={sub.name} className="w-6 h-6 rounded object-cover" />
                                                ) : (
                                                    <span className="text-xs font-bold text-[#3B82F6]">{sub.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-sm font-[family-name:var(--font-plus-jakarta)]">{sub.name}</h5>
                                                <p className="text-[10px] text-[#7A8BA8]">
                                                    {new Date(sub.nextBillingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} &bull; {sub.billingCycle}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="font-bold">₹{Number(sub.amount).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {overdueBills.length === 0 && dueThisWeekBills.length === 0 && laterThisMonthBills.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 glass-card rounded-3xl">
                            <Calendar className="h-12 w-12 text-[#7A8BA8]/40 mb-4" />
                            <h3 className="text-lg font-semibold font-[family-name:var(--font-plus-jakarta)] text-white mb-2">No upcoming bills</h3>
                            <p className="text-[#7A8BA8] text-sm">All caught up! No bills due this month.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ========== HISTORY VIEW ========== */}
            {statusFilter === "HISTORY" && (
                <div className="space-y-8">
                    {/* Stat Cards */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card p-6 rounded-2xl flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-[#46f1c5]/10 flex items-center justify-center">
                                <CheckCircle className="h-7 w-7 text-[#46f1c5]" />
                            </div>
                            <div>
                                <p className="text-[#7A8BA8] text-xs uppercase tracking-widest font-bold mb-1">Total Paid</p>
                                <h3 className="text-2xl font-bold font-[family-name:var(--font-plus-jakarta)]">₹{totalPaid.toFixed(2)}</h3>
                                <p className="text-xs text-[#46f1c5] mt-1 font-medium">
                                    {subscriptions.filter(h => h.paymentStatus === "SUCCESS").length} payments
                                </p>
                            </div>
                        </div>
                        <div className="glass-card p-6 rounded-2xl flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                                <Clock className="h-7 w-7 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-[#7A8BA8] text-xs uppercase tracking-widest font-bold mb-1">Pending</p>
                                <h3 className="text-2xl font-bold font-[family-name:var(--font-plus-jakarta)]">₹{totalPending.toFixed(2)}</h3>
                                <p className="text-xs text-amber-500 mt-1 font-medium">
                                    {subscriptions.filter(h => h.paymentStatus === "PENDING" && !overdueSubIds.has(h.id)).length} items due soon
                                </p>
                            </div>
                        </div>
                        <div className="glass-card p-6 rounded-2xl flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-[#ffb4ab]/10 flex items-center justify-center">
                                <Clock className="h-7 w-7 text-[#ffb4ab]" />
                            </div>
                            <div>
                                <p className="text-[#7A8BA8] text-xs uppercase tracking-widest font-bold mb-1">Overdue</p>
                                <h3 className="text-2xl font-bold font-[family-name:var(--font-plus-jakarta)]">₹{totalOverduePayments.toFixed(2)}</h3>
                                <p className="text-xs text-[#ffb4ab] mt-1 font-medium">
                                    {subscriptions.filter(h => isOverdueByDate(h)).length} missed payments
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Search + Payment Status Filters */}
                    <section className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#7A8BA8]" />
                            <input
                                type="text"
                                value={historySearch}
                                onChange={(e) => setHistorySearch(e.target.value)}
                                className="w-full bg-[#0a0e19] border-none rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-[#7A8BA8] focus:outline-none focus:ring-1 focus:ring-[#00D4AA]/40 transition-all text-sm"
                                placeholder="Search subscriptions..."
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            {historyFilterOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setHistoryFilter(option.value as HistoryFilter)}
                                    className={`whitespace-nowrap px-5 py-2.5 rounded-full font-medium text-sm transition-all active:scale-95 ${
                                        historyFilter === option.value
                                            ? "bg-[#46f1c5] text-[#00382b] font-bold"
                                            : "bg-[#313441] text-[#bacac2] hover:text-white"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Transaction Table */}
                    <section className="glass-card rounded-2xl overflow-hidden">
                        {historySearchedSubs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <CreditCard className="h-12 w-12 text-[#7A8BA8]/40 mb-4" />
                                <p className="text-[#7A8BA8] text-sm">No subscriptions found.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#171b27]/50">
                                            <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-black text-[#7A8BA8]">Service</th>
                                            <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-black text-[#7A8BA8]">Due Date</th>
                                            <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-black text-[#7A8BA8] text-right">Amount</th>
                                            <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-black text-[#7A8BA8] text-center">Status</th>
                                            <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-black text-[#7A8BA8] text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {historySearchedSubs.map((item) => {
                                            const itemIsOverdue = isOverdueByDate(item)
                                            const effectiveStatus = itemIsOverdue ? "OVERDUE" : item.paymentStatus
                                            const iconColor = getIconColor(effectiveStatus)
                                            const relativeTime = getRelativeTime(item.nextBillingDate, effectiveStatus)
                                            return (
                                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            {item.logoUrl ? (
                                                                <img src={item.logoUrl} alt={item.name} className="w-10 h-10 rounded-xl object-cover" />
                                                            ) : (
                                                                <div className={`w-10 h-10 rounded-xl ${iconColor.bg} flex items-center justify-center font-bold ${iconColor.text} relative`}>
                                                                    {item.name.charAt(0)}
                                                                    <div className={`absolute inset-0 ${iconColor.glow} blur-lg -z-10`} />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="font-bold">{item.name}</p>
                                                                <p className="text-xs text-[#7A8BA8]">{item.category}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <p className="text-sm font-medium">
                                                            {new Date(item.nextBillingDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                                                        </p>
                                                        <p className={`text-[10px] font-bold uppercase tracking-tighter ${relativeTime.className}`}>
                                                            {relativeTime.text}
                                                        </p>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <span className="font-bold">
                                                            {item.currency === "INR" ? "₹" : item.currency} {Number(item.amount).toFixed(2)}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusBadgeClass(effectiveStatus)}`}>
                                                            {getStatusLabel(effectiveStatus)}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        {(item.paymentStatus === "PENDING" || itemIsOverdue) && item.paymentStatus !== "SUCCESS" && item.paymentStatus !== "SKIPPED" ? (
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => markAsPaidMutation.mutate({ param: { id: item.id } })}
                                                                    disabled={markAsPaidMutation.isPending}
                                                                    className="bg-[#00D4AA] text-[#00382b] px-4 py-2 rounded-xl text-xs font-bold hover:shadow-[0_0_15px_rgba(0,212,170,0.3)] transition-all active:scale-95 disabled:opacity-50"
                                                                >
                                                                    Mark Paid
                                                                </button>
                                                                <button
                                                                    onClick={() => skipPaymentMutation.mutate({ param: { id: item.id } })}
                                                                    disabled={skipPaymentMutation.isPending}
                                                                    className="bg-[#313441] text-[#bacac2] px-3 py-2 rounded-xl text-xs font-medium hover:text-white transition-all disabled:opacity-50"
                                                                >
                                                                    Skip
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[#7A8BA8]/40 text-xs">—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            )}

            {/* ========== SUBSCRIPTION CARD GRID (default views) ========== */}
            {statusFilter !== "UPCOMING" && statusFilter !== "HISTORY" && (
                <>
                    {filteredSubscriptions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 glass-card rounded-3xl">
                            <Search className="h-12 w-12 text-[#7A8BA8]/40 mb-4" />
                            <h3 className="text-lg font-semibold font-[family-name:var(--font-plus-jakarta)] text-white mb-2">No subscriptions found</h3>
                            <p className="text-[#7A8BA8] text-sm">Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredSubscriptions.map((subscription, idx) => {
                                const colors = getLogoColors(idx)
                                return (
                                    <div
                                        key={subscription.id}
                                        className="glass-card rounded-3xl p-6 relative group transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                                    >
                                        {/* Colored orb blur in top-right */}
                                        <div
                                            className="absolute top-0 right-0 w-32 h-32 opacity-[0.06] blur-3xl rounded-full pointer-events-none"
                                            style={{ backgroundColor: colors.orb }}
                                        />

                                        {/* Top row: Logo + Status badge */}
                                        <div className="flex justify-between items-start mb-6">
                                            {subscription.logoUrl ? (
                                                <img
                                                    src={subscription.logoUrl}
                                                    alt={subscription.name}
                                                    className="w-14 h-14 rounded-2xl object-cover border border-white/10"
                                                />
                                            ) : (
                                                <div className={`w-14 h-14 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                                                    <span className={`text-2xl font-bold ${colors.text}`}>
                                                        {subscription.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                            <StatusBadge status={subscription.status} />
                                        </div>

                                        {/* Name + Category */}
                                        <div className="mb-6">
                                            <h3 className="text-xl font-bold font-[family-name:var(--font-plus-jakarta)] text-white">
                                                {subscription.name}
                                            </h3>
                                            <p className="text-[#7A8BA8] text-sm mt-0.5">{subscription.category}</p>
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-baseline gap-1 mb-6">
                                            <span className="text-3xl font-black text-white tracking-tighter font-[family-name:var(--font-plus-jakarta)]">
                                                {subscription.currency === "INR" ? "\u20B9" : subscription.currency}{" "}
                                                {Number(subscription.amount).toFixed(2)}
                                            </span>
                                            <span className="text-[#7A8BA8] text-sm">{getBillingCycleLabel(subscription.billingCycle)}</span>
                                        </div>

                                        {/* Bottom divider with date + actions menu */}
                                        <div className="flex items-center justify-between pt-6 border-t border-white/[0.05]">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="h-3.5 w-3.5 text-[#7A8BA8]" />
                                                <span className="text-xs text-[#7A8BA8]">
                                                    {subscription.status === "CANCELLED"
                                                        ? `Cancelled`
                                                        : subscription.status === "PAUSED"
                                                            ? `Paused`
                                                            : `Next: ${format(new Date(subscription.nextBillingDate), "MMM dd")}`
                                                    }
                                                </span>
                                            </div>

                                            {/* Actions dropdown */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="text-[#7A8BA8] hover:text-[#00D4AA] transition-colors p-1 rounded-lg hover:bg-white/[0.05]">
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="w-48 bg-[#1b1f2b] border-white/[0.08] rounded-xl shadow-2xl"
                                                >
                                                    {subscription.paymentStatus !== 'SUCCESS' && (
                                                        <>
                                                            <DropdownMenuItem
                                                                className="text-[#00D4AA] focus:text-[#00D4AA] focus:bg-[#00D4AA]/10 rounded-lg cursor-pointer"
                                                                onClick={() => markAsPaidMutation.mutate({ param: { id: subscription.id } })}
                                                                disabled={markAsPaidMutation.isPending}
                                                            >
                                                                <Check className="h-4 w-4 mr-2" />
                                                                Mark as Paid
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-[#7A8BA8] focus:text-white focus:bg-white/[0.06] rounded-lg cursor-pointer"
                                                                onClick={() => skipPaymentMutation.mutate({ param: { id: subscription.id } })}
                                                                disabled={skipPaymentMutation.isPending}
                                                            >
                                                                <SkipForward className="h-4 w-4 mr-2" />
                                                                Skip Payment
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    <DropdownMenuItem
                                                        className="text-[#7A8BA8] focus:text-white focus:bg-white/[0.06] rounded-lg cursor-pointer"
                                                        onClick={() => markAsUsedMutation.mutate({ param: { id: subscription.id } })}
                                                        disabled={markAsUsedMutation.isPending}
                                                    >
                                                        <Zap className="h-4 w-4 mr-2" />
                                                        I just used this
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-white/[0.06]" />
                                                    <SubscriptionFormDialog subscription={subscription}>
                                                        <DropdownMenuItem
                                                            className="text-[#7A8BA8] focus:text-white focus:bg-white/[0.06] rounded-lg cursor-pointer"
                                                            onSelect={(e) => e.preventDefault()}
                                                        >
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                    </SubscriptionFormDialog>
                                                    <DropdownMenuItem
                                                        className="text-[#EF4444] focus:text-[#EF4444] focus:bg-[#EF4444]/10 rounded-lg cursor-pointer"
                                                        onClick={() => handleDelete(subscription.id)}
                                                        disabled={deleteMutation.isPending}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
