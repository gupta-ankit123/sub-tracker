import { toast } from "sonner"
import { client } from "@/lib/rpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { InferRequestType, InferResponseType } from "hono"

type RequestType = InferRequestType<typeof client.api.budgets.expenses["$post"]>
type ResponseType = InferResponseType<typeof client.api.budgets.expenses["$post"]>

export const useCreateExpense = () => {
    const queryClient = useQueryClient()
    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.budgets.expenses["$post"]({ json })
            if (!response.ok) {
                const err = await response.json() as { error?: string }
                throw new Error(err.error || "Failed to create expense")
            }
            return await response.json()
        },
        onSuccess: () => {
            toast.success("Expense logged")
            queryClient.invalidateQueries({ queryKey: ["budgets"] })
            queryClient.invalidateQueries({ queryKey: ["budget-expenses"] })
            queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] })
        },
        onError: (error) => toast.error(error.message),
    })
}
