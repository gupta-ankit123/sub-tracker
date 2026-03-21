const stats = [
    { value: "10,000+", label: "Subscriptions Tracked" },
    { value: "₹50L+", label: "Money Saved" },
    { value: "5,000+", label: "Happy Users" },
    { value: "99.9%", label: "Uptime" },
]

export function StatsSection() {
    return (
        <section className="py-16 bg-primary">
            <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat) => (
                        <div key={stat.label} className="text-center">
                            <p className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</p>
                            <p className="text-sm text-blue-100">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
