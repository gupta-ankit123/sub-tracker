import { z } from "zod";

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(1, "Required")
})

// Validates an ISO date string ("YYYY-MM-DD" or full ISO) and rejects it if
// the resulting age is outside [13, 120]. We deliberately keep this as a
// `string` (no .transform to Date) so React Hook Form's resolver and our
// API contract both treat it the same way — the route handler converts to
// a Date before passing to Prisma.
const dateOfBirthField = z
    .string()
    .refine((str) => {
        const d = new Date(str);
        if (Number.isNaN(d.getTime())) return false;
        const now = new Date();
        if (d > now) return false;
        const age =
            now.getFullYear() - d.getFullYear() -
            (now.getMonth() < d.getMonth() ||
            (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())
                ? 1
                : 0);
        return age >= 13 && age <= 120;
    }, "You must be at least 13 years old");

export const registerSchema = z.object({
    name: z.string().trim().min(1, "Required"),
    email: z.email(),
    password: z.string().min(8, "Minimum 8 characters required"),
    dateOfBirth: dateOfBirthField,
})

export const verifyOtpSchema = z.object({
    email: z.email(),
    otp: z.string().length(6, "OTP must be 6 digits")
})

export const updateProfileSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    phone: z.string().optional().or(z.literal("")),
    // Existing accounts may not have a DOB yet; let them set or change it
    // from the profile screen. Same age constraints as registration apply.
    dateOfBirth: dateOfBirthField.optional(),
})

export const updateSettingsSchema = z.object({
    currencyCode: z.string().length(3).optional(),
    timezone: z.string().min(1).optional(),
    emailNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    reminderDaysBefore: z.number().int().min(1).max(30).optional(),
    monthlyIncome: z.number().nonnegative().optional(),
    monthlyBudget: z.number().nonnegative().optional(),
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

export const forgotPasswordSchema = z.object({
    email: z.email(),
})

export const resetPasswordSchema = z.object({
    email: z.email(),
    otp: z.string().length(6, "OTP must be 6 digits"),
    newPassword: z.string().min(8, "Minimum 8 characters required"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export const resetPasswordServerSchema = z.object({
    email: z.email(),
    otp: z.string().length(6),
    newPassword: z.string().min(8),
})