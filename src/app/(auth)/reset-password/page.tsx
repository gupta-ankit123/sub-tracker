import { Suspense } from "react"
import { ResetPasswordCard } from "@/features/auth/components/reset-password-card"

const ResetPasswordPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordCard />
        </Suspense>
    )
}

export default ResetPasswordPage
