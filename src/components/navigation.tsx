"use client"

import { cn } from "@/lib/utils"
import { SettingsIcon, ListIcon, Zap, WalletIcon, LayoutDashboard, CalendarDays } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const routes = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Expenses & Budgets", href: "/budgets", icon: WalletIcon },
    { label: "All Subscriptions", href: "/subscriptions", icon: ListIcon },
    { label: "Utility Bills", href: "/utility-bills", icon: Zap },
    { label: "Bill Calendar", href: "/bill-calendar", icon: CalendarDays },
    { label: "Settings", href: "/settings", icon: SettingsIcon },
]

export const Navigation = () => {
    const pathname = usePathname()

    return (
        <ul className="flex flex-col gap-1">
            {routes.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                    <li key={item.href}>
                        <Link
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-3 py-3 px-4 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-[#00D4AA]/[0.12] text-[#00D4AA] border-r-4 border-[#00D4AA] rounded-r-lg translate-x-0.5"
                                    : "text-slate-400 hover:bg-white/[0.04] hover:text-white rounded-xl"
                            )}
                        >
                            <Icon className={cn(
                                "size-[18px] transition-colors duration-200 shrink-0",
                                isActive ? "text-[#00D4AA]" : "text-slate-500 group-hover:text-slate-300"
                            )} />
                            <span className="font-[family-name:var(--font-manrope)]">{item.label}</span>
                        </Link>
                    </li>
                )
            })}
        </ul>
    )
}
