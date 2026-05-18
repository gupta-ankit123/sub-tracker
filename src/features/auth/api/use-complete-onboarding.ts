import { toast } from "sonner"
import { client } from "@/lib/rpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { InferResponseType } from "hono"

type ResponseType = InferResponseType<typeof client.api.auth["complete-onboarding"]["$patch"]>

export const useCompleteOnboarding = () => {
    const queryClient = useQueryClient()
    return useMutation<ResponseType, Error>({
        mutationFn: async () => {
            const response = await client.api.auth["complete-onboarding"]["$patch"]()
            if (!response.ok) {
                const err = await response.json() as { error?: string }
                throw new Error(err.error || "Failed to complete onboarding")
            }
            return await response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["current"] })
        },
        onError: (error) => toast.error(error.message),
    })
}
