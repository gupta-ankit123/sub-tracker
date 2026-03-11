import { toast } from "sonner"
import { client } from "@/lib/rpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { InferRequestType, InferResponseType } from "hono"

type RequestType = InferRequestType<typeof client.api.subscriptions["billing-history"][":id"]["$patch"]>
type ResponseType = InferResponseType<typeof client.api.subscriptions["billing-history"][":id"]["$patch"]>

export const useUpdatePaymentStatus = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json, param }) => {
            const response = await client.api.subscriptions["billing-history"][":id"]["$patch"]({ json, param })

            if (!response.ok) {
                const errorData = await response.json() as { error?: string }
                throw new Error(errorData.error || "Failed to update payment status")
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success("Payment status updated")
            queryClient.invalidateQueries({ queryKey: ["billing-history"] })
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update payment status")
        },
    })
    return mutation;
}
