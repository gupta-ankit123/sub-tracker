import { client } from "@/lib/rpc"
import { useQuery } from "@tanstack/react-query"
import { InferResponseType } from "hono"

type ResponseType = InferResponseType<typeof client.api.budgets.analytics["$get"]>

export const useBudgetAnalytics = (months?: number) => {
    return useQuery<ResponseType>({
        queryKey: ["budget-analytics", months],
        queryFn: async () => {
            const response = await client.api.budgets.analytics["$get"]({
                query: months ? { months: months.toString() } : {},
            })
            if (!response.ok) throw new Error("Failed to fetch analytics")
            return await response.json()
        },
    })
}
