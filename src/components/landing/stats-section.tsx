const stats = [
    { value: "45k+", label: "Subscriptions Tracked" },
    { value: "₹24L+", label: "Money Saved" },
    { value: "12k+", label: "Active Users" },
    { value: "99.9%", label: "Uptime %" },
]

export function StatsSection() {
    return (
        <section className="py-20 px-6 border-y border-[#3b4a44]/10 bg-[#0a0e19]">
            <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
                {stats.map((stat) => (
                    <div key={stat.label}>
                        <p className="text-4xl font-[family-name:var(--font-plus-jakarta)] font-extrabold text-[#46f1c5] mb-2">
                            {stat.value}
                        </p>
                        <p className="text-[#bacac2] font-medium">{stat.label}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}
