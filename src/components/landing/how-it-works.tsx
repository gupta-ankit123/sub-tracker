export function HowItWorks() {
    const steps = [
        { number: 1, title: "Sign Up", description: "Create your account in seconds using email or social login." },
        { number: 2, title: "Add Bills", description: "Link your bank account or manually add recurring payments." },
        { number: 3, title: "Track & Save", description: "Get insights and start cutting down on unnecessary costs." },
    ]

    return (
        <section id="how-it-works" className="py-24 px-6 overflow-hidden relative">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-plus-jakarta)] font-bold mb-20 text-center">
                    How It Works
                </h2>

                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-16">
                    {steps.map((step) => (
                        <div key={step.number} className="text-center relative z-10">
                            <div className="w-16 h-16 rounded-full bg-[#46f1c5]/20 border border-[#46f1c5] text-[#46f1c5] flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                                {step.number}
                            </div>
                            <h4 className="text-xl font-bold mb-4">{step.title}</h4>
                            <p className="text-[#bacac2]">{step.description}</p>
                        </div>
                    ))}

                    {/* Connector line (desktop only) */}
                    <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-[#46f1c5]/30 to-transparent -z-0" />
                </div>
            </div>
        </section>
    )
}
