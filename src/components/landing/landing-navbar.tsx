"use client"

import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useState } from "react"

const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
]

export function LandingNavbar() {
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <nav className="fixed top-0 w-full h-16 z-50 bg-slate-900/60 backdrop-blur-xl flex justify-between items-center px-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-8">
                <Link href="/" className="text-xl font-bold tracking-tight text-teal-400 font-[family-name:var(--font-plus-jakarta)]">
                    SubTracker
                </Link>
                <div className="hidden md:flex items-center gap-6 text-sm">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="text-slate-400 hover:text-slate-200 transition-colors"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
                <Link
                    href="/sign-in"
                    className="text-slate-400 hover:text-slate-200 transition-colors text-sm font-medium px-4 py-2"
                >
                    Sign In
                </Link>
                <Link
                    href="/sign-up"
                    className="bg-[#00d4aa] text-[#005643] px-5 py-2 rounded-xl text-sm font-bold active:scale-95 transition-all duration-200"
                >
                    Get Started
                </Link>
            </div>

            {/* Mobile menu button */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
            >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="absolute top-16 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 md:hidden">
                    <div className="px-6 py-4 space-y-1">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="block py-2.5 text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                        <div className="pt-3 flex flex-col gap-2 border-t border-white/5">
                            <Link
                                href="/sign-in"
                                className="block py-2.5 text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/sign-up"
                                className="bg-[#00d4aa] text-[#005643] px-5 py-2.5 rounded-xl text-sm font-bold text-center"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
