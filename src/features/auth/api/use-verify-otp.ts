import { toast } from "sonner";
import { client } from "@/lib/rpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { InferRequestType, InferResponseType } from "hono"
import { useRouter } from "next/navigation";

type RequestType = InferRequestType<typeof client.api.auth["verify-otp"]["$post"]>
type ResponseType = InferResponseType<typeof client.api.auth["verify-otp"]["$post"]>

export const useVerifyOtp = () => {
    const router = useRouter()
    const queryClient = useQueryClient()

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json }) => {
            const response = await client.api.auth["verify-otp"]["$post"]({ json })

            if (!response.ok) {
                const errorData = await response.json() as { error?: string; message?: string }
                throw new Error(errorData.error || errorData.message || "Failed to verify OTP")
            }
            return await response.json()
        },
        onSuccess: () => {
            toast.success("Email verified successfully!")
            router.push("/sign-in")
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ["current"] })
        },
        onError: (error) => {
            toast.error(error.message || "Invalid or expired OTP")
        },
    });
    return mutation;
}
