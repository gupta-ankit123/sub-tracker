import Link from "next/link"
import Image from "next/image"

export function LandingFooter() {
    return (
        <footer className="bg-[#080C16] border-t border-white/[0.04]">
            <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1">
                        <Link href="/">
                            <Image
                                src="/logo.svg"
                                alt="SubTracker"
                                width={130}
                                height={38}
                                className="brightness-0 invert opacity-80"
                            />
                        </Link>
                        <p className="mt-3 text-sm text-[#5A6B82] leading-relaxed">
                            Track subscriptions, manage bills, and save money. Built for India.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-[#C0CAD8] text-sm mb-3 font-[family-name:var(--font-plus-jakarta)]">
                            Product
                        </h3>
                        <ul className="space-y-2.5 text-sm">
                            <li><a href="#features" className="text-[#5A6B82] hover:text-[#00D4AA] transition-colors duration-200">Features</a></li>
                            <li><a href="#pricing" className="text-[#5A6B82] hover:text-[#00D4AA] transition-colors duration-200">Pricing</a></li>
                            <li><a href="#faq" className="text-[#5A6B82] hover:text-[#00D4AA] transition-colors duration-200">FAQ</a></li>
                            <li><a href="#how-it-works" className="text-[#5A6B82] hover:text-[#00D4AA] transition-colors duration-200">How It Works</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-[#C0CAD8] text-sm mb-3 font-[family-name:var(--font-plus-jakarta)]">
                            Account
                        </h3>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link href="/sign-in" className="text-[#5A6B82] hover:text-[#00D4AA] transition-colors duration-200">Sign In</Link></li>
                            <li><Link href="/sign-up" className="text-[#5A6B82] hover:text-[#00D4AA] transition-colors duration-200">Sign Up</Link></li>
                            <li><Link href="/dashboard" className="text-[#5A6B82] hover:text-[#00D4AA] transition-colors duration-200">Dashboard</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-[#C0CAD8] text-sm mb-3 font-[family-name:var(--font-plus-jakarta)]">
                            Legal
                        </h3>
                        <ul className="space-y-2.5 text-sm">
                            <li><span className="text-[#3A4A60]">Privacy Policy</span></li>
                            <li><span className="text-[#3A4A60]">Terms of Service</span></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/[0.04] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-[#3A4A60]">
                        &copy; {new Date().getFullYear()} SubTracker. All rights reserved.
                    </p>
                    <p className="text-xs text-[#3A4A60]">
                        Made with &#10084; in India
                    </p>
                </div>
            </div>
        </footer>
    )
}
