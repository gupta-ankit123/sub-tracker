import { client } from "@/lib/rpc"
import { useQuery } from "@tanstack/react-query"
import { InferResponseType } from "hono"

type ResponseType = InferResponseType<typeof client.api.budgets["$get"]>

export const useBudgets = (month?: string) => {
    return useQuery<ResponseType>({
        queryKey: ["budgets", month],
        queryFn: async () => {
            const response = await client.api.budgets["$get"]({
                query: month ? { month } : {},
            })
            if (!response.ok) throw new Error("Failed to fetch budgets")
            return await response.json()
        },
    })
}
