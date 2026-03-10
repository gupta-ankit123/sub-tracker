import { z } from "zod";

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(1, "Required")
})

export const registerSchema = z.object({
    name: z.string().trim().min(1, "Required"),
    email: z.email(),
    password: z.string().min(8, "Minimum 8 characters required")
})

export const verifyOtpSchema = z.object({
    email: z.email(),
    otp: z.string().length(6, "OTP must be 6 digits")
})