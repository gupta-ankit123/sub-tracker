"use client"

import { useState, useMemo } from "react"
import { useSubscriptions } from "@/features/subscriptions/api/use-subscriptions"
import { useMarkAsPaid } from "@/features/subscriptions/api/use-mark-as-paid"
import { Button } from "@/components/ui/button"
import {
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    TrendingUp,
    AlertCircle,
    Check,
    Flame,
    X,
} from "lucide-react"
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addWeeks,
    addMonths,
    addYears,
    subMonths,
    isSameMonth,
    isSameDay,
    isToday,
    isBefore,
    parseISO,
    startOfDay,
    eachWeekOfInterval,
} from "date-fns"

interface Subscription {
    id: string
    name: string
    amount: string | number
    currency: string
    billingCycle: string
    category: string
    status: string
    nextBillingDate: string
    firstBillingDate: string
    paymentStatus: string
    logoUrl: string | null
    lastPaidDate: string | null
}

/** Advance a date by one billing cycle */
function advanceByCycle(date: Date, cycle: string): Date {
    switch (cycle) {
        case "WEEKLY": return addWeeks(date, 1)
        case "MONTHLY": return addMonths(date, 1)
        case "QUARTERLY": return addMonths(date, 3)
        case "SEMI_ANNUAL": return addMonths(date, 6)
        case "ANNUAL": return addYears(date, 1)
        default: return date
    }
}

/** Go back one billing cycle */
function rewindByCycle(date: Date, cycle: string): Date {
    switch (cycle) {
        case "WEEKLY": return addWeeks(date, -1)
        case "MONTHLY": return addMonths(date, -1)
        case "QUARTERLY": return addMonths(date, -3)
        case "SEMI_ANNUAL": return addMonths(date, -6)
        case "ANNUAL": return addYears(date, -1)
        default: return date
    }
}

/**
 * Generate all projected billing dates for a subscription within a date range.
 * Uses nextBillingDate as the anchor and projects forward/backward by cycle.
 */
function getProjectedDates(sub: Subscription, rangeStart: Date, rangeEnd: Date): Date[] {
    if (sub.billingCycle === "ONE_TIME") {
        const d = parseISO(sub.nextBillingDate)
        return (d >= rangeStart && d <= rangeEnd) ? [d] : []
    }

    const dates: Date[] = []
    const anchor = startOfDay(parseISO(sub.nextBillingDate))
    const firstBilling = startOfDay(parseISO(sub.firstBillingDate))

    // Project forward from anchor
    let cursor = anchor
    while (cursor <= rangeEnd) {
        if (cursor >= rangeStart && cursor >= firstBilling) {
            dates.push(cursor)
        }
        cursor = advanceByCycle(cursor, sub.billingCycle)
    }

    // Project backward from anchor
    cursor = rewindByCycle(anchor, sub.billingCycle)
    while (cursor >= rangeStart) {
        if (cursor >= firstBilling) {
            dates.push(cursor)
        }
        cursor = rewindByCycle(cursor, sub.billingCycle)
    }

    return dates
}

type BillStatus = "paid" | "upcoming" | "overdue"

interface BillOnDate {
    subscription: Subscription
    status: BillStatus
    date: Date
    isCurrentCycle: boolean // true if this date matches the actual nextBillingDate
}

function getBillStatus(sub: Subscription, billDate: Date, now: Date): BillStatus {
    const billDay = startOfDay(billDate)
    const today = startOfDay(now)
    const nextDue = startOfDay(parseISO(sub.nextBillingDate))

    // The paymentStatus on the subscription only applies to the current cycle (nextBillingDate).
    // For any other projected date, we infer status from whether it's past or future.
    const isCurrentCycle = isSameDay(billDay, nextDue)

    if (isCurrentCycle) {
        // Current cycle — trust the actual paymentStatus
        if (sub.paymentStatus === "SUCCESS" || sub.paymentStatus === "SKIPPED") {
            return "paid"
        }
        if (billDay < today) return "overdue"
        return "upcoming"
    }

    // Past projected dates (before the current nextBillingDate) were already paid
    if (billDay < nextDue) {
        return "paid"
    }

    // Future projected dates are upcoming
    return "upcoming"
}

const statusColors = {
    paid: { dot: "bg-emerald-400", bg: "bg-emerald-400/10", text: "text-emerald-400", border: "border-emerald-400/30" },
    upcoming: { dot: "bg-blue-400", bg: "bg-blue-400/10", text: "text-blue-400", border: "border-blue-400/30" },
    overdue: { dot: "bg-red-400", bg: "bg-red-400/10", text: "text-red-400", border: "border-red-400/30" },
}

