import { describe, it, expect, beforeEach, vi } from "vitest"
import { Hono } from "hono"
import { prismaMock } from "./setup"
import { TEST_USER, createAuthCookie, makeRequest, makeUnauthRequest } from "./helpers"
import bcrypt from "bcryptjs"

// Build the full app matching the real route structure
import auth from "@/features/auth/server/route"
const app = new Hono().basePath("/api").route("/auth", auth)

describe("Auth API", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    // ══════════════════════════════════════════════
    // GET /api/auth/current
    // ══════════════════════════════════════════════
    describe("GET /api/auth/current", () => {
        it("returns current user when authenticated", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)

            const res = await makeRequest(app, "/api/auth/current")
            expect(res.status).toBe(200)

            const json = await res.json()
            expect(json.data.id).toBe(TEST_USER.id)
            expect(json.data.email).toBe(TEST_USER.email)
        })

        it("returns 401 when no auth cookie", async () => {
            const res = await makeUnauthRequest(app, "/api/auth/current")
            expect(res.status).toBe(401)
        })

        it("returns 401 when user not found in DB", async () => {
            prismaMock.user.findUnique.mockResolvedValue(null)

            const res = await makeRequest(app, "/api/auth/current")
            expect(res.status).toBe(401)
        })
    })

    // ══════════════════════════════════════════════
    // POST /api/auth/login
    // ══════════════════════════════════════════════
    describe("POST /api/auth/login", () => {
        it("returns 401 for non-existent user", async () => {
            prismaMock.user.findUnique.mockResolvedValue(null)

            const res = await makeUnauthRequest(app, "/api/auth/login", {
                method: "POST",
                body: { email: "nobody@example.com", password: "password123" },
            })
            expect(res.status).toBe(401)
            const json = await res.json()
            expect(json.error).toMatch(/invalid credentials/i)
        })

        it("returns 403 for unverified email", async () => {
            prismaMock.user.findUnique.mockResolvedValue({
                ...TEST_USER,
                emailVerified: false,
            })

            const res = await makeUnauthRequest(app, "/api/auth/login", {
                method: "POST",
                body: { email: TEST_USER.email, password: "password123" },
            })
            expect(res.status).toBe(403)
            const json = await res.json()
            expect(json.error).toMatch(/verify your email/i)
        })

        it("returns 400 for wrong password", async () => {
            const hashedPassword = await bcrypt.hash("correctpassword", 10)
            prismaMock.user.findUnique.mockResolvedValue({
                ...TEST_USER,
                password: hashedPassword,
            })

            const res = await makeUnauthRequest(app, "/api/auth/login", {
                method: "POST",
                body: { email: TEST_USER.email, password: "wrongpassword" },
            })
            expect(res.status).toBe(400)
        })

        it("logs in successfully with correct credentials", async () => {
            const hashedPassword = await bcrypt.hash("correctpassword", 10)
            prismaMock.user.findUnique.mockResolvedValue({
                ...TEST_USER,
                password: hashedPassword,
            })
            prismaMock.user.update.mockResolvedValue(TEST_USER)

            const res = await makeUnauthRequest(app, "/api/auth/login", {
                method: "POST",
                body: { email: TEST_USER.email, password: "correctpassword" },
            })
            expect(res.status).toBe(200)

            const json = await res.json()
            expect(json.message).toMatch(/login successful/i)
            expect(json.user.email).toBe(TEST_USER.email)

            // Should set auth cookies
            const cookies = res.headers.getSetCookie()
            expect(cookies.some((c: string) => c.startsWith("auth_token="))).toBe(true)
            expect(cookies.some((c: string) => c.startsWith("refresh_token="))).toBe(true)
        })

        it("rejects login with missing email", async () => {
            const res = await makeUnauthRequest(app, "/api/auth/login", {
                method: "POST",
                body: { password: "password123" },
            })
            expect(res.status).toBe(400)
        })
    })

    // ══════════════════════════════════════════════
    // POST /api/auth/register
    // ══════════════════════════════════════════════
    describe("POST /api/auth/register", () => {
        it("registers a new user successfully", async () => {
            prismaMock.user.findUnique.mockResolvedValue(null) // no existing user
            prismaMock.user.create.mockResolvedValue({
                ...TEST_USER,
                id: "new-user-id",
                emailVerified: false,
            })

            const res = await makeUnauthRequest(app, "/api/auth/register", {
                method: "POST",
                body: { name: "New User", email: "new@example.com", password: "password123" },
            })
            expect(res.status).toBe(200)
            const json = await res.json()
            expect(json.message).toMatch(/registration successful/i)
        })

        it("rejects duplicate email", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)

            const res = await makeUnauthRequest(app, "/api/auth/register", {
                method: "POST",
                body: { name: "Dup User", email: TEST_USER.email, password: "password123" },
            })
            expect(res.status).toBe(400)
            const json = await res.json()
            expect(json.error).toMatch(/already exists/i)
        })

        it("rejects short password", async () => {
            const res = await makeUnauthRequest(app, "/api/auth/register", {
                method: "POST",
                body: { name: "User", email: "new@example.com", password: "short" },
            })
            expect(res.status).toBe(400)
        })
    })

    // ══════════════════════════════════════════════
    // POST /api/auth/verify-otp
    // ══════════════════════════════════════════════
    describe("POST /api/auth/verify-otp", () => {
        it("verifies valid OTP", async () => {
            prismaMock.user.findUnique.mockResolvedValue({
                ...TEST_USER,
                emailVerified: false,
                otpCode: "123456",
                otpExpiry: new Date(Date.now() + 300000), // 5 min from now
            })
            prismaMock.user.update.mockResolvedValue({ ...TEST_USER, emailVerified: true })

            const res = await makeUnauthRequest(app, "/api/auth/verify-otp", {
                method: "POST",
                body: { email: TEST_USER.email, otp: "123456" },
            })
            expect(res.status).toBe(200)
            const json = await res.json()
            expect(json.message).toMatch(/verified/i)
        })

        it("rejects wrong OTP", async () => {
            prismaMock.user.findUnique.mockResolvedValue({
                ...TEST_USER,
                otpCode: "123456",
                otpExpiry: new Date(Date.now() + 300000),
            })

            const res = await makeUnauthRequest(app, "/api/auth/verify-otp", {
                method: "POST",
                body: { email: TEST_USER.email, otp: "999999" },
            })
            expect(res.status).toBe(401)
        })

        it("rejects expired OTP", async () => {
            prismaMock.user.findUnique.mockResolvedValue({
                ...TEST_USER,
                otpCode: "123456",
                otpExpiry: new Date(Date.now() - 60000), // expired 1 min ago
            })

            const res = await makeUnauthRequest(app, "/api/auth/verify-otp", {
                method: "POST",
                body: { email: TEST_USER.email, otp: "123456" },
            })
            expect(res.status).toBe(401)
        })

        it("returns 404 for non-existent user", async () => {
            prismaMock.user.findUnique.mockResolvedValue(null)

            const res = await makeUnauthRequest(app, "/api/auth/verify-otp", {
                method: "POST",
                body: { email: "nobody@example.com", otp: "123456" },
            })
            expect(res.status).toBe(404)
        })
    })

    // ══════════════════════════════════════════════
    // POST /api/auth/refresh
    // ══════════════════════════════════════════════
    describe("POST /api/auth/refresh", () => {
        it("returns 401 without refresh token cookie", async () => {
            const res = await makeUnauthRequest(app, "/api/auth/refresh", { method: "POST" })
            expect(res.status).toBe(401)
        })

        it("refreshes token with valid refresh cookie", async () => {
            const jwt = await import("jsonwebtoken")
            const refreshToken = jwt.default.sign(
                { userId: TEST_USER.id },
                process.env.REFRESH_TOKEN_SECRET!,
                { expiresIn: "7d" }
            )

            const res = await app.request("http://localhost/api/auth/refresh", {
                method: "POST",
                headers: {
                    Cookie: `refresh_token=${refreshToken}`,
                },
            })
            expect(res.status).toBe(200)
            const json = await res.json()
            expect(json.success).toBe(true)
        })
    })

    // ══════════════════════════════════════════════
    // POST /api/auth/logout
    // ══════════════════════════════════════════════
    describe("POST /api/auth/logout", () => {
        it("clears auth cookies on logout", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)

            const res = await makeRequest(app, "/api/auth/logout", { method: "POST" })
            expect(res.status).toBe(200)
            const json = await res.json()
            expect(json.message).toMatch(/logout/i)
        })

        it("returns 401 when not authenticated", async () => {
            const res = await makeUnauthRequest(app, "/api/auth/logout", { method: "POST" })
            expect(res.status).toBe(401)
        })
    })

    // ══════════════════════════════════════════════
    // PATCH /api/auth/profile
    // ══════════════════════════════════════════════
    describe("PATCH /api/auth/profile", () => {
        it("updates profile name", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.user.update.mockResolvedValue({ ...TEST_USER, name: "Updated Name" })

            const res = await makeRequest(app, "/api/auth/profile", {
                method: "PATCH",
                body: { name: "Updated Name" },
            })
            expect(res.status).toBe(200)
            const json = await res.json()
            expect(json.data.name).toBe("Updated Name")
        })

        it("rejects duplicate phone number", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.user.findFirst.mockResolvedValue({ id: "someone-else" })

            const res = await makeRequest(app, "/api/auth/profile", {
                method: "PATCH",
                body: { name: "Test", phone: "9999999999" },
            })
            expect(res.status).toBe(400)
            const json = await res.json()
            expect(json.error).toMatch(/phone/i)
        })

        it("returns 401 when not authenticated", async () => {
            const res = await makeUnauthRequest(app, "/api/auth/profile", {
                method: "PATCH",
                body: { name: "Hacker" },
            })
            expect(res.status).toBe(401)
        })
    })

    // ══════════════════════════════════════════════
    // PATCH /api/auth/settings
    // ══════════════════════════════════════════════
    describe("PATCH /api/auth/settings", () => {
        it("updates user settings", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.user.update.mockResolvedValue({ ...TEST_USER, currencyCode: "USD" })
            prismaMock.notificationPreference.findFirst.mockResolvedValue(null)
            prismaMock.notificationPreference.create.mockResolvedValue({})

            const res = await makeRequest(app, "/api/auth/settings", {
                method: "PATCH",
                body: { currencyCode: "USD", reminderDaysBefore: 5 },
            })
            expect(res.status).toBe(200)
        })
    })

    // ══════════════════════════════════════════════
    // PATCH /api/auth/change-password
    // ══════════════════════════════════════════════
    describe("PATCH /api/auth/change-password", () => {
        it("changes password with correct current password", async () => {
            const hashed = await bcrypt.hash("oldpassword", 10)
            prismaMock.user.findUnique.mockResolvedValue({ ...TEST_USER, password: hashed })
            prismaMock.user.update.mockResolvedValue(TEST_USER)

            const res = await makeRequest(app, "/api/auth/change-password", {
                method: "PATCH",
                body: { currentPassword: "oldpassword", newPassword: "newpassword123" },
            })
            expect(res.status).toBe(200)
        })

        it("rejects wrong current password", async () => {
            const hashed = await bcrypt.hash("oldpassword", 10)
            prismaMock.user.findUnique.mockResolvedValue({ ...TEST_USER, password: hashed })

            const res = await makeRequest(app, "/api/auth/change-password", {
                method: "PATCH",
                body: { currentPassword: "wrongpassword", newPassword: "newpassword123" },
            })
            expect(res.status).toBe(400)
        })
    })

    // ══════════════════════════════════════════════
    // DELETE /api/auth/account
    // ══════════════════════════════════════════════
    describe("DELETE /api/auth/account", () => {
        it("deletes the user account", async () => {
            prismaMock.user.findUnique.mockResolvedValue(TEST_USER)
            prismaMock.user.delete.mockResolvedValue(TEST_USER)

            const res = await makeRequest(app, "/api/auth/account", { method: "DELETE" })
            expect(res.status).toBe(200)
            const json = await res.json()
            expect(json.message).toMatch(/deleted/i)
        })

        it("returns 401 when not authenticated", async () => {
            const res = await makeUnauthRequest(app, "/api/auth/account", { method: "DELETE" })
            expect(res.status).toBe(401)
        })
    })
})
