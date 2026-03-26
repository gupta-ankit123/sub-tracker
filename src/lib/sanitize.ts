/**
 * Input sanitization utilities.
 * Strips potentially dangerous HTML/script content from user input.
 */

/** Remove HTML tags and script content from a string */
export function stripHtml(input: string): string {
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<[^>]*>/g, "")
}

/** Escape HTML special characters to prevent XSS */
export function escapeHtml(input: string): string {
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
}

/** Sanitize a string: trim, strip HTML, and collapse whitespace */
export function sanitizeString(input: string): string {
    return stripHtml(input).replace(/\s+/g, " ").trim()
}

/**
 * Recursively sanitize all string values in an object.
 * Useful for sanitizing parsed request bodies.
 */
export function sanitizeObject<T>(obj: T): T {
    if (typeof obj === "string") {
        return sanitizeString(obj) as T
    }
    if (Array.isArray(obj)) {
        return obj.map(sanitizeObject) as T
    }
    if (obj !== null && typeof obj === "object") {
        const result: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
            result[key] = sanitizeObject(value)
        }
        return result as T
    }
    return obj
}
