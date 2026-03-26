import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import auth from "@/features/auth/server/route"
import subscriptions from "@/features/subscriptions/server/route"
import budgets from "@/features/budgets/server/route"
import { securityHeaders } from "@/lib/securityHeaders"
import { csrfProtection } from "@/lib/csrf"
import { generalLimiter, writeLimiter } from "@/lib/rateLimiter"

const app = new Hono().basePath("/api");

// Global security middleware
app.use("*", securityHeaders)
app.use("*", csrfProtection)
app.use("*", generalLimiter)

// Write rate limiting for subscription and budget mutations
app.use("/subscriptions/*", writeLimiter)
app.use("/budgets/*", writeLimiter)

const routes = app
    .route("/auth", auth)
    .route("/subscriptions", subscriptions)
    .route("/budgets", budgets)

export const GET = handle(app)
export const POST = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)

export type AppType = typeof routes;