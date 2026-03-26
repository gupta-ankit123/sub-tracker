import { toast } from "sonner"
import { client } from "@/lib/rpc"
import { useMutation } from "@tanstack/react-query"
import { InferRequestType, InferResponseType } from "hono"
import { useRouter } from "next/navigation"

type RequestType = InferRequestType<typeof client.api.auth["reset-password"]["$post"]>
type ResponseType = InferResponseType<typeof client.api.auth["reset-password"]["$post"]>

export const useResetPassword = () => {
    const router = useRouter()

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json }) => {
            const response = await client.api.auth["reset-password"]["$post"]({ json })

            if (!response.ok) {
                const errorData = await response.json() as { error?: string }
                throw new Error(errorData.error || "Failed to reset password")
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success("Password reset successfully!")
            router.push("/sign-in")
        },
        onError: (error) => {
            toast.error(error.message || "Failed to reset password")
        }
    })
    return mutation
}
