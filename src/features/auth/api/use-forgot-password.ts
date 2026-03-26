import { toast } from "sonner"
import { client } from "@/lib/rpc"
import { useMutation } from "@tanstack/react-query"
import { InferRequestType, InferResponseType } from "hono"
import { useRouter } from "next/navigation"

type RequestType = InferRequestType<typeof client.api.auth["forgot-password"]["$post"]>
type ResponseType = InferResponseType<typeof client.api.auth["forgot-password"]["$post"]>

export const useForgotPassword = () => {
    const router = useRouter()

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json }) => {
            const response = await client.api.auth["forgot-password"]["$post"]({ json })

            if (!response.ok) {
                const errorData = await response.json() as { error?: string }
                throw new Error(errorData.error || "Failed to send reset code")
            }

            return await response.json()
        },
        onSuccess: (_data, variables) => {
            toast.success("Reset code sent! Check your email.")
            router.push("/reset-password?email=" + encodeURIComponent(variables.json.email))
        },
        onError: (error) => {
            toast.error(error.message || "Failed to send reset code")
        }
    })
    return mutation
}
