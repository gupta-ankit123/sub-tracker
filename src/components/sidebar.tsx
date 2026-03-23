import Link from "next/link"
import { Navigation } from "./navigation"

export const Sidebar = () => {
    return (
        <aside className="h-full w-full bg-[#0a0e19] border-r border-white/[0.04] flex flex-col py-8">
            {/* Logo */}
            <div className="px-6 mb-10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00D4AA] flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#005643" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                    </svg>
                </div>
                <div>
                    <Link href="/dashboard">
                        <h1 className="text-lg font-black text-[#00D4AA] font-[family-name:var(--font-plus-jakarta)] tracking-tight leading-none">SubTracker</h1>
                    </Link>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mt-1">Premium Plan</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 overflow-y-auto">
                <Navigation />
            </nav>

            {/* Bottom section */}
            <div className="px-4 mt-auto">
                <div className="bg-[#1b1f2b] rounded-xl p-4 border border-white/[0.04] mb-4">
                    <p className="text-xs text-white/40 mb-2 font-medium">Manage spending</p>
                    <button className="w-full py-2 bg-[#00D4AA] text-[#005643] text-xs font-bold rounded-lg hover:shadow-[0_0_15px_rgba(0,212,170,0.3)] transition-all">
                        Upgrade Now
                    </button>
                </div>
            </div>
        </aside>
    )
}
