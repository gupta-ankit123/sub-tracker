import { createMiddleware } from "hono/factory"
import { deleteCookie, getCookie } from "hono/cookie"
import { verifyToken } from "./jwt"
import { prisma } from "./db"
import { User } from "@/app/generated/prisma/client"

type AdditionalContext = {
    Variables: {
        user: User
    }

}

export const sessionMiddleware = createMiddleware<AdditionalContext>(async (c, next) => {
    const token = getCookie(c, "auth_token")

    if (!token) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    try {
        const payload = verifyToken(token);
        const userId = typeof payload === 'string' ? payload : payload.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId as string }
        })

        if (!user) {
            deleteCookie(c, "auth_token");
            return c.json({ error: "Unauthorized" }, 401);
        }

        c.set("user", user);
        await next();
    } catch (error) {
        deleteCookie(c, "auth_token");

        return c.json({ error: "Unauthorized" }, 401);
    }
})


// TODO in auth:
// Rate limiting - Add @hono/rate-limiter to prevent brute force
// Token refresh - Add / auth / refresh endpoint to extend sessions
// Email verification - Add email verification flow
// Password reset - Add forgot / reset password functionality