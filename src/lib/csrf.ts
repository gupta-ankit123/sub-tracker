import { createMiddleware } from "hono/factory"

/**
 * CSRF protection middleware.
 * Validates Origin/Referer headers on state-changing requests (POST, PATCH, PUT, DELETE).
 * Allows same-origin requests and rejects cross-origin mutations.
 */
export const csrfProtection = createMiddleware(async (c, next) => {
    const method = c.req.method.toUpperCase()

    // Only check state-changing methods
    if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
        await next()
        return
    }

    const origin = c.req.header("origin")
    const referer = c.req.header("referer")
    const host = c.req.header("host")

    // In development, allow requests without origin (e.g., Postman, curl)
    if (process.env.NODE_ENV !== "production") {
        if (!origin && !referer) {
            await next()
            return
        }
    }

    // Validate origin matches host
    if (origin) {
        try {
            const originUrl = new URL(origin)
            if (originUrl.host === host) {
                await next()
                return
            }
        } catch {
            // Invalid origin URL — reject
        }
    }

    // Fallback: validate referer matches host
    if (referer) {
        try {
            const refererUrl = new URL(referer)
            if (refererUrl.host === host) {
                await next()
                return
            }
        } catch {
            // Invalid referer URL — reject
        }
    }

    // In production, reject if neither header matches
    if (process.env.NODE_ENV === "production") {
        return c.json({ error: "CSRF validation failed" }, 403)
    }

    // In development, allow through with a warning header
    c.header("X-CSRF-Warning", "Origin/Referer mismatch — would be blocked in production")
    await next()
})
