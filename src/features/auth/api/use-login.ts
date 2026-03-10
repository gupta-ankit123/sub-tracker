import { toast } from "sonner"
import { client } from "@/lib/rpc"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { InferRequestType, InferResponseType } from "hono"
import { useRouter } from "next/navigation"

type RequestType = InferRequestType<typeof client.api.auth.login["$post"]>
type ResponseType = InferResponseType<typeof client.api.auth.login["$post"]>

export const useLogin = () => {
    const router = useRouter()
    const queryClient = useQueryClient()

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json }) => {
            const response = await client.api.auth.login["$post"]({ json })

            if (!response.ok) {
                const errorData = await response.json() as { error?: string; message?: string }
                throw new Error(errorData.error || errorData.message || "Failed to login")
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success("Logged In")
            router.push("/")
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ["current"] })
        },
        onError: (error) => {
            toast.error(error.message || "Failed to Log in")
        }
    })
    return mutation;
}