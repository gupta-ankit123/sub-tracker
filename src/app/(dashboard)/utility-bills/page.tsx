"use client"

import { useState } from "react"
import { useUtilityBills, useRecordBill, useBillHistory, useMarkBillRecordPaid } from "@/features/subscriptions/api/use-utility-bills"
import { UtilityBillFormDialog } from "@/features/subscriptions/components/utility-bill-form-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Plus, Zap, Droplets, Flame, Wifi, Smartphone, Building, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

interface UtilityBill {
    id: string
    name: string
    category: string
    billingDay: number | null
    amount: string | number
    currency: string
    billType: string
    isVariable: boolean
    status: string
    paymentStatus: string
    billRecords: { id: string; billingMonth: string; amount: string | number; paymentStatus: string }[]
    billEstimates: { id: string; billingMonth: string; estimatedAmount: string | number; confidenceScore: string | number | null }[]
}

export default function UtilityBillsPage() {
    const { data, isLoading, error } = useUtilityBills()
    const recordBillMutation = useRecordBill()
    const markBillRecordPaid = useMarkBillRecordPaid()
    const queryClient = useQueryClient()
    const [recordDialogBill, setRecordDialogBill] = useState<UtilityBill | null>(null)
    const [historyDialogBill, setHistoryDialogBill] = useState<UtilityBill | null>(null)
    const [recordAmount, setRecordAmount] = useState("")
    const { data: historyData, isLoading: historyLoading } = useBillHistory(historyDialogBill?.id || "")

    const utilityBills: UtilityBill[] = data?.data || []

    const handleRecordBill = async (billId: string, recordData: { amount: number; billingMonth: string }) => {
        try {
            await recordBillMutation.mutateAsync({
                subscriptionId: billId,
                billingMonth: recordData.billingMonth,
                amount: recordData.amount,
            })
            queryClient.invalidateQueries({ queryKey: ["utility-bills"] })
            toast.success("Bill recorded successfully!")
        } catch (error) {
            toast.error("Failed to record bill")
        }
    }

    const totalEstimated = utilityBills.reduce((sum: number, bill: UtilityBill) => {
        const latestEstimate = bill.billEstimates?.[0]
        return sum + (latestEstimate ? Number(latestEstimate.estimatedAmount) : 0)
    }, 0)

    const categoryGroups = utilityBills.reduce((acc, bill: UtilityBill) => {
        if (!acc[bill.category]) {
            acc[bill.category] = []
        }
        acc[bill.category].push(bill)
        return acc
    }, {} as Record<string, UtilityBill[]>)

    if (error) {
        return (
            <div className="h-full p-4 md:p-8 overflow-auto">
                <div className="max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
                    <div className="glass-card rounded-2xl p-10 flex flex-col items-center gap-5 max-w-md w-full border border-[#EF4444]/20">
                        <div className="h-14 w-14 rounded-full bg-[#EF4444]/10 flex items-center justify-center">
                            <AlertCircle className="h-7 w-7 text-[#EF4444]" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold font-[family-name:var(--font-plus-jakarta)]">Failed to load utility bills</h3>
                            <p className="text-muted-foreground mt-1 text-sm">Something went wrong. Please try again later.</p>
                        </div>
                        <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
                            Retry
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="h-full p-4 md:p-8 overflow-auto">
                <div className="max-w-[1600px] mx-auto space-y-12">
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="h-10 w-56 bg-white/[0.06] rounded-2xl animate-pulse" />
                            <div className="h-5 w-80 mt-3 bg-white/[0.06] rounded-2xl animate-pulse" />
                        </div>
                        <div className="h-12 w-44 bg-white/[0.06] rounded-xl animate-pulse" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="glass-card p-6 rounded-2xl animate-pulse relative overflow-hidden">
                                <div className="h-4 w-36 bg-white/[0.06] rounded mb-3" />
                                <div className="h-9 w-28 bg-white/[0.06] rounded" />
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="glass-card p-6 rounded-[2rem] animate-pulse">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white/[0.06]" />
                                    <div className="h-6 w-16 bg-white/[0.06] rounded-full" />
                                </div>
                                <div className="h-6 w-40 bg-white/[0.06] rounded mb-2" />
                                <div className="h-4 w-48 bg-white/[0.06] rounded mb-6" />
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-4 bg-white/[0.03] rounded-2xl h-20" />
                                    <div className="p-4 bg-white/[0.03] rounded-2xl h-20" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="h-12 bg-white/[0.06] rounded-xl" />
                                    <div className="h-12 bg-white/[0.06] rounded-xl" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // Compute summary stats
    const totalDue = utilityBills.reduce((sum, bill) => {
        const latestEstimate = bill.billEstimates?.[0]
        const latestRecord = bill.billRecords?.[0]
        if (bill.paymentStatus === "PAID" || bill.paymentStatus === "SUCCESS") return sum
        return sum + (latestEstimate ? Number(latestEstimate.estimatedAmount) : latestRecord ? Number(latestRecord.amount) : Number(bill.amount || 0))
    }, 0)

    const avgMonthly = utilityBills.reduce((sum, bill) => {
        const records = bill.billRecords || []
        if (records.length === 0) return sum + Number(bill.amount || 0)
        const total = records.reduce((s, r) => s + Number(r.amount), 0)
        return sum + total / records.length
    }, 0)

    // Find next payment date
    const now = new Date()
    let nextPaymentBill: UtilityBill | null = null
    let nextPaymentDate: Date | null = null
    utilityBills.forEach((bill) => {
        if (bill.billingDay == null) return
        const dueDate = new Date(now.getFullYear(), now.getMonth(), bill.billingDay)
        if (dueDate < now) dueDate.setMonth(dueDate.getMonth() + 1)
        if (!nextPaymentDate || dueDate < nextPaymentDate) {
            nextPaymentDate = dueDate
            nextPaymentBill = bill
        }
    })

    // Helper: get category icon styles
    const getCategoryIconConfig = (category: string) => {
        switch (category) {
            case "Electricity": return { bg: "bg-yellow-500/10", text: "text-yellow-400", icon: <Zap className="h-7 w-7" /> }
            case "Water": return { bg: "bg-blue-500/10", text: "text-blue-400", icon: <Droplets className="h-7 w-7" /> }
            case "Gas": return { bg: "bg-orange-500/10", text: "text-orange-400", icon: <Flame className="h-7 w-7" /> }
            case "Internet": return { bg: "bg-purple-500/10", text: "text-purple-400", icon: <Wifi className="h-7 w-7" /> }
            case "Mobile Postpaid": return { bg: "bg-green-500/10", text: "text-green-400", icon: <Smartphone className="h-7 w-7" /> }
            case "Mobile Prepaid": return { bg: "bg-green-400/10", text: "text-green-400", icon: <Smartphone className="h-7 w-7" /> }
            case "Society Maintenance": return { bg: "bg-teal-500/10", text: "text-teal-400", icon: <Building className="h-7 w-7" /> }
            default: return { bg: "bg-white/[0.06]", text: "text-slate-400", icon: <Zap className="h-7 w-7" /> }
        }
    }

    // Helper: get payment status badge
    const getStatusBadge = (bill: UtilityBill) => {
        const status = bill.paymentStatus?.toUpperCase() || bill.status?.toUpperCase() || "PENDING"
        const latestRecord = bill.billRecords?.[0]
        const recordStatus = latestRecord?.paymentStatus?.toUpperCase()

        if (recordStatus === "SUCCESS" || status === "PAID" || status === "SUCCESS") {
            return (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#00D4AA]/20 text-[#00D4AA] border border-[#00D4AA]/20">
                    Paid
                </span>
            )
        }
        if (status === "OVERDUE") {
            return (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/20">
                    Overdue
                </span>
            )
        }
        return (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/20">
                Pending
            </span>
        )
    }

    // Helper: compute trend between last two records
    const getTrend = (bill: UtilityBill) => {
        const records = bill.billRecords || []
        if (records.length < 2) {
            const estimate = bill.billEstimates?.[0]
            const record = records[0]
            if (estimate && record) {
                const diff = ((Number(estimate.estimatedAmount) - Number(record.amount)) / Number(record.amount)) * 100
                return diff
            }
            return null
        }
        const current = Number(records[0].amount)
        const previous = Number(records[1].amount)
        if (previous === 0) return null
        return ((current - previous) / previous) * 100
    }

    return (
        <div className="h-full p-4 md:p-8 overflow-auto">
            <div className="max-w-[1600px] mx-auto">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h2 className="text-4xl font-extrabold text-[var(--foreground)] font-[family-name:var(--font-plus-jakarta)] tracking-tight mb-2">
                            Utility Bills
                        </h2>
                        <p className="text-muted-foreground text-base max-w-lg">
                            Manage your essential services and track usage variance. Your expenses are projected based on historical patterns.
                        </p>
                    </div>
                    <UtilityBillFormDialog onSuccess={() => queryClient.invalidateQueries({ queryKey: ["utility-bills"] })}>
                        <Button className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-[0_0_20px_rgba(70,241,197,0.3)] transition-all active:scale-95">
                            <Plus className="h-5 w-5" />
                            Add Utility Bill
                        </Button>
                    </UtilityBillFormDialog>
                </div>

                {/* Dashboard Summary Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#00D4AA]/10 blur-3xl group-hover:bg-[#00D4AA]/20 transition-all" />
                        <p className="text-muted-foreground text-sm font-medium mb-1">Total Due this Month</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold font-[family-name:var(--font-plus-jakarta)]">
                                ₹{totalDue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                            </span>
                        </div>
                    </div>
                    <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#3B82F6]/10 blur-3xl group-hover:bg-[#3B82F6]/20 transition-all" />
                        <p className="text-muted-foreground text-sm font-medium mb-1">Average Monthly Utility</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold font-[family-name:var(--font-plus-jakarta)]">
                                ₹{avgMonthly.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                            </span>
                        </div>
                    </div>
                    <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#A855F7]/10 blur-3xl group-hover:bg-[#A855F7]/20 transition-all" />
                        <p className="text-muted-foreground text-sm font-medium mb-1">Next Payment</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold font-[family-name:var(--font-plus-jakarta)]">
                                {nextPaymentDate
                                    ? (nextPaymentDate as Date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
                                    : "—"}
                            </span>
                            {nextPaymentBill && (
                                <span className="text-muted-foreground text-xs font-medium">{(nextPaymentBill as UtilityBill).category}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bill Cards Grid */}
                {utilityBills.length === 0 ? (
                    <div className="glass-card rounded-[2rem] flex flex-col items-center justify-center py-16 px-6">
                        <div className="h-16 w-16 rounded-full bg-[#00D4AA]/10 flex items-center justify-center mb-5">
                            <Zap className="h-8 w-8 text-[#00D4AA]" />
                        </div>
                        <h3 className="text-lg font-semibold font-[family-name:var(--font-plus-jakarta)] mb-2">No Utility Bills Yet</h3>
                        <p className="text-muted-foreground text-center mb-6 max-w-sm text-sm">
                            Start tracking your electricity, water, gas and other utility bills
                        </p>
                        <UtilityBillFormDialog onSuccess={() => queryClient.invalidateQueries({ queryKey: ["utility-bills"] })}>
                            <Button className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-black font-semibold rounded-xl px-5">
                                Add Your First Utility Bill
                            </Button>
                        </UtilityBillFormDialog>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {utilityBills.map((bill) => {
                            const iconConfig = getCategoryIconConfig(bill.category)
                            const latestRecord = bill.billRecords?.[0]
                            const latestEstimate = bill.billEstimates?.[0]
                            const trend = getTrend(bill)
                            const billingCycleText = bill.billingDay
                                ? `Billing cycle: ${bill.billingDay}${bill.billingDay === 1 ? "st" : bill.billingDay === 2 ? "nd" : bill.billingDay === 3 ? "rd" : "th"} of every month`
                                : "Variable billing"

                            return (
                                <div
                                    key={bill.id}
                                    className="glass-card p-6 rounded-[2rem] flex flex-col group hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all"
                                >
                                    {/* Top: Icon + Status */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`w-14 h-14 rounded-2xl ${iconConfig.bg} flex items-center justify-center ${iconConfig.text} relative overflow-hidden`}>
                                            <div className={`absolute inset-0 ${iconConfig.bg} blur-lg opacity-50`} />
                                            <span className="relative z-10">{iconConfig.icon}</span>
                                        </div>
                                        {getStatusBadge(bill)}
                                    </div>

                                    {/* Name + billing cycle */}
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold font-[family-name:var(--font-plus-jakarta)] mb-1">
                                            {bill.name}
                                        </h3>
                                        <p className="text-muted-foreground text-xs">{billingCycleText}</p>
                                    </div>

                                    {/* Dual display: Last Amount + Est. Next */}
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                                Last Amount
                                            </p>
                                            <p className="text-xl font-bold">
                                                {latestRecord
                                                    ? `₹${Number(latestRecord.amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
                                                    : `₹${Number(bill.amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                                Est. Next
                                            </p>
                                            <p className="text-xl font-bold">
                                                {latestEstimate
                                                    ? `₹${Number(latestEstimate.estimatedAmount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
                                                    : "—"}
                                            </p>
                                            {latestEstimate?.confidenceScore && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <span className="text-[10px] text-[#00D4AA] font-bold">
                                                        {Math.round(Number(latestEstimate.confidenceScore) * 100)}% Confidence
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Trend indicator */}
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-2">
                                            {trend !== null ? (
                                                <>
                                                    <span className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 ${
                                                        trend > 0
                                                            ? "bg-[#EF4444]/20 text-[#EF4444]"
                                                            : trend < 0
                                                            ? "bg-[#00D4AA]/10 text-[#00D4AA]"
                                                            : "bg-white/[0.06] text-muted-foreground"
                                                    }`}>
                                                        {trend > 0 ? `↑ ${Math.abs(trend).toFixed(0)}% higher` :
                                                         trend < 0 ? `↓ ${Math.abs(trend).toFixed(0)}% lower` :
                                                         "No change"}
                                                    </span>
                                                    <span className="text-muted-foreground text-[11px]">vs last month</span>
                                                </>
                                            ) : (
                                                <span className="px-2 py-1 rounded-lg bg-white/[0.06] text-muted-foreground text-[11px] font-bold">
                                                    No trend data
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="mt-auto grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setRecordDialogBill(bill)}
                                            className="bg-[#00D4AA] text-black py-3 rounded-xl font-bold text-sm hover:brightness-110 transition-all w-full"
                                        >
                                            Record Payment
                                        </button>
                                        <button
                                            onClick={() => setHistoryDialogBill(bill)}
                                            className="bg-transparent border border-white/10 py-3 rounded-xl font-bold text-sm hover:bg-white/5 transition-all w-full"
                                        >
                                            View History
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Record Bill Dialog */}
                <Dialog open={!!recordDialogBill} onOpenChange={(open) => { if (!open) { setRecordDialogBill(null); setRecordAmount(""); } }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Record Bill for {recordDialogBill?.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div>
                                <label className="text-sm font-medium">Bill Amount (₹)</label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={recordAmount}
                                    onChange={(e) => setRecordAmount(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={() => { setRecordDialogBill(null); setRecordAmount(""); }}>
                                    Cancel
                                </Button>
                                <Button
                                    disabled={!recordAmount}
                                    onClick={() => {
                                        if (recordDialogBill && recordAmount) {
                                            const now = new Date()
                                            const month = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-01"
                                            handleRecordBill(recordDialogBill.id, { amount: parseFloat(recordAmount), billingMonth: month })
                                            setRecordDialogBill(null)
                                            setRecordAmount("")
                                        }
                                    }}
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Bill History Dialog */}
                <Dialog open={!!historyDialogBill} onOpenChange={(open) => { if (!open) setHistoryDialogBill(null); }}>
                    <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Bill History - {historyDialogBill?.name}</DialogTitle>
                        </DialogHeader>
                        <div className="pt-4">
                            {historyLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : historyData?.data && historyData.data.length > 0 ? (
                                <div className="space-y-2">
                                    {historyData.data.map((record: { id: string; billingMonth: string; amount: string | number; paymentStatus: string; unitsConsumed?: string | number | null }) => (
                                        <div key={record.id} className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
                                            <div>
                                                <p className="font-medium">
                                                    {new Date(record.billingMonth).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                                                </p>
                                                <p className={`text-sm ${
                                                    record.paymentStatus === "SUCCESS" ? "text-[#00D4AA]" :
                                                    record.paymentStatus === "PENDING" ? "text-[#F59E0B]" :
                                                    "text-muted-foreground"
                                                }`}>
                                                    {record.paymentStatus === "SUCCESS" ? "Paid" : record.paymentStatus === "PENDING" ? "Pending" : record.paymentStatus}
                                                </p>
                                            </div>
                                            <div className="text-right flex items-center gap-2">
                                                <div>
                                                    <p className="font-bold">₹{Number(record.amount).toFixed(0)}</p>
                                                    {record.unitsConsumed && (
                                                        <p className="text-xs text-muted-foreground">{record.unitsConsumed} units</p>
                                                    )}
                                                </div>
                                                {record.paymentStatus === "PENDING" && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => markBillRecordPaid.mutate(record.id)}
                                                        disabled={markBillRecordPaid.isPending}
                                                    >
                                                        {markBillRecordPaid.isPending ? "..." : "Mark Paid"}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">No bill history available</p>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
