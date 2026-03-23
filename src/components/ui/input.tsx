import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-lg border bg-white/[0.04] border-white/[0.08] px-3 py-2 text-sm text-white shadow-sm transition-colors",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white",
        "placeholder:text-[#4A5568]",
        "focus-visible:outline-none focus-visible:border-[#00D4AA]/50 focus-visible:ring-1 focus-visible:ring-[#00D4AA]/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-[#EF4444]/50 aria-invalid:ring-[#EF4444]/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
