import { prisma } from "@/lib/db";
import { resend } from "@/lib/resend";

export const sendOtpEmail = async (email: string) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    try {
        const expiry = new Date(Date.now() + 5 * 60 * 1000);
        await prisma.user.update({
            where: { email },
            data: {
                otpCode: otp,
                otpExpiry: expiry
            }
        });

        await resend.emails.send({
            from: process.env.EMAIL_FROM!,
            to: email,
            subject: "OTP to verify your email",
            text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
        });
        return {
            success: true
        }
    } catch (error) {
        console.log(error);
        throw new Error("Something went wrong");
    }
}