import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

const features = [
    "Unlimited subscriptions",
    "Utility bill tracking",
    "Smart budgeting",
    "Safe-to-spend calculator",
    "Unused subscription detection",
    "Analytics dashboard",
    "CSV & PDF export",
    "Email reminders",
    "Payment tracking",
]

export function PricingSection() {
    return (
        <section id="pricing" className="py-20 md:py-28 bg-gray-50/50">
            <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Pricing</h2>
                    <p className="text-lg text-muted-foreground">No hidden fees. No premium tiers. Just free.</p>
                </div>
                <div className="max-w-md mx-auto">
                    <Card className="border-2 border-primary shadow-lg">
                        <CardHeader className="text-center pb-2">
                            <Badge className="mx-auto mb-4 px-4">Most Popular</Badge>
                            <CardTitle className="text-2xl">Free Forever</CardTitle>
                            <div className="mt-4">
                                <span className="text-5xl font-bold">₹0</span>
                                <span className="text-muted-foreground ml-2">/ month</span>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <ul className="space-y-3 mb-8">
                                {features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3">
                                        <Check className="h-5 w-5 text-green-500 shrink-0" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button className="w-full" size="lg" asChild>
                                <Link href="/sign-up">Get Started Free</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}
