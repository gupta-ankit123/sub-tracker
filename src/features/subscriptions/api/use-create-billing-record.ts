import { toast } from "sonner"
import { client } from "@/lib/rpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { InferRequestType, InferResponseType } from "hono"

type RequestType = InferRequestType<typeof client.api.subscriptions["billing-history"]["$post"]>
type ResponseType = InferResponseType<typeof client.api.subscriptions["billing-history"]["$post"]>

export const useCreateBillingRecord = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json }) => {
            const response = await client.api.subscriptions["billing-history"]["$post"]({ json })

            if (!response.ok) {
                const errorData = await response.json() as { error?: string }
                throw new Error(errorData.error || "Failed to create billing record")
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success("Payment recorded successfully")
            queryClient.invalidateQueries({ queryKey: ["billing-history"] })
        },
        onError: (error) => {
            toast.error(error.message || "Failed to record payment")
        },
    })
    return mutation;
}
