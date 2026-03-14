import { Suspense } from "react";
import { VerifyOtpCard } from "@/features/auth/components/verify-otp-card";

const VerifyOtpPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyOtpCard />
        </Suspense>
    )
}

export default VerifyOtpPage;
