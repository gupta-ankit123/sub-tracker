import { LandingNavbar } from "@/components/landing/landing-navbar"
import { LandingFooter } from "@/components/landing/landing-footer"

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <LandingNavbar />
            <main className="flex-1">{children}</main>
            <LandingFooter />
        </div>
    )
}
