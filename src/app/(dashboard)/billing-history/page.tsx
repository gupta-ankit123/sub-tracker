"use client"

import { useSubscriptions } from "@/features/subscriptions/api/use-subscriptions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SubscriptionFormDialog } from "@/features/subscriptions/components/subscription-form-dialog"
import { CreditCard, CheckCircle, Clock, Filter } from "lucide-react"
import { useState } from "react"
import { useMarkAsPaid } from "@/features/subscriptions/api/use-mark-as-paid"
import { useSkipPayment } from "@/features/subscriptions/api/use-skip-payment"
import { Check, SkipForward } from "lucide-react"

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
}

export default function BillingHistoryPage() {
    const { data, isLoading } = useSubscriptions()
    const markAsPaidMutation = useMarkAsPaid()
    const skipPaymentMutation = useSkipPayment()
    const [filter, setFilter] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")

    if (isLoading) {
        return (
            <div className="h-full p-4 md:p-8 overflow-auto">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div>
                        <div className="h-10 w-64 bg-white/[0.06] rounded-2xl animate-pulse" />
                        <div className="h-5 w-80 mt-3 bg-white/[0.06] rounded-2xl animate-pulse" />
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="glass-card p-6 rounded-[2rem] animate-pulse">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-white/[0.06]" />
                                    <div className="flex-1">
                                        <div className="h-3 w-20 bg-white/[0.06] rounded-xl mb-2" />
                                        <div className="h-7 w-28 bg-white/[0.06] rounded-xl mb-1" />
                                        <div className="h-3 w-24 bg-white/[0.06] rounded-xl" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="h-12 w-full md:w-96 bg-white/[0.06] rounded-2xl animate-pulse" />
                        <div className="flex gap-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-10 w-20 bg-white/[0.06] rounded-full animate-pulse" />
                            ))}
                        </div>
                    </div>

                    <div className="glass-card rounded-[2rem] p-4 animate-pulse">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-4 px-8 py-6">
                                <div className="w-10 h-10 bg-white/[0.06] rounded-xl" />
                                <div className="flex-1">
                                    <div className="h-4 w-32 bg-white/[0.06] rounded-xl mb-2" />
                                    <div className="h-3 w-20 bg-white/[0.06] rounded-xl" />
                                </div>
                                <div className="h-4 w-20 bg-white/[0.06] rounded-xl" />
                                <div className="h-6 w-16 bg-white/[0.06] rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const subscriptions: Subscription[] = data?.data || []

    const filteredSubscriptions = filter === "all"
        ? subscriptions
        : subscriptions.filter(item => item.paymentStatus === filter)

    const searchedSubscriptions = searchQuery
        ? filteredSubscriptions.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : filteredSubscriptions

    const totalPaid = subscriptions
        .filter(item => item.paymentStatus === "SUCCESS")
        .reduce((sum, item) => sum + Number(item.amount), 0)

    const totalPending = subscriptions
        .filter(item => item.paymentStatus === "PENDING")
        .reduce((sum, item) => sum + Number(item.amount), 0)

    const totalOverdue = subscriptions
        .filter(item => item.paymentStatus === "OVERDUE" || item.paymentStatus === "FAILED")
        .reduce((sum, item) => sum + Number(item.amount), 0)

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "SUCCESS": return <CheckCircle className="h-4 w-4 text-[#00D4AA]" />
            case "FAILED": return <Clock className="h-4 w-4 text-[#EF4444]" />
            case "OVERDUE": return <Clock className="h-4 w-4 text-[#EF4444]" />
            case "PENDING": return <Clock className="h-4 w-4 text-[#F59E0B]" />
            case "SKIPPED": return <SkipForward className="h-4 w-4 text-[#7A8BA8]" />
            default: return <Clock className="h-4 w-4 text-[#7A8BA8]" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "SUCCESS": return "bg-[#00D4AA]/10 text-[#00D4AA]"
            case "FAILED": return "bg-[#EF4444]/10 text-[#EF4444]"
            case "OVERDUE": return "bg-[#EF4444]/10 text-[#EF4444]"
            case "PENDING": return "bg-[#F59E0B]/10 text-[#F59E0B]"
            case "SKIPPED": return "bg-white/[0.06] text-[#7A8BA8]"
            default: return "bg-white/[0.06] text-[#7A8BA8]"
        }
    }

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
        const now = new Date()
        const diffMs = date.getTime() - now.getTime()
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

        if (status === "SUCCESS") return { text: "Completed", className: "text-[#46f1c5]" }
        if (status === "SKIPPED") return { text: "Paused", className: "text-[#bacac2]/60" }
        if (diffDays < 0) return { text: `${Math.abs(diffDays)} days ago`, className: "text-[#ffb4ab]" }
        if (diffDays === 0) return { text: "Today", className: "text-amber-500" }
        if (diffDays === 1) return { text: "Tomorrow", className: "text-amber-500" }
        return { text: `In ${diffDays} days`, className: "text-amber-500" }
    }

    const filterOptions = [
        { value: "all", label: "All" },
        { value: "SUCCESS", label: "Paid" },
        { value: "PENDING", label: "Pending" },
        { value: "OVERDUE", label: "Overdue" },
        { value: "SKIPPED", label: "Skipped" },
    ]

    if (subscriptions.length === 0) {
        return (
            <div className="h-full p-4 md:p-8 overflow-auto">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold font-[family-name:var(--font-plus-jakarta)] tracking-tight">Billing History</h1>
                        <p className="text-[#bacac2] mt-2 text-sm max-w-md">Manage and track your past and upcoming payments with luminous precision.</p>
                    </div>
                    <div className="flex flex-col items-center justify-center py-20 px-8 glass-card rounded-[2rem]">
                        <div className="w-16 h-16 rounded-2xl bg-[#46f1c5]/10 flex items-center justify-center mb-6">
                            <CreditCard className="h-8 w-8 text-[#46f1c5]" />
                        </div>
                        <div className="text-center mb-8">
                            <h3 className="text-xl font-semibold font-[family-name:var(--font-plus-jakarta)] tracking-tight">No subscriptions yet</h3>
                            <p className="text-[#bacac2]/60 mt-2 text-[15px]">Add subscriptions to track billing.</p>
                        </div>
                        <SubscriptionFormDialog>
                            <Button className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-black font-semibold rounded-xl px-6 h-11">
                                <CreditCard className="mr-2 h-4 w-4" />
                                Add Subscription
                            </Button>
                        </SubscriptionFormDialog>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full p-4 md:p-8 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Page Header */}
                <section>
                    <h1 className="text-4xl font-bold font-[family-name:var(--font-plus-jakarta)] tracking-tight">Billing History</h1>
                    <p className="text-[#bacac2] mt-2 text-sm max-w-md">Manage and track your past and upcoming payments with luminous precision.</p>
                </section>

                {/* Stat Cards */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Paid */}
                    <div className="glass-card p-6 rounded-[2rem] flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-[#46f1c5]/10 flex items-center justify-center">
                            <CheckCircle className="h-7 w-7 text-[#46f1c5]" />
                        </div>
                        <div>
                            <p className="text-[#bacac2] text-xs uppercase tracking-widest font-bold mb-1">Total Paid</p>
                            <h3 className="text-2xl font-bold font-[family-name:var(--font-plus-jakarta)]">₹{totalPaid.toFixed(2)}</h3>
                            <p className="text-xs text-[#46f1c5] mt-1 font-medium">
                                {subscriptions.filter(h => h.paymentStatus === "SUCCESS").length} payments this month
                            </p>
                        </div>
                    </div>

                    {/* Pending */}
                    <div className="glass-card p-6 rounded-[2rem] flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                            <Clock className="h-7 w-7 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-[#bacac2] text-xs uppercase tracking-widest font-bold mb-1">Pending</p>
                            <h3 className="text-2xl font-bold font-[family-name:var(--font-plus-jakarta)]">₹{totalPending.toFixed(2)}</h3>
                            <p className="text-xs text-amber-500 mt-1 font-medium">
                                {subscriptions.filter(h => h.paymentStatus === "PENDING").length} items due soon
                            </p>
                        </div>
                    </div>

                    {/* Overdue */}
                    <div className="glass-card p-6 rounded-[2rem] flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-[#ffb4ab]/10 flex items-center justify-center">
                            <Clock className="h-7 w-7 text-[#ffb4ab]" />
                        </div>
                        <div>
                            <p className="text-[#bacac2] text-xs uppercase tracking-widest font-bold mb-1">Overdue</p>
                            <h3 className="text-2xl font-bold font-[family-name:var(--font-plus-jakarta)]">₹{totalOverdue.toFixed(2)}</h3>
                            <p className="text-xs text-[#ffb4ab] mt-1 font-medium">
                                {subscriptions.filter(h => h.paymentStatus === "OVERDUE" || h.paymentStatus === "FAILED").length} missed payments
                            </p>
                        </div>
                    </div>
                </section>

                {/* Filters */}
                <section className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96 group">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#bacac2]/50 group-focus-within:text-[#46f1c5] transition-colors h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#0a0e19] border-none rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-[#bacac2]/40 focus:outline-none focus:ring-1 focus:ring-[#46f1c5]/40 transition-all"
                            placeholder="Search subscriptions..."
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        {filterOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setFilter(option.value)}
                                className={`whitespace-nowrap px-5 py-2.5 rounded-full font-medium text-sm transition-all active:scale-95 ${
                                    filter === option.value
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
                <section className="glass-card rounded-[2rem] overflow-hidden">
                    {searchedSubscriptions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
                                <CreditCard className="h-7 w-7 text-white/20" />
                            </div>
                            <p className="text-[#bacac2]/60 text-[15px]">No subscriptions found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#171b27]/50">
                                        <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-black text-[#bacac2]/60">Service</th>
                                        <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-black text-[#bacac2]/60">Due Date</th>
                                        <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-black text-[#bacac2]/60 text-right">Amount</th>
                                        <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-black text-[#bacac2]/60 text-center">Status</th>
                                        <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-black text-[#bacac2]/60 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {searchedSubscriptions.map((item) => {
                                        const iconColor = getIconColor(item.paymentStatus)
                                        const relativeTime = getRelativeTime(item.nextBillingDate, item.paymentStatus)

                                        return (
                                            <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                                {/* Service */}
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        {item.logoUrl ? (
                                                            <img
                                                                src={item.logoUrl}
                                                                alt={item.name}
                                                                className="w-10 h-10 rounded-xl object-cover"
                                                            />
                                                        ) : (
                                                            <div className={`w-10 h-10 rounded-xl ${iconColor.bg} flex items-center justify-center font-bold ${iconColor.text} relative`}>
                                                                {item.name.charAt(0)}
                                                                <div className={`absolute inset-0 ${iconColor.glow} blur-lg -z-10`}></div>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-bold">{item.name}</p>
                                                            <p className="text-xs text-[#bacac2]">{item.category}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Due Date */}
                                                <td className="px-8 py-6">
                                                    <p className="text-sm font-medium">
                                                        {new Date(item.nextBillingDate).toLocaleDateString("en-IN", {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        })}
                                                    </p>
                                                    <p className={`text-[10px] font-bold uppercase tracking-tighter ${relativeTime.className}`}>
                                                        {relativeTime.text}
                                                    </p>
                                                </td>

                                                {/* Amount */}
                                                <td className="px-8 py-6 text-right">
                                                    <span className="font-bold">
                                                        {item.currency === "INR" ? "₹" : item.currency} {Number(item.amount).toFixed(2)}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-8 py-6 text-center">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusBadgeClass(item.paymentStatus)}`}>
                                                        {getStatusLabel(item.paymentStatus)}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-8 py-6 text-right">
                                                    {item.paymentStatus === "PENDING" || item.paymentStatus === "OVERDUE" ? (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => markAsPaidMutation.mutate({
                                                                    param: { id: item.id }
                                                                })}
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
                                                        <div className="text-[#bacac2]/40">
                                                            <button className="w-10 h-10 flex items-center justify-center hover:text-white rounded-full transition-all ml-auto">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                                                    <circle cx="12" cy="5" r="1.5" />
                                                                    <circle cx="12" cy="12" r="1.5" />
                                                                    <circle cx="12" cy="19" r="1.5" />
                                                                </svg>
                                                            </button>
                                                        </div>
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
        </div>
    )
}
