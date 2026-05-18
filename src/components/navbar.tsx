"use client"

import { UserButton } from "@/features/auth/components/user-button"
import { MobileSidebar } from "./mobile-sidebar"
import { CommandPalette } from "./command-palette"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Bell, Settings } from "lucide-react"

const topNavLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Subscriptions", href: "/subscriptions" },
    { label: "Insights", href: "/analytics" },
    { label: "Bills", href: "/utility-bills" },
]

export const Navbar = () => {
    const pathname = usePathname()

    return (
        <nav className="sticky top-0 z-30 bg-slate-900/60 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between px-6 h-16">
                <div className="flex items-center gap-8">
                    <MobileSidebar />
                    <div className="hidden lg:flex items-center gap-6">
                        {topNavLinks.map((link) => {
                            const isActive = pathname === link.href
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "text-sm font-semibold font-[family-name:var(--font-plus-jakarta)] transition-colors",
                                        isActive
                                            ? "text-[#00D4AA] border-b-2 border-[#00D4AA] pb-1"
                                            : "text-slate-400 hover:text-slate-200"
                                    )}
                                >
                                    {link.label}
                                </Link>
                            )
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <CommandPalette />
                    <button className="p-2 text-slate-400 hover:bg-[#00D4AA]/10 hover:text-[#00D4AA] rounded-full transition-all">
                        <Bell className="w-5 h-5" />
                    </button>
                    <UserButton />
                </div>
            </div>
        </nav>
    )
}
