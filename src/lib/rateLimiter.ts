import { createMiddleware } from "hono/factory"

interface RateLimitEntry {
    count: number
    resetAt: number
}

interface RateLimiterOptions {
    windowMs: number   // Time window in milliseconds
    max: number        // Max requests per window
    message?: string   // Custom error message
    keyGenerator?: (c: any) => string // Custom key generator (default: IP)
}

// In-memory store. For multi-instance deployments, replace with Redis.
const stores = new Map<string, Map<string, RateLimitEntry>>()

function getStore(name: string): Map<string, RateLimitEntry> {
    if (!stores.has(name)) {
        stores.set(name, new Map())
    }
    return stores.get(name)!
}

// Periodic cleanup of expired entries (every 60s)
setInterval(() => {
    const now = Date.now()
    for (const store of stores.values()) {
        for (const [key, entry] of store) {
            if (now > entry.resetAt) {
                store.delete(key)
            }
        }
    }
}, 60_000)

function getClientIp(c: any): string {
    // Check common proxy headers first
    const forwarded = c.req.header("x-forwarded-for")
    if (forwarded) {
        return forwarded.split(",")[0].trim()
    }
    const realIp = c.req.header("x-real-ip")
    if (realIp) {
        return realIp
    }
    // Fallback
    return "unknown"
}

/**
 * Creates a rate limiting middleware for Hono.
 * @param name - Unique name for this limiter's store
 * @param options - Rate limiting configuration
 */
export function rateLimiter(name: string, options: RateLimiterOptions) {
    const {
        windowMs,
        max,
        message = "Too many requests, please try again later.",
        keyGenerator,
    } = options

    const store = getStore(name)

    return createMiddleware(async (c, next) => {
        const key = keyGenerator ? keyGenerator(c) : getClientIp(c)
        const now = Date.now()
        const entry = store.get(key)

        if (!entry || now > entry.resetAt) {
            // New window
            store.set(key, { count: 1, resetAt: now + windowMs })
            c.header("X-RateLimit-Limit", max.toString())
            c.header("X-RateLimit-Remaining", (max - 1).toString())
            c.header("X-RateLimit-Reset", Math.ceil((now + windowMs) / 1000).toString())
            await next()
            return
        }

        entry.count++

        const remaining = Math.max(0, max - entry.count)
        c.header("X-RateLimit-Limit", max.toString())
        c.header("X-RateLimit-Remaining", remaining.toString())
        c.header("X-RateLimit-Reset", Math.ceil(entry.resetAt / 1000).toString())

        if (entry.count > max) {
            const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
            c.header("Retry-After", retryAfter.toString())
            return c.json({ error: message }, 429)
        }

        await next()
    })
}

// Pre-configured limiters for common use cases

/** Strict: 5 requests per minute (login, reset-password) */
export const authStrictLimiter = rateLimiter("auth-strict", {
    windowMs: 60_000,
    max: 5,
    message: "Too many attempts. Please try again in a minute.",
})

/** Very strict: 3 requests per minute (OTP verify, register, forgot-password) */
export const authTightLimiter = rateLimiter("auth-tight", {
    windowMs: 60_000,
    max: 3,
    message: "Too many attempts. Please wait before trying again.",
})

/** Moderate: 20 requests per minute (subscription/budget writes) */
export const writeLimiter = rateLimiter("writes", {
    windowMs: 60_000,
    max: 20,
    message: "Too many requests. Please slow down.",
})

/** General API: 100 requests per minute */
export const generalLimiter = rateLimiter("general", {
    windowMs: 60_000,
    max: 100,
    message: "Rate limit exceeded. Please try again later.",
})
