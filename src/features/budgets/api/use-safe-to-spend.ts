import { client } from "@/lib/rpc"
import { useQuery } from "@tanstack/react-query"
import { InferResponseType } from "hono"

type ResponseType = InferResponseType<typeof client.api.budgets["safe-to-spend"]["$get"]>

export const useSafeToSpend = (month?: string) => {
    return useQuery<ResponseType>({
        queryKey: ["safe-to-spend", month],
        queryFn: async () => {
            const response = await client.api.budgets["safe-to-spend"]["$get"]({
                query: month ? { month } : {},
            })
            if (!response.ok) throw new Error("Failed to fetch safe-to-spend")
            return await response.json()
        },
    })
}
