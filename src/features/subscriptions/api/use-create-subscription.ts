import { toast } from "sonner"
import { client } from "@/lib/rpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { InferRequestType, InferResponseType } from "hono"

type RequestType = InferRequestType<typeof client.api.subscriptions["$post"]>
type ResponseType = InferResponseType<typeof client.api.subscriptions["$post"]>

export const useCreateSubscription = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json }) => {
            const response = await client.api.subscriptions["$post"]({ json })

            if (!response.ok) {
                const errorData = await response.json() as { error?: string }
                throw new Error(errorData.error || "Failed to create subscription")
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success("Subscription created successfully")
            queryClient.invalidateQueries({ queryKey: ["subscriptions"] })
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create subscription")
        },
    })
    return mutation;
}
