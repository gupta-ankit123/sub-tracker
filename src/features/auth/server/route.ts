import { Hono } from "hono";
import type { Context } from "hono";
import { zValidator } from "@hono/zod-validator"
import { loginSchema, registerSchema } from "../schemas";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { deleteCookie, setCookie } from "hono/cookie"
import { signToken } from "@/lib/jwt";
import { sessionMiddleware } from "@/lib/sessionMiddleware";

const isProduction = process.env.NODE_ENV === "production";

const setAuthCookie = (c: Context, token: string) => {
    setCookie(c, "auth_token", token, {
        httpOnly: true,
        sameSite: "Strict",
        secure: isProduction,
        maxAge: 60 * 60 * 24 * 7,
        path: "/"
    });
}

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

        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
            return c.json({ error: "Invalid Credentials" }, 400)
        }

        // Update lastLoginAt timestamp
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        })

        const token = signToken(user.id);

        setAuthCookie(c, token);

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

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,

            },
        });

        const token = signToken(user.id);
        setAuthCookie(c, token);

        return c.json({
            message: "Registration successful",
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        })

    })
    .post("/logout", sessionMiddleware, async (c) => {
        deleteCookie(c, "auth_token")
        return c.json({ message: "Logout successful" })
    })

export default app;