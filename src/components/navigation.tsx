"use client"

import { cn } from "@/lib/utils"
import { SettingsIcon, CreditCardIcon, CalendarIcon, BarChart3Icon, ClockIcon, ListIcon, Zap, WalletIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { GoCheckCircle, GoCheckCircleFill, GoHome, GoHomeFill, GoReport, GoCreditCard } from "react-icons/go"

const routes = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: GoHome,
        activeIcon: GoHomeFill
    },
    {
        label: "All Subscriptions",
        href: "/subscriptions",
        icon: ListIcon,
        activeIcon: GoCheckCircleFill
    },
    {
        label: "Utility Bills",
        href: "/utility-bills",
        icon: Zap,
        activeIcon: Zap
    },
    {
        label: "Upcoming Bills",
        href: "/upcoming",
        icon: ClockIcon,
        activeIcon: ClockIcon
    },
    {
        label: "Billing History",
        href: "/billing-history",
        icon: GoCreditCard,
        activeIcon: CreditCardIcon
    },
    {
        label: "Analytics",
        href: "/analytics",
        icon: GoReport,
        activeIcon: BarChart3Icon
    },
    {
        label: "Budgets",
        href: "/budgets",
        icon: WalletIcon,
        activeIcon: WalletIcon
    },
    {
        label: "Settings",
        href: "/settings",
        icon: SettingsIcon,
        activeIcon: SettingsIcon
    },
]

export const Navigation = () => {
    const pathname = usePathname()

    return (
        <ul className="flex flex-col">
            {routes.map((item) => {
                const isActive = pathname === item.href
                const Icon = isActive ? item.activeIcon : item.icon
                return (
                    <Link key={item.href} href={item.href}>
                        <div className={cn(
                            "flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-neutral-500",
                            isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
                        )}>
                            <Icon className="size-5 text-neutral-500" />
                            {item.label}
                        </div>
                    </Link>
                )
            })}
        </ul>
    )
}
