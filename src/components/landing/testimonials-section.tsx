import { Card, CardContent } from "@/components/ui/card"

const testimonials = [
    {
        name: "Rahul S.",
        location: "Mumbai",
        initials: "RS",
        color: "bg-blue-500",
        quote: "I was paying for 4 streaming services I barely used. SubTracker helped me identify and cancel them, saving me over ₹1,500/month!",
    },
    {
        name: "Priya M.",
        location: "Bangalore",
        initials: "PM",
        color: "bg-purple-500",
        quote: "The budgeting feature is a game-changer. I finally know how much I can safely spend each month after all my bills and subscriptions.",
    },
    {
        name: "Arjun K.",
        location: "Delhi",
        initials: "AK",
        color: "bg-green-500",
        quote: "Tracking utility bills used to be a nightmare. Now I get estimates, track payments, and never miss a due date. Highly recommend!",
    },
]

export function TestimonialsSection() {
    return (
        <section className="py-20 md:py-28">
            <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by Thousands</h2>
                    <p className="text-lg text-muted-foreground">See what our users have to say.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((t) => (
                        <Card key={t.name} className="border-0 shadow-sm">
                            <CardContent className="p-6">
                                <p className="text-muted-foreground mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-bold`}>
                                        {t.initials}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{t.name}</p>
                                        <p className="text-xs text-muted-foreground">{t.location}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
