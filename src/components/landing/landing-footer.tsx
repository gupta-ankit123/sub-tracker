import Link from "next/link"

export function LandingFooter() {
    return (
        <footer className="bg-[#080C16] pt-20 pb-10 px-6 border-t border-[#3b4a44]/5">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    {/* Brand */}
                    <div>
                        <span className="text-2xl font-black text-teal-400 font-[family-name:var(--font-plus-jakarta)] mb-6 block">
                            SubTracker
                        </span>
                        <p className="text-[#bacac2] text-sm leading-relaxed mb-8">
                            The ultimate dashboard for your modern digital lifestyle. Bringing clarity to your finances since 2024.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h5 className="font-bold mb-6 text-[#dfe2f2]">Product</h5>
                        <ul className="space-y-4 text-sm text-[#bacac2]">
                            <li><Link href="/dashboard" className="hover:text-[#46f1c5] transition-colors">Dashboard</Link></li>
                            <li><a href="#features" className="hover:text-[#46f1c5] transition-colors">Features</a></li>
                            <li><a href="#pricing" className="hover:text-[#46f1c5] transition-colors">Pricing</a></li>
                            <li><a href="#how-it-works" className="hover:text-[#46f1c5] transition-colors">How It Works</a></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h5 className="font-bold mb-6 text-[#dfe2f2]">Company</h5>
                        <ul className="space-y-4 text-sm text-[#bacac2]">
                            <li><span className="hover:text-[#46f1c5] transition-colors cursor-pointer">About Us</span></li>
                            <li><span className="hover:text-[#46f1c5] transition-colors cursor-pointer">Blog</span></li>
                            <li><span className="hover:text-[#46f1c5] transition-colors cursor-pointer">Careers</span></li>
                            <li><span className="hover:text-[#46f1c5] transition-colors cursor-pointer">Contact</span></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h5 className="font-bold mb-6 text-[#dfe2f2]">Legal</h5>
                        <ul className="space-y-4 text-sm text-[#bacac2]">
                            <li><span className="hover:text-[#46f1c5] transition-colors cursor-pointer">Privacy Policy</span></li>
                            <li><span className="hover:text-[#46f1c5] transition-colors cursor-pointer">Terms of Service</span></li>
                            <li><span className="hover:text-[#46f1c5] transition-colors cursor-pointer">Cookie Policy</span></li>
                            <li><span className="hover:text-[#46f1c5] transition-colors cursor-pointer">Security</span></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-[#3b4a44]/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-[#bacac2]">
                        &copy; {new Date().getFullYear()} SubTracker. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-xs text-[#bacac2]">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#46f1c5] inline-block" />
                            Systems Operational
                        </span>
                        <span>English (US)</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
