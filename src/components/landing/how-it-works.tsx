import { UserPlus, ListPlus, TrendingDown } from "lucide-react"

const steps = [
    {
        number: "1",
        icon: UserPlus,
        title: "Sign Up Free",
        description: "Create your free account in 30 seconds. No credit card required, no hidden charges.",
    },
    {
        number: "2",
        icon: ListPlus,
        title: "Add Your Bills",
        description: "Add your subscriptions, utility bills, and set monthly budgets for each spending category.",
    },
    {
        number: "3",
        icon: TrendingDown,
        title: "Track & Save",
        description: "Get insights, detect unused services, track payments, and know your safe-to-spend amount.",
    },
]

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-20 md:py-28">
            <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Get started in minutes and take control of your finances.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
                    {/* Connecting line (desktop only) */}
                    <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gray-200" />

                    {steps.map((step) => {
                        const Icon = step.icon
                        return (
                            <div key={step.number} className="text-center relative">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold mb-6 relative z-10">
                                    {step.number}
                                </div>
                                <div className="mb-3">
                                    <Icon className="h-6 w-6 mx-auto text-muted-foreground" />
                                </div>
                                <h3 className="font-semibold text-xl mb-2">{step.title}</h3>
                                <p className="text-muted-foreground max-w-xs mx-auto">{step.description}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
