import { toast } from "sonner"
import { client } from "@/lib/rpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { InferRequestType, InferResponseType } from "hono"

type RequestType = InferRequestType<typeof client.api.budgets.income["$patch"]>
type ResponseType = InferResponseType<typeof client.api.budgets.income["$patch"]>

export const useUpdateIncome = () => {
    const queryClient = useQueryClient()
    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.budgets.income["$patch"]({ json })
            if (!response.ok) {
                const err = await response.json() as { error?: string }
                throw new Error(err.error || "Failed to update income")
            }
            return await response.json()
        },
        onSuccess: () => {
            toast.success("Income updated")
            queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] })
            queryClient.invalidateQueries({ queryKey: ["current"] })
        },
        onError: (error) => toast.error(error.message),
    })
}
