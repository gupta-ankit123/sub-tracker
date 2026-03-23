import { LandingNavbar } from "@/components/landing/landing-navbar"
import { LandingFooter } from "@/components/landing/landing-footer"

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-[#0f131e] text-[#dfe2f2] selection:bg-[#46f1c5]/30 selection:text-[#46f1c5] overflow-x-hidden">
            <LandingNavbar />
            <main className="flex-1">{children}</main>
            <LandingFooter />
        </div>
    )
}
