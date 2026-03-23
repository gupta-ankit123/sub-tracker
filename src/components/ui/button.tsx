import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-transparent shadow-sm [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-[#00D4AA] text-[#0B0F1A] hover:bg-[#00BF99] border-[#00D4AA]/50 shadow-[#00D4AA]/20",
        destructive:
          "bg-[#EF4444] text-white hover:bg-[#DC2626] border-[#EF4444]/50",
        outline:
          "border border-white/[0.1] bg-white/[0.04] shadow-sm hover:bg-white/[0.08] hover:text-white text-[#C0CAD8]",
        secondary:
          "bg-white/[0.06] text-[#C0CAD8] hover:bg-white/[0.1] border-white/[0.08]",
        ghost: "border-transparent shadow-none hover:bg-white/[0.06] hover:text-white text-[#C0CAD8]",
        muted: "bg-white/[0.06] text-[#7A8BA8] hover:bg-white/[0.1] border-transparent shadow-none",
        teritary: "bg-[#00D4AA]/10 text-[#00D4AA] border-transparent hover:bg-[#00D4AA]/20 shadow-none"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3",
        xs: "h-7 rounded-md px-2 text-xs",
        lg: "h-12 rounded-md px-8",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