export default function BillCalendarPage() {
    const { data, isLoading } = useSubscriptions()
    const markAsPaid = useMarkAsPaid()
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)

    const subscriptions: Subscription[] = useMemo(() => {
        return (data?.data || []).filter((s: Subscription) => s.status === "ACTIVE")
    }, [data])

    // Project all billing dates for the visible calendar range
    const calendarRangeStart = startOfWeek(startOfMonth(currentMonth))
    const calendarRangeEnd = endOfWeek(endOfMonth(currentMonth))

    const billsByDate = useMemo(() => {
        const map = new Map<string, BillOnDate[]>()
        const now = new Date()

        for (const sub of subscriptions) {
            const nextDue = startOfDay(parseISO(sub.nextBillingDate))
            const projectedDates = getProjectedDates(sub, calendarRangeStart, calendarRangeEnd)
            for (const billDate of projectedDates) {
                const key = format(billDate, "yyyy-MM-dd")
                const entry: BillOnDate = {
                    subscription: sub,
                    status: getBillStatus(sub, billDate, now),
                    date: billDate,
                    isCurrentCycle: isSameDay(billDate, nextDue),
                }
                if (!map.has(key)) map.set(key, [])
                map.get(key)!.push(entry)
            }
        }
        return map
    }, [subscriptions, calendarRangeStart.getTime(), calendarRangeEnd.getTime()])

    // Calendar grid generation
    const weeks = useMemo(() => {
        const weekStarts = eachWeekOfInterval({ start: calendarRangeStart, end: calendarRangeEnd })
        return weekStarts.map((weekStart) => {
            const days: Date[] = []
            for (let i = 0; i < 7; i++) {
                days.push(addDays(weekStart, i))
            }
            return days
        })
    }, [calendarRangeStart.getTime(), calendarRangeEnd.getTime()])

    // Spend summaries
    const monthlySummary = useMemo(() => {
        let total = 0
        let paid = 0
        let upcoming = 0
        let overdue = 0
        let billCount = 0

        for (const [dateKey, bills] of billsByDate) {
            const date = parseISO(dateKey)
            if (!isSameMonth(date, currentMonth)) continue
            for (const bill of bills) {
                const amount = Number(bill.subscription.amount)
                total += amount
                billCount++
                if (bill.status === "paid") paid += amount
                else if (bill.status === "overdue") overdue += amount
                else upcoming += amount
            }
        }

        return { total, paid, upcoming, overdue, billCount }
    }, [billsByDate, currentMonth])

    // Bills for selected date
    const selectedBills = useMemo(() => {
        if (!selectedDate) return []
        const key = format(selectedDate, "yyyy-MM-dd")
        return billsByDate.get(key) || []
    }, [selectedDate, billsByDate])

    const handleMarkPaid = (subscriptionId: string) => {
        markAsPaid.mutate({ param: { id: subscriptionId } })
    }

    if (isLoading) {
        return (
            <div className="h-full p-4 md:p-8 overflow-auto">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div>
                        <div className="h-9 w-56 rounded-2xl bg-white/[0.06] animate-pulse" />
                        <div className="h-5 w-72 mt-3 rounded-2xl bg-white/[0.06] animate-pulse" />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-6 rounded-2xl bg-white/[0.06] animate-pulse h-28" />
                        ))}
                    </div>
                    <div className="rounded-2xl bg-white/[0.06] animate-pulse h-[500px]" />
                </div>
            </div>
        )
    }

    return (
        <div className="h-full p-4 md:p-8 overflow-auto">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-plus-jakarta)] tracking-tight">
                        Bill Calendar
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-[15px]">
                        Visualize when money leaves your account and plan your cash flow.
                    </p>
                </div>

                {/* Monthly Summary Cards */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-[#00D4AA]/10 blur-3xl -mr-6 -mt-6" />
                        <p className="text-muted-foreground text-xs font-medium mb-1">Monthly Total</p>
                        <h3 className="text-xl font-bold font-[family-name:var(--font-plus-jakarta)] text-[#00D4AA]">
                            ₹{monthlySummary.total.toFixed(0)}
                        </h3>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                            {monthlySummary.billCount} bills
                        </p>
                    </div>
                    <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-400/10 blur-3xl -mr-6 -mt-6" />
                        <p className="text-muted-foreground text-xs font-medium mb-1">Paid</p>
                        <h3 className="text-xl font-bold font-[family-name:var(--font-plus-jakarta)] text-emerald-400">
                            ₹{monthlySummary.paid.toFixed(0)}
                        </h3>
                    </div>
                    <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/10 blur-3xl -mr-6 -mt-6" />
                        <p className="text-muted-foreground text-xs font-medium mb-1">Upcoming</p>
                        <h3 className="text-xl font-bold font-[family-name:var(--font-plus-jakarta)] text-blue-400">
                            ₹{monthlySummary.upcoming.toFixed(0)}
                        </h3>
                    </div>
                    <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-red-400/10 blur-3xl -mr-6 -mt-6" />
                        <p className="text-muted-foreground text-xs font-medium mb-1">Overdue</p>
                        <h3 className="text-xl font-bold font-[family-name:var(--font-plus-jakarta)] text-red-400">
                            ₹{monthlySummary.overdue.toFixed(0)}
                        </h3>
                    </div>
                </section>

                {/* Legend */}
                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        Paid
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                        Upcoming
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        Overdue
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        Heavy Spending Day (3+)
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar Grid */}
                    <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-white/[0.06]">
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between mb-6">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                className="rounded-xl hover:bg-white/[0.06]"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <h2 className="text-lg font-bold font-[family-name:var(--font-plus-jakarta)]">
                                {format(currentMonth, "MMMM yyyy")}
                            </h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                className="rounded-xl hover:bg-white/[0.06]"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Weekday Headers */}
                        <div className="grid grid-cols-7 mb-2">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-1">
                            {weeks.flat().map((day, i) => {
                                const dateKey = format(day, "yyyy-MM-dd")
                                const dayBills = billsByDate.get(dateKey) || []
                                const isCurrentMonth = isSameMonth(day, currentMonth)
                                const isSelected = selectedDate && isSameDay(day, selectedDate)
                                const today = isToday(day)
                                const isHeavy = dayBills.length >= 3
                                const dayTotal = dayBills.reduce((s, b) => s + Number(b.subscription.amount), 0)

                                return (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedDate(day)}
                                        className={`
                                            relative flex flex-col items-center justify-start p-1.5 rounded-xl min-h-[72px] transition-all duration-150
                                            ${!isCurrentMonth ? "opacity-30" : ""}
                                            ${isSelected
                                                ? "bg-[#00D4AA]/[0.12] ring-1 ring-[#00D4AA]/40"
                                                : "hover:bg-white/[0.04]"
                                            }
                                            ${today ? "ring-1 ring-white/20" : ""}
                                            ${isHeavy && isCurrentMonth ? "bg-amber-400/[0.06]" : ""}
                                        `}
                                    >
                                        {/* Day number */}
                                        <span className={`
                                            text-sm font-medium leading-none mb-1.5
                                            ${today ? "text-[#00D4AA] font-bold" : ""}
                                            ${isSelected ? "text-[#00D4AA]" : ""}
                                        `}>
                                            {format(day, "d")}
                                        </span>

                                        {/* Bill dots */}
                                        {dayBills.length > 0 && (
                                            <div className="flex flex-wrap justify-center gap-[3px] mb-1">
                                                {dayBills.slice(0, 4).map((bill, j) => (
                                                    <span
                                                        key={j}
                                                        className={`w-[6px] h-[6px] rounded-full ${statusColors[bill.status].dot}`}
                                                    />
                                                ))}
                                                {dayBills.length > 4 && (
                                                    <span className="text-[8px] text-muted-foreground leading-none">+{dayBills.length - 4}</span>
                                                )}
                                            </div>
                                        )}

                                        {/* Day total */}
                                        {dayTotal > 0 && isCurrentMonth && (
                                            <span className="text-[9px] text-muted-foreground font-medium">
                                                ₹{dayTotal >= 1000 ? `${(dayTotal / 1000).toFixed(1)}k` : dayTotal.toFixed(0)}
                                            </span>
                                        )}

                                        {/* Heavy spending indicator */}
                                        {isHeavy && isCurrentMonth && (
                                            <Flame className="absolute top-1 right-1 w-3 h-3 text-amber-400" />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Day Detail Panel */}
                    <div className="glass-card rounded-2xl p-5 border border-white/[0.06] h-fit lg:sticky lg:top-8">
                        {selectedDate ? (
                            <>
                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <h3 className="text-base font-bold font-[family-name:var(--font-plus-jakarta)]">
                                            {format(selectedDate, "EEEE, MMM d")}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {selectedBills.length} {selectedBills.length === 1 ? "bill" : "bills"} &bull; ₹{selectedBills.reduce((s, b) => s + Number(b.subscription.amount), 0).toFixed(0)} total
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSelectedDate(null)}
                                        className="rounded-lg h-8 w-8 hover:bg-white/[0.06]"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                {selectedBills.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <CalendarDays className="h-10 w-10 text-muted-foreground/40 mb-3" />
                                        <p className="text-sm text-muted-foreground">No bills due on this date</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedBills.map((bill) => {
                                            const colors = statusColors[bill.status]
                                            return (
                                                <div
                                                    key={bill.subscription.id}
                                                    className={`rounded-xl p-3.5 border ${colors.border} ${colors.bg} relative overflow-hidden`}
                                                >
                                                    <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${colors.dot}`} />
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-lg bg-[#1b1f2b] flex items-center justify-center border border-white/[0.06] shrink-0">
                                                                {bill.subscription.logoUrl ? (
                                                                    <img
                                                                        src={bill.subscription.logoUrl}
                                                                        alt={bill.subscription.name}
                                                                        className="w-5 h-5 rounded object-cover"
                                                                    />
                                                                ) : (
                                                                    <span className={`text-xs font-bold ${colors.text}`}>
                                                                        {bill.subscription.name.charAt(0)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-bold font-[family-name:var(--font-plus-jakarta)] leading-tight">
                                                                    {bill.subscription.name}
                                                                </h4>
                                                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                                                    {bill.subscription.category} &bull; {bill.subscription.billingCycle}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm font-bold">
                                                            ₹{Number(bill.subscription.amount).toFixed(0)}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-2.5">
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${colors.text} flex items-center gap-1`}>
                                                            {bill.status === "paid" && <Check className="w-3 h-3" />}
                                                            {bill.status === "overdue" && <AlertCircle className="w-3 h-3" />}
                                                            {bill.status === "upcoming" && <TrendingUp className="w-3 h-3" />}
                                                            {bill.status}
                                                        </span>

                                                        {bill.status !== "paid" && bill.isCurrentCycle && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleMarkPaid(bill.subscription.id)}
                                                                disabled={markAsPaid.isPending}
                                                                className="h-7 px-3 text-[10px] font-bold rounded-lg bg-[#00D4AA] text-[#00382b] hover:shadow-[0_0_16px_rgba(0,212,170,0.3)]"
                                                            >
                                                                <Check className="w-3 h-3 mr-1" />
                                                                Mark Paid
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Daily Spending Summary */}
                                {selectedBills.length > 0 && selectedBills.length >= 3 && (
                                    <div className="mt-4 p-3 rounded-xl bg-amber-400/[0.06] border border-amber-400/20">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Flame className="w-4 h-4 text-amber-400" />
                                            <span className="text-xs font-bold text-amber-400">Heavy Spending Day</span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">
                                            {selectedBills.length} bills totaling ₹{selectedBills.reduce((s, b) => s + Number(b.subscription.amount), 0).toFixed(0)} are due. Consider spreading payments across the month.
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <CalendarDays className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                <h3 className="text-sm font-semibold font-[family-name:var(--font-plus-jakarta)] mb-1">
                                    Select a Date
                                </h3>
                                <p className="text-xs text-muted-foreground max-w-[200px]">
                                    Click on any date in the calendar to see bills due that day.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Weekly Spending Breakdown */}
                <section className="glass-card rounded-2xl p-5 border border-white/[0.06]">
                    <h3 className="text-base font-bold font-[family-name:var(--font-plus-jakarta)] mb-4">
                        Weekly Breakdown &mdash; {format(currentMonth, "MMMM yyyy")}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {weeks.map((week, wi) => {
                            // Only count days within the current month
                            let weekTotal = 0
                            let weekBillCount = 0
                            for (const day of week) {
                                if (!isSameMonth(day, currentMonth)) continue
                                const key = format(day, "yyyy-MM-dd")
                                const bills = billsByDate.get(key) || []
                                weekBillCount += bills.length
                                weekTotal += bills.reduce((s, b) => s + Number(b.subscription.amount), 0)
                            }

                            const weekStartDate = week.find(d => isSameMonth(d, currentMonth)) || week[0]
                            const weekEndDate = [...week].reverse().find(d => isSameMonth(d, currentMonth)) || week[6]

                            return (
                                <div key={wi} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3.5">
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1.5">
                                        {format(weekStartDate, "MMM d")} – {format(weekEndDate, "MMM d")}
                                    </p>
                                    <p className="text-lg font-bold font-[family-name:var(--font-plus-jakarta)]">
                                        ₹{weekTotal.toFixed(0)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        {weekBillCount} {weekBillCount === 1 ? "bill" : "bills"}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </section>
            </div>
        </div>
    )
}
