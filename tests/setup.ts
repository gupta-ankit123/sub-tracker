import { vi } from "vitest"

// ── Stub environment variables BEFORE any module loads ──
process.env.ACCESS_TOKEN_SECRET = "test-access-secret-key-32chars!!"
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-key-32chars!"
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test"
process.env.NODE_ENV = "test"
process.env.EMAIL_FROM = "test@example.com"

// ── Mock Prisma ──
// We create a deep mock that returns chainable objects by default.
// Individual tests override return values via mockResolvedValue.

function createPrismaMock() {
    const handler: ProxyHandler<any> = {
        get(target, prop) {
            if (prop in target) return target[prop]
            // Create a chainable mock for any model access
            const modelMock = {
                findMany: vi.fn().mockResolvedValue([]),
                findFirst: vi.fn().mockResolvedValue(null),
                findUnique: vi.fn().mockResolvedValue(null),
                create: vi.fn().mockResolvedValue({}),
                createMany: vi.fn().mockResolvedValue({ count: 0 }),
                update: vi.fn().mockResolvedValue({}),
                upsert: vi.fn().mockResolvedValue({}),
                delete: vi.fn().mockResolvedValue({}),
                count: vi.fn().mockResolvedValue(0),
            }
            target[prop] = modelMock
            return modelMock
        },
    }
    return new Proxy({} as any, handler)
}

export const prismaMock = createPrismaMock()

vi.mock("@/lib/db", () => ({
    prisma: prismaMock,
}))

// ── Mock Resend ──
vi.mock("@/lib/resend", () => ({
    resend: {
        emails: {
            send: vi.fn().mockResolvedValue({ data: { id: "mock-email-id" }, error: null }),
        },
    },
}))
