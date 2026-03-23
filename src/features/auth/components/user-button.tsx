"use client"
import {
    Avatar,
    AvatarFallback
} from "@/components/ui/avatar"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import { useLogout } from "../api/use-logout"
import { useCurrent } from "../api/use-current"
import { Loader, LogOut } from "lucide-react"

export const UserButton = () => {
    const { data: user, isLoading } = useCurrent();
    const { mutate: logout } = useLogout();
    if (isLoading) {
        return (
            <div className="size-9 rounded-full flex items-center justify-center bg-white/[0.06] border border-white/[0.08]">
                <Loader className="size-4 animate-spin text-[#5A6B82]" />
            </div>
        )
    }
    if (!user) {
        return null;
    }

    const { name, email } = user;
    const avatarFallback = name ? name.charAt(0).toUpperCase()
        : email.charAt(0).toUpperCase() ?? "U"

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="outline-none relative">
                <Avatar className="size-9 hover:ring-2 hover:ring-[#00D4AA]/30 transition-all duration-200 border border-white/[0.1]">
                    <AvatarFallback className="bg-gradient-to-br from-[#00D4AA]/20 to-[#3B82F6]/20 text-sm font-semibold text-[#00D4AA] flex items-center justify-center">
                        {avatarFallback}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                side="bottom"
                className="w-64 bg-[#111827] border-white/[0.08] shadow-2xl shadow-black/40"
                sideOffset={10}
            >
                <div className="flex flex-col items-center justify-center gap-2.5 px-3 py-5">
                    <Avatar className="size-14 border border-white/[0.1]">
                        <AvatarFallback className="bg-gradient-to-br from-[#00D4AA]/20 to-[#3B82F6]/20 text-lg font-bold text-[#00D4AA] flex items-center justify-center">
                            {avatarFallback}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-sm font-semibold text-white">
                            {name || "User"}
                        </p>
                        <p className="text-xs text-[#5A6B82]">
                            {email}
                        </p>
                    </div>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mx-2 mb-1" />
                <DropdownMenuItem
                    onClick={() => logout()}
                    className="h-10 flex items-center justify-center text-red-400 hover:text-red-300 font-medium cursor-pointer mx-1 mb-1 rounded-md hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300"
                >
                    <LogOut className="size-4 mr-2" />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
