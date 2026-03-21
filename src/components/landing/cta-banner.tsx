import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CtaBanner() {
    return (
        <section className="py-20 md:py-28 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Start Saving Money Today
                </h2>
                <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
                    Join thousands of users who are already tracking their subscriptions and taking control of their finances.
                </p>
                <Button size="lg" variant="secondary" asChild className="text-base px-8">
                    <Link href="/sign-up">
                        Get Started Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
        </section>
    )
}
