import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/action";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";

interface DashboardLayoutProps {
    children: React.ReactNode;
};

const DashboardLayout = async ({ children }: DashboardLayoutProps) => {
    const user = await getCurrent();
    if (!user) {
        redirect("/sign-in");
    }

    return (
        <div className="min-h-screen bg-[#0B0F1A]">
            <div className="flex w-full h-full">
                {/* Sidebar */}
                <div className="fixed left-0 top-0 hidden lg:block lg:w-[260px] h-full overflow-y-auto">
                    <Sidebar />
                </div>

                {/* Main content */}
                <div className="lg:pl-[260px] w-full">
                    <Navbar />
                    <main className="h-full py-6 px-4 sm:px-6 lg:px-8 flex flex-col max-w-screen-2xl mx-auto">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default DashboardLayout;
