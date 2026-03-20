import { getCurrent } from "@/features/auth/action";
import { redirect } from "next/navigation";
import { SettingsContent } from "@/features/auth/components/settings-content";

export default async function SettingsPage() {
    const user = await getCurrent();
    if (!user) {
        redirect('/sign-in')
    }

    return <SettingsContent />
}
