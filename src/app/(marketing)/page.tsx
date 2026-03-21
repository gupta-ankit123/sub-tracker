import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrent } from "@/features/auth/action"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesGrid } from "@/components/landing/features-grid"
import { HowItWorks } from "@/components/landing/how-it-works"
import { StatsSection } from "@/components/landing/stats-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { FaqSection } from "@/components/landing/faq-section"
import { CtaBanner } from "@/components/landing/cta-banner"

export const metadata: Metadata = {
    title: "SubTracker - Track Subscriptions & Save Money | India",
    description: "Track recurring subscriptions, utility bills, and budgets. Detect unused services, get payment reminders, and save money. Free forever.",
}

export default async function LandingPage() {
    const user = await getCurrent()

    // Authenticated users go straight to dashboard
    if (user) {
        redirect("/dashboard")
    }

    return (
        <>
            <HeroSection />
            <FeaturesGrid />
            <HowItWorks />
            <StatsSection />
            <PricingSection />
            <TestimonialsSection />
            <FaqSection />
            <CtaBanner />
        </>
    )
}
