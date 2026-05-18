import { getCurrent } from "@/features/auth/action";
import { redirect } from "next/navigation";
import { SetupWizard } from "@/features/auth/components/setup-wizard";

export default async function SetupPage() {
    const user = await getCurrent();
    if (!user) {
        redirect("/sign-in");
    }

    if (user.onboardingCompleted) {
        redirect("/dashboard");
    }

    return <SetupWizard userName={user.name} />;
}
