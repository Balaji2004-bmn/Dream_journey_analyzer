import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cosmicButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        cosmic: "bg-primary text-primary-foreground hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-300",
        nebula: "bg-accent text-primary-foreground hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-300",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground border border-accent/20 backdrop-blur-sm",
        outline: "border border-primary/30 bg-background/50 backdrop-blur-sm hover:bg-gray-400/20 hover:text-primary",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "cosmic",
      size: "default",
    },
  }
)

const CosmicButton = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(cosmicButtonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
CosmicButton.displayName = "CosmicButton"

export { CosmicButton, cosmicButtonVariants }