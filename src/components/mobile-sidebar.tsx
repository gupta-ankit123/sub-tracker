"use client"

import { MenuIcon } from "lucide-react"
import { Button } from "./ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet"
import { Sidebar } from "./sidebar"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export const MobileSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    return (
        <Sheet modal={false} open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden size-9 text-[#7A8BA8] hover:text-white hover:bg-white/[0.06]"
                >
                    <MenuIcon className="size-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[260px] bg-[#0D1220] border-r border-white/[0.06]">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <Sidebar />
            </SheetContent>
        </Sheet>
    )
}
