import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/db";

export const getCurrent = async () => {
    try {
        const token = (await cookies()).get("auth_token")?.value;

        if (!token) return null;

        const decoded = verifyToken(token) as { userId: string };

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        return user;
    } catch {
        return null;
    }
};