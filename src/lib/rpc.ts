import { hc } from "hono/client";

import { AppType } from "@/app/api/[[...route]]/route";

// Use the current page's origin on the client so API calls are always same-origin,
// regardless of whether the user is on www.ezbudget.in or ezbudget.in.
// Fall back to NEXT_PUBLIC_APP_URL for SSR contexts.
const baseUrl =
    typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL!

export const client = hc<AppType>(baseUrl)

