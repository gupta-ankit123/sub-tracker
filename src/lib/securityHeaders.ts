import { createMiddleware } from "hono/factory"

/**
 * Security headers middleware.
 * Adds OWASP-recommended headers to all API responses.
 */
export const securityHeaders = createMiddleware(async (c, next) => {
    await next()

    // Prevent clickjacking
    c.header("X-Frame-Options", "DENY")

    // Prevent MIME-type sniffing
    c.header("X-Content-Type-Options", "nosniff")

    // Control referrer information
    c.header("Referrer-Policy", "strict-origin-when-cross-origin")

    // Restrict browser features
    c.header(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=(), payment=()"
    )

    // XSS protection (legacy browsers)
    c.header("X-XSS-Protection", "1; mode=block")

    // HSTS - enforce HTTPS (only in production)
    if (process.env.NODE_ENV === "production") {
        c.header(
            "Strict-Transport-Security",
            "max-age=31536000; includeSubDomains"
        )
    }

    // Content Security Policy for API responses
    c.header(
        "Content-Security-Policy",
        "default-src 'none'; frame-ancestors 'none'"
    )
})
