import { client } from "@/lib/rpc"
import { useQuery } from "@tanstack/react-query"
import { InferResponseType } from "hono"

type ResponseType = InferResponseType<typeof client.api.budgets[":id"]["expenses"]["$get"], 200>

export const useBudgetExpenses = (budgetId?: string) => {
    return useQuery<ResponseType>({
        queryKey: ["budget-expenses", budgetId],
        queryFn: async () => {
            const response = await client.api.budgets[":id"]["expenses"]["$get"]({
                param: { id: budgetId! },
            })
            if (!response.ok) throw new Error("Failed to fetch expenses")
            return await response.json() as ResponseType
        },
        enabled: !!budgetId,
    })
}
