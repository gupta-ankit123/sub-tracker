import { toast } from "sonner"
import { client } from "@/lib/rpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { InferRequestType, InferResponseType } from "hono"

type RequestType = InferRequestType<typeof client.api.subscriptions[":id"]["skip-payment"]["$post"]>
type ResponseType = InferResponseType<typeof client.api.subscriptions[":id"]["skip-payment"]["$post"]>

export const useSkipPayment = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ param }) => {
            const response = await client.api.subscriptions[":id"]["skip-payment"]["$post"]({ param })

            if (!response.ok) {
                const errorData = await response.json() as { error?: string }
                throw new Error(errorData.error || "Failed to skip payment")
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success("Payment skipped for this month")
            queryClient.invalidateQueries({ queryKey: ["subscriptions"] })
        },
        onError: (error) => {
            toast.error(error.message || "Failed to skip payment")
        },
    })
    return mutation;
}
