import { Hono } from "hono";
import type { Context } from "hono";
import { zValidator } from "@hono/zod-validator"
import { loginSchema, registerSchema, verifyOtpSchema, updateProfileSchema, updateSettingsSchema, changePasswordServerSchema, forgotPasswordSchema, resetPasswordServerSchema } from "../schemas";
import { passwordResetEmailHtml } from "@/lib/email-templates";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { deleteCookie, setCookie } from "hono/cookie"
import { sessionMiddleware } from "@/lib/sessionMiddleware";
import { resend } from "@/lib/resend";
import { createAccessToken, createRefreshToken, setAccessCookie, setRefreshCookie, getRefreshTokenFromCookie, verifyRefreshToken } from "@/lib/jwt";


const app = new Hono()
    .get("/current", sessionMiddleware, (c) => {
        const user = c.get("user");
        return c.json({ data: user })
    })
    .post("/login", zValidator("json", loginSchema), async (c) => {
        const { email, password } = c.req.valid("json")
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return c.json({
                error: "Invalid credentials"
            }, 401)
        }
        if (!user.emailVerified) {
            return c.json(
                { error: "Please verify your email first" },
                403
            );
        }

        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
            return c.json({ error: "Invalid Credentials" }, 400)
        }

        // Update lastLoginAt timestamp
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        })

        const accessToken = createAccessToken(user.id);
        const refreshToken = createRefreshToken(user.id);

        setAccessCookie(c, accessToken);
        setRefreshCookie(c, refreshToken);

        return c.json({
            message: "login successful",
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        })
    })
    .post("/register", zValidator("json", registerSchema), async (c) => {
        const { name, email, password } = c.req.valid("json")

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return c.json({ error: "User already exists" }, 400)
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 5 * 60 * 1000);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                emailVerified: false,
                otpCode: otp,
                otpExpiry: expiry,

            },
        });

        const emailResult = await resend.emails.send({
            from: process.env.EMAIL_FROM!,
            to: email,
            subject: "Verify your email",
            text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
        });

        if (emailResult.error) {
            console.error("Resend error:", emailResult.error);
        }

        return c.json({
            message: "Registration successful",
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        })

    })
    .post("/verify-otp", zValidator("json", verifyOtpSchema), async (c) => {
        const { email, otp } = c.req.valid("json");

        try {
            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                return c.json({ error: "User not found" }, 404);
            }

            if (!user.otpCode || !user.otpExpiry) {
                return c.json({ error: "OTP expired or invalid" }, 401);
            }

            if (user.otpCode !== otp) {
                return c.json({ error: "OTP expired or invalid" }, 401);
            }

            if (user.otpExpiry < new Date()) {
                return c.json({ error: "OTP expired or invalid" }, 401);
            }

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    emailVerified: true,
                    otpCode: null,
                    otpExpiry: null
                }
            });

            const accessToken = createAccessToken(user.id);
            const refreshToken = createRefreshToken(user.id);

            setAccessCookie(c, accessToken);
            setRefreshCookie(c, refreshToken);

            return c.json({ message: "Email verified successfully" });
        }
        catch (error) {
            console.log(error);
            return c.json({ error: "Something went wrong" }, 500);
        }
    })
    .post("/refresh", async (c) => {
        const refreshToken = getRefreshTokenFromCookie(c);

        if (!refreshToken) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        try {
            const payload = verifyRefreshToken(refreshToken);

            const accessToken = createAccessToken(payload.userId);

            setAccessCookie(c, accessToken);

            return c.json({ success: true });
        } catch {
            return c.json({ error: "Invalid refresh token" }, 401);
        }
    })
    .post("/logout", sessionMiddleware, async (c) => {
        deleteCookie(c, "auth_token")
        deleteCookie(c, "refresh_token");
        return c.json({ message: "Logout successful" })
    })
    .patch("/profile", sessionMiddleware, zValidator("json", updateProfileSchema), async (c) => {
        const user = c.get("user");
        const { name, phone } = c.req.valid("json");

        if (phone) {
            const existing = await prisma.user.findFirst({
                where: { phone, id: { not: user.id } }
            });
            if (existing) {
                return c.json({ error: "Phone number already in use" }, 400);
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                name,
                phone: phone || null,
            },
        });

        return c.json({ data: updatedUser });
    })
    .patch("/settings", sessionMiddleware, zValidator("json", updateSettingsSchema), async (c) => {
        const user = c.get("user");
        const { currencyCode, timezone, emailNotifications, pushNotifications, reminderDaysBefore } = c.req.valid("json");

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                ...(currencyCode !== undefined && { currencyCode }),
                ...(timezone !== undefined && { timezone }),
                ...(emailNotifications !== undefined && { emailNotifications }),
                ...(pushNotifications !== undefined && { pushNotifications }),
            },
        });

        if (reminderDaysBefore !== undefined) {
            const existingPref = await prisma.notificationPreference.findFirst({
                where: { userId: user.id, subscriptionId: null },
            });

            if (existingPref) {
                await prisma.notificationPreference.update({
                    where: { id: existingPref.id },
                    data: { reminderDaysBefore },
                });
            } else {
                await prisma.notificationPreference.create({
                    data: {
                        userId: user.id,
                        reminderDaysBefore,
                    },
                });
            }
        }

        return c.json({ data: updatedUser });
    })
    .patch("/change-password", sessionMiddleware, zValidator("json", changePasswordServerSchema), async (c) => {
        const user = c.get("user");
        const { currentPassword, newPassword } = c.req.valid("json");

        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return c.json({ error: "Current password is incorrect" }, 400);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        return c.json({ message: "Password changed successfully" });
    })
    .post("/forgot-password", zValidator("json", forgotPasswordSchema), async (c) => {
        const { email } = c.req.valid("json");

        try {
            const user = await prisma.user.findUnique({ where: { email } });

            if (user) {
                // Rate limit: reject if a valid reset code already exists
                if (user.resetCodeExpiry && user.resetCodeExpiry > new Date()) {
                    return c.json({ error: "A reset code was already sent. Please wait before requesting another." }, 429);
                }

                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const expiry = new Date(Date.now() + 15 * 60 * 1000);

                await prisma.user.update({
                    where: { id: user.id },
                    data: { resetCode: otp, resetCodeExpiry: expiry },
                });

                await resend.emails.send({
                    from: process.env.EMAIL_FROM!,
                    to: email,
                    subject: "Reset your password",
                    html: passwordResetEmailHtml({ userName: user.name, otp }),
                });
            }

            return c.json({ message: "If an account with that email exists, a reset code has been sent." });
        } catch (error) {
            console.error("Forgot password error:", error);
            return c.json({ error: "Something went wrong" }, 500);
        }
    })
    .post("/reset-password", zValidator("json", resetPasswordServerSchema), async (c) => {
        const { email, otp, newPassword } = c.req.valid("json");

        try {
            const user = await prisma.user.findUnique({ where: { email } });

            if (!user || !user.resetCode || !user.resetCodeExpiry) {
                return c.json({ error: "Invalid or expired reset code" }, 400);
            }

            if (user.resetCode !== otp) {
                return c.json({ error: "Invalid or expired reset code" }, 400);
            }

            if (user.resetCodeExpiry < new Date()) {
                return c.json({ error: "Invalid or expired reset code" }, 400);
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    resetCode: null,
                    resetCodeExpiry: null,
                },
            });

            // Invalidate current session cookies
            deleteCookie(c, "auth_token");
            deleteCookie(c, "refresh_token");

            return c.json({ message: "Password reset successfully" });
        } catch (error) {
            console.error("Reset password error:", error);
            return c.json({ error: "Something went wrong" }, 500);
        }
    })
    .delete("/account", sessionMiddleware, async (c) => {
        const user = c.get("user");

        await prisma.user.delete({
            where: { id: user.id },
        });

        deleteCookie(c, "auth_token");
        deleteCookie(c, "refresh_token");

        return c.json({ message: "Account deleted successfully" });
    })

export default app;