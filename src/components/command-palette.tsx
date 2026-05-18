"use client"

import { useEffect, useState, useCallback } from "react"
import { Command } from "cmdk"
import { useRouter } from "next/navigation"
import { useSubscriptions } from "@/features/subscriptions/api/use-subscriptions"
import { useUtilityBills } from "@/features/subscriptions/api/use-utility-bills"
import { useMarkAsPaid } from "@/features/subscriptions/api/use-mark-as-paid"
import {
    LayoutDashboard,
    ListIcon,
    Zap,
    WalletIcon,
    CalendarDays,
    SettingsIcon,
    CreditCard,
    Search,
    ArrowRight,
    Clock,
    FileText,
} from "lucide-react"

export function CommandPalette() {
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const { data: subscriptions } = useSubscriptions()
    const { data: utilityBills } = useUtilityBills()
    const markAsPaid = useMarkAsPaid()

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((prev) => !prev)
            }
            if (e.key === "Escape") {
                e.preventDefault()
                setOpen(false)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const runAction = useCallback((action: () => void) => {
        setOpen(false)
        action()
    }, [])

    const pages = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "All Subscriptions", href: "/subscriptions", icon: ListIcon },
        { name: "Utility Bills", href: "/utility-bills", icon: Zap },
        { name: "Expenses & Budgets", href: "/budgets", icon: WalletIcon },
        { name: "Bill Calendar", href: "/bill-calendar", icon: CalendarDays },
        { name: "Upcoming Bills", href: "/upcoming", icon: Clock },
        { name: "Billing History", href: "/billing-history", icon: FileText },
        { name: "Settings", href: "/settings", icon: SettingsIcon },
    ]

    const allSubscriptions = Array.isArray(subscriptions) ? subscriptions : []
    const allUtilityBills = Array.isArray(utilityBills) ? utilityBills : []

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="hidden sm:flex items-center bg-[#0a0e19] rounded-full px-4 py-1.5 border border-white/[0.04] hover:border-white/10 transition-colors cursor-pointer group"
            >
                <Search className="w-4 h-4 text-white/40 mr-2 group-hover:text-white/60 transition-colors" />
                <span className="text-sm text-white/30 group-hover:text-white/50 transition-colors w-32 text-left">
                    Search...
                </span>
                <kbd className="ml-4 hidden md:inline-flex items-center gap-0.5 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-white/30">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            {open && (
                <div className="fixed inset-0 z-50">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                    />
                    <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-[560px] px-4">
                        <Command
                            className="rounded-2xl border border-white/10 bg-[#0f1320] shadow-2xl shadow-black/50 overflow-hidden"
                            loop
                        >
                            <div className="flex items-center px-4 border-b border-white/[0.06]">
                                <Search className="w-4 h-4 text-white/40 shrink-0" />
                                <Command.Input
                                    autoFocus
                                    placeholder="Search subscriptions, pages, actions..."
                                    className="w-full bg-transparent border-none text-sm text-white placeholder:text-white/30 focus:ring-0 focus:outline-none py-4 px-3"
                                />
                                <kbd className="shrink-0 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-white/30">
                                    ESC
                                </kbd>
                            </div>

                            <Command.List className="max-h-[340px] overflow-y-auto p-2 scrollbar-thin">
                                <Command.Empty className="py-8 text-center text-sm text-white/40">
                                    No results found.
                                </Command.Empty>

                                {/* Navigation */}
                                <Command.Group
                                    heading="Pages"
                                    className="[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-white/25 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2"
                                >
                                    {pages.map((page) => {
                                        const Icon = page.icon
                                        return (
                                            <Command.Item
                                                key={page.href}
                                                value={`go to ${page.name}`}
                                                onSelect={() => runAction(() => router.push(page.href))}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 cursor-pointer data-[selected=true]:bg-[#00D4AA]/10 data-[selected=true]:text-[#00D4AA] transition-colors"
                                            >
                                                <Icon className="w-4 h-4 shrink-0 opacity-60" />
                                                <span className="flex-1">{page.name}</span>
                                                <ArrowRight className="w-3 h-3 opacity-0 data-[selected=true]:opacity-100 transition-opacity" />
                                            </Command.Item>
                                        )
                                    })}
                                </Command.Group>

                                {/* Subscriptions */}
                                {allSubscriptions.length > 0 && (
                                    <Command.Group
                                        heading="Subscriptions"
                                        className="[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-white/25 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2"
                                    >
                                        {allSubscriptions.map((sub: any) => (
                                            <Command.Item
                                                key={sub.id}
                                                value={`${sub.name} ${sub.category} subscription`}
                                                onSelect={() => runAction(() => router.push("/subscriptions"))}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 cursor-pointer data-[selected=true]:bg-[#00D4AA]/10 data-[selected=true]:text-[#00D4AA] transition-colors"
                                            >
                                                <ListIcon className="w-4 h-4 shrink-0 opacity-60" />
                                                <div className="flex-1 flex items-center gap-2">
                                                    <span>{sub.name}</span>
                                                    <span className="text-xs text-white/20">{sub.category}</span>
                                                </div>
                                                <span className="text-xs text-white/30">
                                                    {sub.currency} {sub.amount}
                                                </span>
                                            </Command.Item>
                                        ))}
                                    </Command.Group>
                                )}

                                {/* Utility Bills */}
                                {allUtilityBills.length > 0 && (
                                    <Command.Group
                                        heading="Utility Bills"
                                        className="[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-white/25 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2"
                                    >
                                        {allUtilityBills.map((bill: any) => (
                                            <Command.Item
                                                key={bill.id}
                                                value={`${bill.name} ${bill.category} utility bill`}
                                                onSelect={() => runAction(() => router.push("/utility-bills"))}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 cursor-pointer data-[selected=true]:bg-[#00D4AA]/10 data-[selected=true]:text-[#00D4AA] transition-colors"
                                            >
                                                <Zap className="w-4 h-4 shrink-0 opacity-60" />
                                                <div className="flex-1 flex items-center gap-2">
                                                    <span>{bill.name}</span>
                                                    <span className="text-xs text-white/20">{bill.category}</span>
                                                </div>
                                            </Command.Item>
                                        ))}
                                    </Command.Group>
                                )}

                                {/* Quick Actions */}
                                <Command.Group
                                    heading="Quick Actions"
                                    className="[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-white/25 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2"
                                >
                                    {allSubscriptions
                                        .filter((sub: any) => sub.paymentStatus === "PENDING" || sub.paymentStatus === "OVERDUE")
                                        .map((sub: any) => (
                                            <Command.Item
                                                key={`pay-${sub.id}`}
                                                value={`mark ${sub.name} as paid payment`}
                                                onSelect={() =>
                                                    runAction(() =>
                                                        markAsPaid.mutate({ param: { id: sub.id } })
                                                    )
                                                }
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 cursor-pointer data-[selected=true]:bg-[#00D4AA]/10 data-[selected=true]:text-[#00D4AA] transition-colors"
                                            >
                                                <CreditCard className="w-4 h-4 shrink-0 opacity-60" />
                                                <span className="flex-1">
                                                    Mark <strong>{sub.name}</strong> as paid
                                                </span>
                                                <span className="text-[10px] uppercase tracking-wide text-amber-400/60 bg-amber-400/10 px-1.5 py-0.5 rounded">
                                                    {sub.paymentStatus}
                                                </span>
                                            </Command.Item>
                                        ))}
                                </Command.Group>
                            </Command.List>

                            <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.06] text-[11px] text-white/20">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                        <kbd className="rounded bg-white/[0.06] px-1 py-0.5 text-[10px]">↑↓</kbd>
                                        navigate
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="rounded bg-white/[0.06] px-1 py-0.5 text-[10px]">↵</kbd>
                                        select
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="rounded bg-white/[0.06] px-1 py-0.5 text-[10px]">esc</kbd>
                                        close
                                    </span>
                                </div>
                            </div>
                        </Command>
                    </div>
                </div>
            )}
        </>
    )
}
