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

export const updateProfileSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    phone: z.string().optional().or(z.literal("")),
})

export const updateSettingsSchema = z.object({
    currencyCode: z.string().length(3).optional(),
    timezone: z.string().min(1).optional(),
    emailNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    reminderDaysBefore: z.number().int().min(1).max(30).optional(),
})

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Minimum 8 characters required"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export const changePasswordServerSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
})