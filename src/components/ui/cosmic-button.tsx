import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cosmicButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        cosmic: "bg-gradient-dream text-primary-foreground hover:shadow-glow-primary hover:scale-105 transition-all duration-300",
        nebula: "bg-gradient-nebula text-primary-foreground hover:shadow-glow-accent hover:scale-105 transition-all duration-300",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground border border-accent/20 backdrop-blur-sm",
        outline: "border border-primary/30 bg-background/50 backdrop-blur-sm hover:bg-primary/10 hover:text-primary",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "cosmic",
      size: "default",
    },
  }
)

export interface CosmicButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof cosmicButtonVariants> {
  asChild?: boolean
}

const CosmicButton = React.forwardRef<HTMLButtonElement, CosmicButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(cosmicButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
CosmicButton.displayName = "CosmicButton"

export { CosmicButton, cosmicButtonVariants }