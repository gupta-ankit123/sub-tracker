import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import auth from "@/features/auth/server/route"
import subscriptions from "@/features/subscriptions/server/route"

const app = new Hono().basePath("/api");

const routes = app
    .route("/auth", auth)
    .route("/subscriptions", subscriptions)

export const GET = handle(app)
export const POST = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)

export type AppType = typeof routes;