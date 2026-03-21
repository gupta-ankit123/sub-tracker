import { toast } from "sonner"
import { client } from "@/lib/rpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { InferRequestType, InferResponseType } from "hono"

type RequestType = InferRequestType<typeof client.api.budgets[":id"]["$patch"]>
type ResponseType = InferResponseType<typeof client.api.budgets[":id"]["$patch"]>

export const useUpdateBudget = () => {
    const queryClient = useQueryClient()
    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param, json }) => {
            const response = await client.api.budgets[":id"]["$patch"]({ param, json })
            if (!response.ok) {
                const err = await response.json() as { error?: string }
                throw new Error(err.error || "Failed to update budget")
            }
            return await response.json()
        },
        onSuccess: () => {
            toast.success("Budget updated")
            queryClient.invalidateQueries({ queryKey: ["budgets"] })
            queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] })
        },
        onError: (error) => toast.error(error.message),
    })
}
