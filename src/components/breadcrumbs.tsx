"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

const labelMap: Record<string, string> = {
    dashboard: "Dashboard",
    subscriptions: "Subscriptions",
    "utility-bills": "Utility Bills",
    budgets: "Budgets",
    "bill-calendar": "Bill Calendar",
    upcoming: "Upcoming",
    "billing-history": "Billing History",
    settings: "Settings",
    analytics: "Insights",
    setup: "Setup",
}

export const Breadcrumbs = () => {
    const pathname = usePathname()
    const segments = pathname.split("/").filter(Boolean)

    // Don't show breadcrumbs on the dashboard (root page)
    if (segments.length === 0 || (segments.length === 1 && segments[0] === "dashboard")) {
        return null
    }

    const crumbs = segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/")
        const label = labelMap[segment] || segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        const isLast = index === segments.length - 1

        return { href, label, isLast }
    })

    return (
        <nav aria-label="Breadcrumb" className="px-4 sm:px-6 lg:px-8 pt-4 max-w-screen-2xl mx-auto">
            <ol className="flex items-center gap-1.5 text-sm font-[family-name:var(--font-manrope)]">
                <li>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-1 text-slate-500 hover:text-[#00D4AA] transition-colors"
                    >
                        <Home className="size-3.5" />
                        <span>Home</span>
                    </Link>
                </li>
                {crumbs.map((crumb) => (
                    <li key={crumb.href} className="flex items-center gap-1.5">
                        <ChevronRight className="size-3.5 text-slate-600" />
                        {crumb.isLast ? (
                            <span className="text-slate-200 font-medium">
                                {crumb.label}
                            </span>
                        ) : (
                            <Link
                                href={crumb.href}
                                className="text-slate-500 hover:text-[#00D4AA] transition-colors"
                            >
                                {crumb.label}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    )
}
