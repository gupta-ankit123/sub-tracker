"use client"

const faqs = [
    {
        question: "Is SubTracker really free?",
        answer: "Yes, SubTracker is completely free to use. All features including subscription tracking, budgeting, analytics, and export are available at no cost. No credit card required.",
    },
    {
        question: "What subscriptions can I track?",
        answer: "You can track any recurring subscription including OTT platforms (Netflix, Hotstar, Prime), music streaming (Spotify, Apple Music), cloud storage, productivity tools, gaming services, and more.",
    },
    {
        question: "How does unused subscription detection work?",
        answer: "SubTracker monitors when you last marked a subscription as used. If a subscription hasn't been used beyond its expected frequency (e.g., a monthly service unused for 45+ days), it gets flagged as potentially unused with a savings estimate.",
    },
    {
        question: "Can I track utility bills too?",
        answer: "Yes! SubTracker supports tracking variable utility bills like electricity, water, gas, internet, and mobile postpaid. You can record monthly bills, get estimates based on historical data, and track payment status.",
    },
    {
        question: "Is my data secure?",
        answer: "Yes, we take security seriously. All passwords are hashed with bcrypt, sessions use secure HTTP-only JWT cookies, and your data is stored in an encrypted PostgreSQL database. We never share your data with third parties.",
    },
    {
        question: "Can I export my data?",
        answer: "Absolutely! You can export all your subscription data as a CSV file for spreadsheet analysis or download a comprehensive PDF report with spending breakdowns, category analysis, and more.",
    },
]

export function FaqSection() {
    return (
        <section id="faq" className="py-20 md:py-28 bg-gray-50/50">
            <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
                    <p className="text-lg text-muted-foreground">Got questions? We've got answers.</p>
                </div>
                <div className="max-w-2xl mx-auto space-y-4">
                    {faqs.map((faq) => (
                        <details
                            key={faq.question}
                            className="group rounded-lg border bg-white p-0 [&_summary::-webkit-details-marker]:hidden"
                        >
                            <summary className="flex cursor-pointer items-center justify-between p-5 font-medium">
                                <span>{faq.question}</span>
                                <span className="ml-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45 text-xl leading-none">+</span>
                            </summary>
                            <div className="px-5 pb-5 text-sm text-muted-foreground">
                                {faq.answer}
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    )
}
