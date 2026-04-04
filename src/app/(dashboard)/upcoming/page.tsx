"use client"

import { useState } from "react"
import { useSubscriptions } from "@/features/subscriptions/api/use-subscriptions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SubscriptionFormDialog } from "@/features/subscriptions/components/subscription-form-dialog"
import { Plus, Calendar, Clock, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isWithinInterval, isBefore, addDays, format, addMonths, subMonths } from "date-fns"

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
    let fwd = anchor
    while (fwd < mStart) { fwd = advanceByCycle(fwd, billingCycle) }
    if (isWithinInterval(fwd, { start: mStart, end: mEnd })) return fwd
    let bwd = anchor
    while (bwd > mEnd) { bwd = rewindByCycle(bwd, billingCycle) }
    if (isWithinInterval(bwd, { start: mStart, end: mEnd })) return bwd
    return null
}

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

export default function UpcomingPage() {
    const [selectedDate, setSelectedDate] = useState(() => {
        const now = new Date()
        return new Date(now.getFullYear(), now.getMonth(), 1)
    })
    const goToPrevMonth = () => setSelectedDate(d => subMonths(d, 1))
    const goToNextMonth = () => setSelectedDate(d => addMonths(d, 1))

    const { data, isLoading } = useSubscriptions()

    if (isLoading) {
        return (
            <div className="h-full p-4 md:p-8 overflow-auto">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Header skeleton */}
                    <div>
                        <div className="h-9 w-56 rounded-2xl bg-white/[0.06] animate-pulse" />
                        <div className="h-5 w-72 mt-3 rounded-2xl bg-white/[0.06] animate-pulse" />
                    </div>

                    {/* Summary cards skeleton */}
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-6 rounded-2xl bg-white/[0.06] animate-pulse h-40" />
                        ))}
                    </div>

                    {/* Bill list skeleton */}
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="rounded-2xl bg-white/[0.06] animate-pulse">
                                <div className="p-5 flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-white/[0.06]" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 w-36 rounded-2xl bg-white/[0.06]" />
                                        <div className="h-4 w-24 rounded-2xl bg-white/[0.06]" />
                                    </div>
                                    <div className="h-6 w-24 rounded-2xl bg-white/[0.06]" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const subscriptions: Subscription[] = data?.data || []
    const now = new Date()

    const monthStart = startOfMonth(selectedDate)
    const monthEnd = endOfMonth(selectedDate)

    // For the selected month, calculate week boundaries
    const weekStart = startOfWeek(now)
    const weekEnd = endOfWeek(now)

    const isCurrentMonth = selectedDate.getFullYear() === now.getFullYear() && selectedDate.getMonth() === now.getMonth()

    // Project billing dates into the selected month
    type ProjectedSub = Subscription & { projectedDate: Date }

    const dueThisMonth: ProjectedSub[] = subscriptions
        .filter(sub => sub.status === "ACTIVE")
        .map(sub => {
            const projectedDate = getProjectedDateInMonth(sub.nextBillingDate, sub.billingCycle, monthStart, monthEnd)
            if (!projectedDate) return null
            return { ...sub, projectedDate }
        })
        .filter((s): s is ProjectedSub => s !== null)

    // Overdue: bills in the selected month that are past today
    const overdue = dueThisMonth.filter(sub => isBefore(sub.projectedDate, now))

    // Due this week (only relevant when viewing the current month)
    const dueThisWeek = isCurrentMonth ? dueThisMonth.filter(sub => {
        return isWithinInterval(sub.projectedDate, { start: weekStart, end: weekEnd })
    }) : []

    // First half / second half split for non-current months
    const midMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 15)
    const firstHalf = dueThisMonth.filter(sub => sub.projectedDate <= midMonth)
    const secondHalf = dueThisMonth.filter(sub => sub.projectedDate > midMonth)

    const totalDueThisWeek = dueThisWeek.reduce((sum, sub) => sum + Number(sub.amount), 0)
    const totalDueThisMonth = dueThisMonth.reduce((sum, sub) => sum + Number(sub.amount), 0)
    const totalOverdue = overdue.reduce((sum, sub) => sum + Number(sub.amount), 0)

    // Compute "later this month" bills: due this month but NOT this week and NOT overdue
    const laterThisMonth = dueThisMonth.filter(sub => {
        const isOverdue = isBefore(sub.projectedDate, now)
        const isDueThisWeek = isCurrentMonth && isWithinInterval(sub.projectedDate, { start: weekStart, end: weekEnd })
        return !isOverdue && !isDueThisWeek
    })

    if (subscriptions.length === 0) {
        return (
            <div className="h-full p-4 md:p-8 overflow-auto">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold font-[family-name:var(--font-plus-jakarta)] tracking-tight">Upcoming Bills</h1>
                        <p className="text-muted-foreground mt-2 text-[15px]">Track your upcoming payments and never miss a due date.</p>
                    </div>
                    <div className="flex flex-col items-center justify-center py-20 px-8 glass-card rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.06] flex items-center justify-center mb-6">
                            <Calendar className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="text-center mb-8">
                            <h3 className="text-xl font-semibold font-[family-name:var(--font-plus-jakarta)]">No subscriptions yet</h3>
                            <p className="text-muted-foreground mt-2 max-w-sm">Add your first subscription to start tracking upcoming bills and payments.</p>
                        </div>
                        <SubscriptionFormDialog>
                            <Button className="rounded-xl px-6 h-11">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Subscription
                            </Button>
                        </SubscriptionFormDialog>
                    </div>
                </div>
            </div>
        )
    }

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

    return (
        <div className="h-full p-4 md:p-8 overflow-auto">
            <div className="max-w-6xl mx-auto space-y-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-plus-jakarta)] tracking-tight">
                            Upcoming Bills
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm sm:text-[15px]">
                            Track your upcoming payments and never miss a due date.
                        </p>
                    </div>
                    <SubscriptionFormDialog>
                        <Button className="rounded-xl px-5 h-10 font-medium">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Subscription
                        </Button>
                    </SubscriptionFormDialog>
                </div>

                {/* Month Selector */}
                <div className="flex items-center justify-center">
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.06] backdrop-blur-sm">
                        <Button variant="ghost" size="icon" onClick={goToPrevMonth} className="h-8 w-8 rounded-full hover:bg-white/[0.08]">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-semibold min-w-[160px] text-center font-[family-name:var(--font-plus-jakarta)]">
                            {format(selectedDate, "MMMM yyyy")}
                        </span>
                        <Button variant="ghost" size="icon" onClick={goToNextMonth} className="h-8 w-8 rounded-full hover:bg-white/[0.08]">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Summary Stat Cards */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Overdue */}
                    <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#EF4444]/10 blur-3xl -mr-8 -mt-8" />
                        <p className="text-muted-foreground text-sm font-medium mb-1">Overdue</p>
                        <div className="flex items-end justify-between">
                            <div>
                                <h3 className="text-2xl font-bold font-[family-name:var(--font-plus-jakarta)] text-[#EF4444]">
                                    ₹{totalOverdue.toFixed(2)}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {overdue.length} {overdue.length === 1 ? "Bill" : "Bills"} pending
                                </p>
                            </div>
                            <div className="p-2 bg-[#EF4444]/15 rounded-xl">
                                <AlertCircle className="h-5 w-5 text-[#EF4444]" />
                            </div>
                        </div>
                    </div>

                    {/* Due This Week / First Half */}
                    <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#F59E0B]/10 blur-3xl -mr-8 -mt-8" />
                        <p className="text-muted-foreground text-sm font-medium mb-1">{isCurrentMonth ? "Due This Week" : "1st – 15th"}</p>
                        <div className="flex items-end justify-between">
                            <div>
                                <h3 className="text-2xl font-bold font-[family-name:var(--font-plus-jakarta)] text-[#F59E0B]">
                                    ₹{isCurrentMonth ? totalDueThisWeek.toFixed(2) : firstHalf.reduce((s, sub) => s + Number(sub.amount), 0).toFixed(2)}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {isCurrentMonth ? dueThisWeek.length : firstHalf.length} {(isCurrentMonth ? dueThisWeek.length : firstHalf.length) === 1 ? "Bill" : "Bills"}
                                </p>
                            </div>
                            <div className="p-2 bg-[#F59E0B]/15 rounded-xl">
                                <Clock className="h-5 w-5 text-[#F59E0B]" />
                            </div>
                        </div>
                    </div>

                    {/* Due This Month */}
                    <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#3B82F6]/10 blur-3xl -mr-8 -mt-8" />
                        <p className="text-muted-foreground text-sm font-medium mb-1">Total Due</p>
                        <div className="flex items-end justify-between">
                            <div>
                                <h3 className="text-2xl font-bold font-[family-name:var(--font-plus-jakarta)] text-[#3B82F6]">
                                    ₹{totalDueThisMonth.toFixed(2)}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {dueThisMonth.length} {dueThisMonth.length === 1 ? "Bill" : "Bills"} scheduled
                                </p>
                            </div>
                            <div className="p-2 bg-[#3B82F6]/15 rounded-xl">
                                <Calendar className="h-5 w-5 text-[#3B82F6]" />
                            </div>
                        </div>
                    </div>

                    {/* 16th onwards / Due This Month remaining */}
                    <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#00D4AA]/10 blur-3xl -mr-8 -mt-8" />
                        <p className="text-muted-foreground text-sm font-medium mb-1">{isCurrentMonth ? "Later This Month" : "16th – End"}</p>
                        <div className="flex items-end justify-between">
                            <div>
                                <h3 className="text-2xl font-bold font-[family-name:var(--font-plus-jakarta)] text-[#00D4AA]">
                                    ₹{isCurrentMonth ? laterThisMonth.reduce((s, sub) => s + Number(sub.amount), 0).toFixed(2) : secondHalf.reduce((s, sub) => s + Number(sub.amount), 0).toFixed(2)}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {isCurrentMonth ? laterThisMonth.length : secondHalf.length} {(isCurrentMonth ? laterThisMonth.length : secondHalf.length) === 1 ? "Bill" : "Bills"}
                                </p>
                            </div>
                            <div className="p-2 bg-[#00D4AA]/15 rounded-xl">
                                <Calendar className="h-5 w-5 text-[#00D4AA]" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Overdue Payments Section */}
                {overdue.length > 0 && (
                    <section className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                            <h2 className="text-lg font-bold font-[family-name:var(--font-plus-jakarta)] tracking-tight">
                                Overdue Payments
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {overdue.map((sub) => (
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
                                                Was due: {sub.projectedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                            </span>
                                            <span className="h-1 w-1 rounded-full bg-white/20" />
                                            <span className="text-xs text-muted-foreground">{sub.billingCycle}</span>
                                        </div>
                                    </div>
                                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                                        <Button size="sm" className="flex-1 sm:flex-none bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-bold rounded-xl text-xs">
                                            Pay Now
                                        </Button>
                                        <Button size="sm" variant="ghost" className="flex-1 sm:flex-none bg-white/5 text-muted-foreground font-bold rounded-xl text-xs hover:bg-white/10">
                                            Remind Me
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Due This Week Section */}
                {dueThisWeek.length > 0 && (
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                                <h2 className="text-lg font-bold font-[family-name:var(--font-plus-jakarta)] tracking-tight">
                                    Due This Week
                                </h2>
                            </div>
                            <button className="text-xs font-bold text-[#00D4AA] uppercase tracking-widest hover:underline transition-all">
                                View All
                            </button>
                        </div>
                        <div className="space-y-3">
                            {dueThisWeek.map((sub) => (
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
                                                <span className="text-xs text-muted-foreground">{formatDueLabel(sub.projectedDate.toISOString())}</span>
                                                <span className="h-0.5 w-0.5 rounded-full bg-white/20" />
                                                <span className="text-xs text-muted-foreground">
                                                    {sub.projectedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
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
                                        <div className="flex gap-2">
                                            <Button size="sm" className="px-5 py-2.5 bg-[#00D4AA] text-[#00382b] font-bold rounded-xl text-xs hover:shadow-[0_0_20px_rgba(0,212,170,0.3)]">
                                                Mark as Paid
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Later This Month Section */}
                {laterThisMonth.length > 0 && (
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                                <h2 className="text-lg font-bold font-[family-name:var(--font-plus-jakarta)] tracking-tight">
                                    Later This Month
                                </h2>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {laterThisMonth.map((sub) => (
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
                                            <p className="text-[10px] text-muted-foreground">
                                                {sub.projectedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} &bull; {sub.billingCycle}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="font-bold">₹{Number(sub.amount).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}
