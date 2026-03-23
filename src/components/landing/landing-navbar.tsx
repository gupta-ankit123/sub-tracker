"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MenuIcon, X } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
]

export function LandingNavbar() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`sticky top-0 z-50 transition-all duration-300 ${
                scrolled
                    ? "bg-[#0B0F1A]/80 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20"
                    : "bg-transparent"
            }`}
        >
            <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                <nav className="flex items-center justify-between h-16 md:h-18">
                    <Link href="/">
                        <Image
                            src="/logo.svg"
                            alt="SubTracker"
                            width={140}
                            height={40}
                            priority
                            className="brightness-0 invert opacity-90"
                        />
                    </Link>

                    {/* Desktop nav links */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="text-sm text-[#7A8BA8] hover:text-white transition-colors duration-200"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* Desktop auth buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <Button
                            variant="ghost"
                            asChild
                            className="text-[#C0CAD8] hover:text-white hover:bg-white/[0.06]"
                        >
                            <Link href="/sign-in">Sign In</Link>
                        </Button>
                        <Button
                            asChild
                            className="bg-[#00D4AA] hover:bg-[#00BF99] text-[#0B0F1A] font-semibold shadow-lg shadow-[#00D4AA]/20"
                        >
                            <Link href="/sign-up">Get Started</Link>
                        </Button>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 text-[#7A8BA8] hover:text-white transition-colors"
                    >
                        {mobileOpen ? <X className="size-5" /> : <MenuIcon className="size-5" />}
                    </button>
                </nav>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="md:hidden bg-[#0B0F1A]/95 backdrop-blur-xl border-b border-white/[0.06] overflow-hidden"
                    >
                        <div className="px-4 py-4 space-y-1">
                            {navLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="block py-2.5 text-sm text-[#7A8BA8] hover:text-white transition-colors"
                                >
                                    {link.label}
                                </a>
                            ))}
                            <div className="pt-3 flex flex-col gap-2 border-t border-white/[0.06]">
                                <Button
                                    variant="ghost"
                                    asChild
                                    className="w-full text-[#C0CAD8] hover:text-white hover:bg-white/[0.06]"
                                >
                                    <Link href="/sign-in">Sign In</Link>
                                </Button>
                                <Button
                                    asChild
                                    className="w-full bg-[#00D4AA] hover:bg-[#00BF99] text-[#0B0F1A] font-semibold"
                                >
                                    <Link href="/sign-up">Get Started</Link>
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    )
}
