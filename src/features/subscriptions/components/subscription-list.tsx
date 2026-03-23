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
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO, format } from "date-fns"
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

type StatusFilter = "ALL" | "ACTIVE" | "PAUSED" | "CANCELLED"
type CycleFilter = "ALL" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "SEMI_ANNUAL" | "ANNUAL" | "ONE_TIME"

export function SubscriptionList() {
    const { data, isLoading } = useSubscriptions()
    const deleteMutation = useDeleteSubscription()
    const markAsPaidMutation = useMarkAsPaid()
    const skipPaymentMutation = useSkipPayment()
    const markAsUsedMutation = useMarkAsUsed()

    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")
    const [cycleFilter, setCycleFilter] = useState<CycleFilter>("ALL")

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

            {/* Filter Bar */}
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

                {/* Status Filter Pills */}
                <div className="flex gap-1 p-1 bg-[#1b1f2b] rounded-xl">
                    {(["ALL", "ACTIVE", "PAUSED", "CANCELLED"] as StatusFilter[]).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                statusFilter === status
                                    ? "bg-[#00D4AA] text-black font-bold shadow-lg"
                                    : "text-[#7A8BA8] hover:text-white"
                            }`}
                        >
                            {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
                        </button>
                    ))}
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

            {/* Subscription Card Grid */}
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
        </div>
    )
}
