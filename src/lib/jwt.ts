import jwt from "jsonwebtoken"
import type { Context } from "hono";
import { setCookie, getCookie } from "hono/cookie"


const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const isProduction = process.env.NODE_ENV === "production";

if (!ACCESS_SECRET || !REFRESH_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET environment variable is required")
}

export const createAccessToken = (userId: string) => {
    return jwt.sign({ userId }, ACCESS_SECRET, {
        expiresIn: "15m",
    });
};

export const createRefreshToken = (userId: string) => {
    return jwt.sign({ userId }, REFRESH_SECRET, {
        expiresIn: "7d",
    });
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, ACCESS_SECRET) as jwt.JwtPayload & { userId: string };
}

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, REFRESH_SECRET) as jwt.JwtPayload & { userId: string };
}

export const setAccessCookie = (c: Context, token: string) => {
    setCookie(c, "auth_token", token, {
        httpOnly: true,
        sameSite: "Strict",
        secure: isProduction,
        path: "/"
    });
};

export const setRefreshCookie = (c: Context, token: string) => {
    setCookie(c, "refresh_token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "Strict",
        path: "/"
    });
};

export const getRefreshTokenFromCookie = (c: Context) => {
    return getCookie(c, "refresh_token");
};