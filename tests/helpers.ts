import { Hono } from "hono"
import jwt from "jsonwebtoken"

// ── Fake user data ──
export const TEST_USER = {
    id: "user-test-123",
    name: "Test User",
    email: "test@example.com",
    password: "$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012", // bcrypt hash placeholder
    emailVerified: true,
    phone: null,
    currencyCode: "INR",
    timezone: "Asia/Kolkata",
    emailNotifications: true,
    pushNotifications: false,
    monthlyIncome: 50000,
    otpCode: null,
    otpExpiry: null,
    lastLoginAt: new Date(),
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date(),
}

export const OTHER_USER = {
    ...TEST_USER,
    id: "user-other-456",
    name: "Other User",
    email: "other@example.com",
}

// ── Auth cookie helper ──
export function createAuthCookie(userId: string = TEST_USER.id): string {
    const token = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: "1h" })
    return `auth_token=${token}`
}

// ── Request helpers ──
type RequestInit = {
    method?: string
    headers?: Record<string, string>
    body?: unknown
}

export function makeRequest(app: Hono, path: string, options: RequestInit = {}) {
    const { method = "GET", headers = {}, body } = options
    const url = `http://localhost${path}`

    const reqHeaders: Record<string, string> = {
        Cookie: createAuthCookie(),
        ...headers,
    }

    if (body) {
        reqHeaders["Content-Type"] = "application/json"
    }

    return app.request(url, {
        method,
        headers: reqHeaders,
        body: body ? JSON.stringify(body) : undefined,
    })
}

export function makeUnauthRequest(app: Hono, path: string, options: RequestInit = {}) {
    const { method = "GET", headers = {}, body } = options
    const url = `http://localhost${path}`

    const reqHeaders: Record<string, string> = { ...headers }
    if (body) {
        reqHeaders["Content-Type"] = "application/json"
    }

    return app.request(url, {
        method,
        headers: reqHeaders,
        body: body ? JSON.stringify(body) : undefined,
    })
}
