"use client"

interface AuthLayoutProps {
    children: React.ReactNode
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
    return (
        <main className="min-h-screen bg-[#0f131e] relative overflow-hidden flex items-center justify-center p-6">
            {/* Grain overlay */}
            <div
                className="fixed inset-0 opacity-[0.03] pointer-events-none z-[100]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Ambient orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#46f1c5]/20 rounded-full blur-[80px] opacity-40" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#0566d9]/10 rounded-full blur-[80px] opacity-40" />
            <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-[#dfd0ff]/10 rounded-full blur-[80px] opacity-40" />

            {/* Content */}
            <div className="relative z-10 w-full max-w-[440px]">
                {children}
            </div>

            {/* Bottom gradient line */}
            <div className="fixed bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#46f1c5]/30 to-transparent" />
        </main>
    )
}

export default AuthLayout
