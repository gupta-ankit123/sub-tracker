import { toast } from "sonner"
import { client } from "@/lib/rpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { InferRequestType, InferResponseType } from "hono"

type RequestType = InferRequestType<typeof client.api.budgets.expenses[":id"]["$delete"]>
type ResponseType = InferResponseType<typeof client.api.budgets.expenses[":id"]["$delete"]>

export const useDeleteExpense = () => {
    const queryClient = useQueryClient()
    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param }) => {
            const response = await client.api.budgets.expenses[":id"]["$delete"]({ param })
            if (!response.ok) {
                const err = await response.json() as { error?: string }
                throw new Error(err.error || "Failed to delete expense")
            }
            return await response.json()
        },
        onSuccess: () => {
            toast.success("Expense deleted")
            queryClient.invalidateQueries({ queryKey: ["budgets"] })
            queryClient.invalidateQueries({ queryKey: ["budget-expenses"] })
            queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] })
        },
        onError: (error) => toast.error(error.message),
    })
}
